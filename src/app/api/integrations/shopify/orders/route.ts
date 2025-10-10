import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Request validation schema
const orderLookupSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  order_id: z.string().min(1, 'Order ID is required'),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional()
});

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).substring(7);
  
  try {
    logger.info('Shopify order lookup request', { reqId });
    
    // Parse and validate request body
    const body = await req.json();
    const validatedData = orderLookupSchema.parse(body);
    
    const { user_id, order_id, customer_email, customer_phone } = validatedData;
    
    // Get user's Shopify integration
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('store_integrations')
      .select('shop_domain, access_token_encrypted, config')
      .eq('user_id', user_id)
      .eq('platform', 'shopify')
      .eq('status', 'active')
      .single();
    
    if (integrationError || !integration) {
      logger.warn('No active Shopify integration found', { reqId, user_id });
      return NextResponse.json({
        success: false,
        message: 'No active Shopify integration found for this user'
      }, { status: 404 });
    }
    
    // Decrypt access token
    const accessToken = await decryptCredential(integration.access_token_encrypted);
    
    // Fetch order from Shopify
    const orderData = await fetchShopifyOrder(
      integration.shop_domain,
      accessToken,
      order_id,
      customer_email,
      customer_phone
    );
    
    if (!orderData.success) {
      logger.warn('Order not found in Shopify', { 
        reqId, 
        user_id, 
        order_id,
        error: orderData.error 
      });
      return NextResponse.json({
        success: false,
        message: orderData.error || 'Order not found'
      }, { status: 404 });
    }
    
    // Normalize order data for consistent response
    const normalizedOrder = normalizeShopifyOrderData(orderData.order, integration.config);
    
    logger.info('Shopify order lookup successful', { 
      reqId, 
      user_id, 
      order_id,
      order_status: normalizedOrder.status 
    });
    
    return NextResponse.json({
      success: true,
      order: normalizedOrder
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid request data for Shopify order lookup', { 
        reqId, 
        errors: error.errors 
      });
      return NextResponse.json({
        success: false,
        message: 'Invalid request data: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }
    
    logger.error('Shopify order lookup error', { 
      reqId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch order. Please try again later.'
    }, { status: 500 });
  }
}

/**
 * Fetch order from Shopify API
 */
async function fetchShopifyOrder(
  shopDomain: string,
  accessToken: string,
  orderId: string,
  customerEmail?: string,
  customerPhone?: string
) {
  try {
    const apiVersion = '2024-10';
    
    // Try to fetch order by name (order number) first
    let orderUrl = `https://${shopDomain}/admin/api/${apiVersion}/orders.json?name=${encodeURIComponent(orderId)}&limit=1`;
    
    let response = await fetch(orderUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'TrulyBot-Integration/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.orders && data.orders.length > 0) {
        const order = data.orders[0];
        
        // Verify customer if email or phone provided
        if (customerEmail || customerPhone) {
          const isAuthorized = verifyShopifyCustomerAccess(order, customerEmail, customerPhone);
          if (!isAuthorized) {
            return {
              success: false,
              error: 'Order not found or you are not authorized to view this order'
            };
          }
        }
        
        return {
          success: true,
          order
        };
      }
    }
    
    // If order name search fails, try searching by ID
    if (!isNaN(Number(orderId))) {
      orderUrl = `https://${shopDomain}/admin/api/${apiVersion}/orders/${orderId}.json`;
      
      response = await fetch(orderUrl, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
          'User-Agent': 'TrulyBot-Integration/1.0'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.order) {
          // Verify customer if email or phone provided
          if (customerEmail || customerPhone) {
            const isAuthorized = verifyShopifyCustomerAccess(data.order, customerEmail, customerPhone);
            if (!isAuthorized) {
              return {
                success: false,
                error: 'Order not found or you are not authorized to view this order'
              };
            }
          }
          
          return {
            success: true,
            order: data.order
          };
        }
      }
    }
    
    // If customer email provided, search by customer
    if (customerEmail) {
      const customerSearchUrl = `https://${shopDomain}/admin/api/${apiVersion}/orders.json?email=${encodeURIComponent(customerEmail)}&limit=50`;
      
      response = await fetch(customerSearchUrl, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
          'User-Agent': 'TrulyBot-Integration/1.0'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.orders) {
          // Look for order that matches the order ID/name
          const matchingOrder = data.orders.find((order: any) => 
            order.name === orderId || 
            order.id.toString() === orderId ||
            order.order_number.toString() === orderId
          );
          
          if (matchingOrder) {
            return {
              success: true,
              order: matchingOrder
            };
          }
        }
      }
    }
    
    return {
      success: false,
      error: 'Order not found'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order'
    };
  }
}

