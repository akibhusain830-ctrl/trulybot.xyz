// Billing history types and interfaces
// Provides comprehensive payment tracking and financial compliance

export type BillingCycle = 'monthly' | 'annual' | 'one-time';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'apple_pay' | 'google_pay' | 'stripe' | 'other';
export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise' | 'custom';
export type CustomerType = 'regular' | 'enterprise' | 'non_profit' | 'educational' | 'startup';
export type SalesChannel = 'self_service' | 'sales_team' | 'partner' | 'referral' | 'marketing';
export type DiscountType = 'percentage' | 'fixed_amount' | 'free_trial' | 'upgrade_credit';
export type ComplianceStatus = 'compliant' | 'pending_review' | 'requires_action' | 'disputed';
export type DisputeStatus = 'none' | 'inquiry' | 'chargeback' | 'resolved' | 'lost';

export interface BillingHistory {
  id?: string;
  
  // Billing Identity
  workspace_id: string;
  user_id?: string;
  billing_cycle: BillingCycle;
  
  // Invoice Information
  invoice_id: string;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  invoice_date: string;
  due_date: string;
  
  // Financial Details
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  
  // Payment Information
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_provider?: string;
  payment_reference?: string;
  paid_at?: string;
  
  // Plan & Subscription Details
  plan_id?: string;
  plan_name: string;
  plan_type: PlanType;
  subscription_id?: string;
  quantity: number;
  unit_price: number;
  
  // Business Intelligence
  customer_type?: CustomerType;
  sales_channel?: SalesChannel;
  discount_code?: string;
  discount_type?: DiscountType;
  
  // Compliance & Audit
  tax_jurisdiction?: string;
  tax_rate?: number;
  tax_exempt?: boolean;
  compliance_status?: ComplianceStatus;
  
  // Customer Support
  payment_attempts?: number;
  failure_reason?: string;
  support_notes?: string;
  dispute_status?: DisputeStatus;
  dispute_amount?: number;
  
  // Geographic & Temporal
  billing_country?: string;
  billing_state?: string;
  billing_timezone?: string;
  processed_at?: string;
  
  // Metadata & Timestamps
  invoice_url?: string;
  receipt_url?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface RevenueAnalytics {
  total_revenue: number;
  recurring_revenue: number;
  one_time_revenue: number;
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
  failed_invoices: number;
  avg_invoice_amount: number;
  churn_amount: number;
  refund_amount: number;
}

export interface BillingTrend {
  month_year: string;
  total_revenue: number;
  invoice_count: number;
  avg_amount: number;
  payment_success_rate: number;
}

export interface OverdueInvoice {
  workspace_id: string;
  invoice_id: string;
  invoice_number: string;
  total_amount: number;
  currency: string;
  due_date: string;
  days_overdue: number;
  customer_type: string;
  payment_attempts: number;
}

export interface BillingMetrics {
  // Revenue metrics
  monthly_recurring_revenue: number;
  annual_recurring_revenue: number;
  total_revenue_ytd: number;
  revenue_growth_rate: number;
  
  // Customer metrics
  average_revenue_per_user: number;
  customer_lifetime_value: number;
  churn_rate: number;
  
  // Payment metrics
  payment_success_rate: number;
  failed_payment_rate: number;
  refund_rate: number;
  dispute_rate: number;
  
  // Outstanding metrics
  outstanding_invoices: number;
  overdue_amount: number;
  collections_needed: number;
}

export interface BillingDashboardData {
  revenue_analytics: RevenueAnalytics;
  billing_trends: BillingTrend[];
  overdue_invoices: OverdueInvoice[];
  billing_metrics: BillingMetrics;
  recent_transactions: BillingHistory[];
}

// Invoice builder for creating new billing records
export class InvoiceBuilder {
  private invoice: Partial<BillingHistory>;

  constructor(workspaceId: string, planName: string, planType: PlanType) {
    this.invoice = {
      workspace_id: workspaceId,
      plan_name: planName,
      plan_type: planType,
      billing_cycle: 'monthly',
      currency: 'USD',
      quantity: 1,
      subtotal_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      payment_status: 'pending',
      payment_provider: 'stripe',
      customer_type: 'regular',
      sales_channel: 'self_service',
      compliance_status: 'compliant',
      dispute_status: 'none',
      payment_attempts: 0,
      tax_exempt: false
    };
  }

  setInvoiceDetails(details: {
    invoice_id: string;
    invoice_number: string;
    billing_period_start: string;
    billing_period_end: string;
    due_date: string;
  }): InvoiceBuilder {
    Object.assign(this.invoice, details);
    return this;
  }

