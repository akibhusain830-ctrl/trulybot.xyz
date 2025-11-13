import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { decryptCredential } from '@/lib/encryption';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Request validation schema
const orderLookupSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  order_id: z.string().min(1, 'Order ID is required'),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional()
});

export const POST = withRateLimit(async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  try {
    logger.info('WooCommerce order lookup request', { reqId });
    
    // Parse and validate request body
    const body = await req.json();
    const validatedData = orderLookupSchema.parse(body);
    
    const { user_id, order_id, customer_email, customer_phone } = validatedData;
    
    // Get user's WooCommerce integration
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('store_integrations')
      .select('store_url, api_key_encrypted, api_secret_encrypted, config')
      .eq('user_id', user_id)
      .eq('platform', 'woocommerce')
      .eq('status', 'active')
      .single();
    
    if (integrationError || !integration) {
      logger.warn('No active WooCommerce integration found', { reqId, user_id });
      return NextResponse.json({
        success: false,
        message: 'No active WooCommerce integration found for this user'
      }, { status: 404 });
    }
    
    // Decrypt API credentials
    const apiKey = await decryptCredential(integration.api_key_encrypted);
    const apiSecret = await decryptCredential(integration.api_secret_encrypted);
    
    // Fetch order from WooCommerce
    const orderData = await fetchWooCommerceOrder(
      integration.store_url,
      apiKey,
      apiSecret,
      order_id,
      customer_email,
      customer_phone
    );
    
    if (!orderData.success) {
      logger.warn('Order not found in WooCommerce', { 
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
    const normalizedOrder = normalizeOrderData(orderData.order, integration.config);
    
    logger.info('Order lookup successful', { 
      reqId, 
      user_id, 
      order_id,
      order_status: normalizedOrder.status 
    });
    
    const res = NextResponse.json({
      success: true,
      order: normalizedOrder
    });
    const dur = Date.now() - startTime;
    res.headers.set('Server-Timing', `api;desc="woocommerce_orders";dur=${dur}`);
    return res;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid request data for order lookup', { 
        reqId, 
        errors: error.errors 
      });
      return NextResponse.json({
        success: false,
        message: 'Invalid request data: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }
    
    logger.error('WooCommerce order lookup error', { 
      reqId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    const res = NextResponse.json({
      success: false,
      message: 'Failed to fetch order. Please try again later.'
    }, { status: 500 });
    const dur = Date.now() - startTime;
    res.headers.set('Server-Timing', `api;desc="woocommerce_orders_error";dur=${dur}`);
    return res;
  }
}, rateLimitConfigs.woocommerceOrders);

/**
 * Fetch order from WooCommerce API
 */
async function fetchWooCommerceOrder(
  storeUrl: string,
  apiKey: string,
  apiSecret: string,
  orderId: string,
  customerEmail?: string,
  customerPhone?: string
) {
  try {
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Try to fetch order by ID first
    let orderUrl = `${storeUrl}/wp-json/wc/v3/orders/${orderId}`;
    
    let response = await fetch(orderUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'TrulyBot-Integration/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const order = await response.json();
      
      // Verify customer if email or phone provided
      if (customerEmail || customerPhone) {
        const isAuthorized = verifyCustomerAccess(order, customerEmail, customerPhone);
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
    
    // If direct lookup fails, try searching
    if (customerEmail) {
      const searchUrl = `${storeUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(orderId)}&customer=${encodeURIComponent(customerEmail)}`;
      
      response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'TrulyBot-Integration/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const orders = await response.json();
        if (orders.length > 0) {
          return {
            success: true,
            order: orders[0]
          };
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
 * Verify customer has access to the order
 */
function verifyCustomerAccess(order: any, customerEmail?: string, customerPhone?: string): boolean {
  if (customerEmail && order.billing?.email?.toLowerCase() === customerEmail.toLowerCase()) {
    return true;
  }
  
  if (customerPhone && order.billing?.phone) {
    // Normalize phone numbers for comparison
    const normalizedOrderPhone = order.billing.phone.replace(/[^\d]/g, '');
    const normalizedCustomerPhone = customerPhone.replace(/[^\d]/g, '');
    
    if (normalizedOrderPhone === normalizedCustomerPhone) {
      return true;
    }
  }
  
  return false;
}

/**
 * Normalize WooCommerce order data to standard format
 */
function normalizeOrderData(order: any, config: any) {
  return {
    id: order.id?.toString(),
    order_number: order.number?.toString() || order.id?.toString(),
    status: order.status,
    status_label: getStatusLabel(order.status),
    total: parseFloat(order.total || '0'),
    currency: order.currency || config?.currency || 'USD',
    date_created: order.date_created,
    date_modified: order.date_modified,
    customer: {
      first_name: order.billing?.first_name || '',
      last_name: order.billing?.last_name || '',
      email: order.billing?.email || '',
      phone: order.billing?.phone || ''
    },
    billing_address: {
      address_1: order.billing?.address_1 || '',
      address_2: order.billing?.address_2 || '',
      city: order.billing?.city || '',
      state: order.billing?.state || '',
      postcode: order.billing?.postcode || '',
      country: order.billing?.country || ''
    },
    shipping_address: {
      address_1: order.shipping?.address_1 || '',
      address_2: order.shipping?.address_2 || '',
      city: order.shipping?.city || '',
      state: order.shipping?.state || '',
      postcode: order.shipping?.postcode || '',
      country: order.shipping?.country || ''
    },
    items: (order.line_items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      total: parseFloat(item.total || '0'),
      product_id: item.product_id,
      sku: item.sku || null
    })),
    tracking_info: extractTrackingInfo(order),
    platform: 'woocommerce'
  };
}

/**
 * Get human-readable status label
 */
function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'pending': 'Pending Payment',
    'processing': 'Processing',
    'on-hold': 'On Hold',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
    'failed': 'Failed',
    'shipped': 'Shipped',
    'delivered': 'Delivered'
  };
  
  return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Extract tracking information from order meta
 */
function extractTrackingInfo(order: any): any[] {
  const tracking = [];
  
  // Check for tracking info in meta data
  if (order.meta_data && Array.isArray(order.meta_data)) {
    for (const meta of order.meta_data) {
      if (meta.key && meta.key.includes('tracking')) {
        tracking.push({
          provider: meta.key.replace(/_tracking.*/, ''),
          number: meta.value,
          date_shipped: null
        });
      }
    }
  }
  
  return tracking;
}