/**
 * Verify customer has access to the Shopify order
 */
function verifyShopifyCustomerAccess(order: any, customerEmail?: string, customerPhone?: string): boolean {
  if (customerEmail && order.email?.toLowerCase() === customerEmail.toLowerCase()) {
    return true;
  }
  
  if (customerPhone && order.shipping_address?.phone) {
    // Normalize phone numbers for comparison
    const normalizedOrderPhone = order.shipping_address.phone.replace(/[^\d]/g, '');
    const normalizedCustomerPhone = customerPhone.replace(/[^\d]/g, '');
    
    if (normalizedOrderPhone === normalizedCustomerPhone) {
      return true;
    }
  }
  
  if (customerPhone && order.billing_address?.phone) {
    // Normalize phone numbers for comparison
    const normalizedOrderPhone = order.billing_address.phone.replace(/[^\d]/g, '');
    const normalizedCustomerPhone = customerPhone.replace(/[^\d]/g, '');
    
    if (normalizedOrderPhone === normalizedCustomerPhone) {
      return true;
    }
  }
  
  return false;
}

/**
 * Normalize Shopify order data to standard format
 */
function normalizeShopifyOrderData(order: any, config: any) {
  return {
    id: order.id?.toString(),
    order_number: order.name || order.order_number?.toString(),
    status: order.financial_status === 'paid' ? 
      (order.fulfillment_status || 'unfulfilled') : 
      order.financial_status,
    status_label: getShopifyStatusLabel(order),
    total: parseFloat(order.total_price || '0'),
    currency: order.currency || config?.currency || 'USD',
    date_created: order.created_at,
    date_modified: order.updated_at,
    customer: {
      first_name: order.billing_address?.first_name || order.customer?.first_name || '',
      last_name: order.billing_address?.last_name || order.customer?.last_name || '',
      email: order.email || order.customer?.email || '',
      phone: order.billing_address?.phone || order.customer?.phone || ''
    },
    billing_address: {
      address_1: order.billing_address?.address1 || '',
      address_2: order.billing_address?.address2 || '',
      city: order.billing_address?.city || '',
      state: order.billing_address?.province || '',
      postcode: order.billing_address?.zip || '',
      country: order.billing_address?.country || ''
    },
    shipping_address: {
      address_1: order.shipping_address?.address1 || '',
      address_2: order.shipping_address?.address2 || '',
      city: order.shipping_address?.city || '',
      state: order.shipping_address?.province || '',
      postcode: order.shipping_address?.zip || '',
      country: order.shipping_address?.country || ''
    },
    items: (order.line_items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      total: parseFloat(item.price || '0') * item.quantity,
      product_id: item.product_id,
      sku: item.sku || null
    })),
    tracking_info: extractShopifyTrackingInfo(order),
    platform: 'shopify'
  };
}

/**
 * Get human-readable status label for Shopify orders
 */
function getShopifyStatusLabel(order: any): string {
  const financialStatus = order.financial_status;
  const fulfillmentStatus = order.fulfillment_status;
  
  // If order is paid, show fulfillment status
  if (financialStatus === 'paid') {
    switch (fulfillmentStatus) {
      case 'fulfilled': return 'Fulfilled';
      case 'partial': return 'Partially Fulfilled';
      case 'restocked': return 'Restocked';
      case null:
      case 'unfulfilled': return 'Processing';
      default: return fulfillmentStatus;
    }
  }
  
  // Otherwise show financial status
  switch (financialStatus) {
    case 'pending': return 'Pending Payment';
    case 'authorized': return 'Authorized';
    case 'partially_paid': return 'Partially Paid';
    case 'paid': return 'Paid';
    case 'partially_refunded': return 'Partially Refunded';
    case 'refunded': return 'Refunded';
    case 'voided': return 'Voided';
    default: return financialStatus;
  }
}

/**
 * Extract tracking information from Shopify order
 */
function extractShopifyTrackingInfo(order: any): any[] {
  const tracking = [];
  
  // Check fulfillments for tracking info
  if (order.fulfillments && Array.isArray(order.fulfillments)) {
    for (const fulfillment of order.fulfillments) {
      if (fulfillment.tracking_number) {
        tracking.push({
          provider: fulfillment.tracking_company || 'Unknown',
          number: fulfillment.tracking_number,
          url: fulfillment.tracking_url || null,
          date_shipped: fulfillment.created_at
        });
      }
    }
  }
  
  return tracking;
}

/**
 * Decrypt credentials from secure storage
 */
async function decryptCredential(encryptedCredential: string): Promise<string> {
  // In production, use proper decryption
  // For now, return base64 decoded (replace with actual decryption)
  return Buffer.from(encryptedCredential, 'base64').toString();
}