  setBillingCycle(cycle: BillingCycle): InvoiceBuilder {
    this.invoice.billing_cycle = cycle;
    return this;
  }

  setPricing(unitPrice: number, quantity: number = 1): InvoiceBuilder {
    this.invoice.unit_price = unitPrice;
    this.invoice.quantity = quantity;
    this.invoice.subtotal_amount = unitPrice * quantity;
    this.recalculateTotal();
    return this;
  }

  setTax(taxRate: number, jurisdiction?: string): InvoiceBuilder {
    this.invoice.tax_rate = taxRate;
    this.invoice.tax_jurisdiction = jurisdiction;
    this.invoice.tax_amount = (this.invoice.subtotal_amount || 0) * (taxRate / 100);
    this.recalculateTotal();
    return this;
  }

  setDiscount(amount: number, code?: string, type: DiscountType = 'fixed_amount'): InvoiceBuilder {
    this.invoice.discount_amount = amount;
    this.invoice.discount_code = code;
    this.invoice.discount_type = type;
    this.recalculateTotal();
    return this;
  }

  setCustomer(details: {
    user_id?: string;
    customer_type?: CustomerType;
    sales_channel?: SalesChannel;
    billing_country?: string;
    billing_state?: string;
    billing_timezone?: string;
  }): InvoiceBuilder {
    Object.assign(this.invoice, details);
    return this;
  }

  setSubscription(subscriptionId: string, planId?: string): InvoiceBuilder {
    this.invoice.subscription_id = subscriptionId;
    this.invoice.plan_id = planId;
    return this;
  }

  setPaymentMethod(method: PaymentMethod, provider: string = 'stripe'): InvoiceBuilder {
    this.invoice.payment_method = method;
    this.invoice.payment_provider = provider;
    return this;
  }

  setUrls(invoiceUrl?: string, receiptUrl?: string): InvoiceBuilder {
    this.invoice.invoice_url = invoiceUrl;
    this.invoice.receipt_url = receiptUrl;
    return this;
  }

  setMetadata(metadata: Record<string, any>): InvoiceBuilder {
    this.invoice.metadata = { ...this.invoice.metadata, ...metadata };
    return this;
  }

  private recalculateTotal(): void {
    const subtotal = this.invoice.subtotal_amount || 0;
    const tax = this.invoice.tax_amount || 0;
    const discount = this.invoice.discount_amount || 0;
    this.invoice.total_amount = subtotal + tax - discount;
  }

  build(): BillingHistory {
    this.recalculateTotal();
    return {
      ...this.invoice,
      invoice_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as BillingHistory;
  }
}

// Payment status updater for tracking payment lifecycle
export class PaymentStatusTracker {
  private invoiceId: string;
  private attempts: number = 0;

  constructor(invoiceId: string) {
    this.invoiceId = invoiceId;
  }

  markProcessing(): { invoice_id: string; status: PaymentStatus; timestamp: string } {
    return {
      invoice_id: this.invoiceId,
      status: 'processing',
      timestamp: new Date().toISOString()
    };
  }

  markPaid(paymentReference: string): { 
    invoice_id: string; 
    status: PaymentStatus; 
    payment_reference: string;
    paid_at: string;
  } {
    return {
      invoice_id: this.invoiceId,
      status: 'paid',
      payment_reference: paymentReference,
      paid_at: new Date().toISOString()
    };
  }

  markFailed(reason: string): { 
    invoice_id: string; 
    status: PaymentStatus; 
    failure_reason: string;
    attempt_number: number;
  } {
    this.attempts++;
    return {
      invoice_id: this.invoiceId,
      status: 'failed',
      failure_reason: reason,
      attempt_number: this.attempts
    };
  }

  markRefunded(amount?: number): {
    invoice_id: string;
    status: PaymentStatus;
    refund_amount?: number;
    refunded_at: string;
  } {
    return {
      invoice_id: this.invoiceId,
      status: amount ? 'partially_refunded' : 'refunded',
      refund_amount: amount,
      refunded_at: new Date().toISOString()
    };
  }

  markDisputed(disputeAmount: number, disputeType: DisputeStatus): {
    invoice_id: string;
    dispute_status: DisputeStatus;
    dispute_amount: number;
    disputed_at: string;
  } {
    return {
      invoice_id: this.invoiceId,
      dispute_status: disputeType,
      dispute_amount: disputeAmount,
      disputed_at: new Date().toISOString()
    };
  }
}