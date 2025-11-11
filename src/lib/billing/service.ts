// Billing history service for payment tracking and financial compliance
// Provides comprehensive billing management and revenue analytics

import { createClient } from '@supabase/supabase-js';
import { 
  BillingHistory, 
  RevenueAnalytics, 
  BillingTrend, 
  OverdueInvoice, 
  BillingMetrics,
  BillingDashboardData,
  PaymentStatus,
  InvoiceBuilder,
  PaymentStatusTracker
} from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class BillingHistoryService {
  /**
   * Create a new billing record
   */
  static async createBillingRecord(billing: BillingHistory): Promise<BillingHistory | null> {
    try {
      const { data, error } = await supabase
        .from('billing_history')
        .insert([billing])
        .select()
        .single();

      if (error) {
        console.error('Error creating billing record:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Billing record creation failed:', error);
      return null;
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    invoiceId: string,
    status: PaymentStatus,
    paymentReference?: string,
    failureReason?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('update_payment_status', {
          p_invoice_id: invoiceId,
          p_payment_status: status,
          p_payment_reference: paymentReference,
          p_failure_reason: failureReason
        });

      if (error) {
        console.error('Error updating payment status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Payment status update failed:', error);
      return false;
    }
  }

  /**
   * Get billing record by invoice ID
   */
  static async getBillingRecord(invoiceId: string): Promise<BillingHistory | null> {
    try {
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('invoice_id', invoiceId)
        .single();

      if (error) {
        console.error('Error fetching billing record:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Billing record fetch failed:', error);
      return null;
    }
  }

  /**
   * Get workspace billing history
   */
  static async getWorkspaceBillingHistory(
    workspaceId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<BillingHistory[]> {
    try {
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching billing history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Billing history fetch failed:', error);
      return [];
    }
  }

  /**
   * Get revenue analytics for workspace
   */
  static async getRevenueAnalytics(
    workspaceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RevenueAnalytics | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_revenue_analytics', {
          p_workspace_id: workspaceId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) {
        console.error('Error getting revenue analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Revenue analytics failed:', error);
      return null;
    }
  }

  /**
   * Get billing trends
   */
  static async getBillingTrends(
    workspaceId: string,
    months: number = 12
  ): Promise<BillingTrend[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_billing_trends', {
          p_workspace_id: workspaceId,
          p_months: months
        });

      if (error) {
        console.error('Error getting billing trends:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Billing trends failed:', error);
      return [];
    }
  }

  /**
   * Get overdue invoices
   */
  static async getOverdueInvoices(workspaceId?: string): Promise<OverdueInvoice[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_overdue_invoices', {
          p_workspace_id: workspaceId
        });

      if (error) {
        console.error('Error getting overdue invoices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Overdue invoices fetch failed:', error);
      return [];
    }
  }

  /**
   * Get comprehensive billing dashboard data
   */
  static async getBillingDashboardData(workspaceId: string): Promise<BillingDashboardData | null> {
    try {
      // Get all data in parallel
      const [
        revenueAnalytics,
        billingTrends,
        overdueInvoices,
        recentTransactions
      ] = await Promise.all([
        this.getRevenueAnalytics(workspaceId),
        this.getBillingTrends(workspaceId, 12),
        this.getOverdueInvoices(workspaceId),
        this.getWorkspaceBillingHistory(workspaceId, 10)
      ]);

      if (!revenueAnalytics) {
        return null;
      }

      // Calculate additional metrics
      const billingMetrics = this.calculateBillingMetrics(revenueAnalytics, billingTrends);

      return {
        revenue_analytics: revenueAnalytics,
        billing_trends: billingTrends,
        overdue_invoices: overdueInvoices,
        billing_metrics: billingMetrics,
        recent_transactions: recentTransactions
      };
    } catch (error) {
      console.error('Billing dashboard data failed:', error);
      return null;
    }
  }

  /**
   * Search billing records
   */
  static async searchBillingRecords(
    workspaceId: string,
    criteria: {
      payment_status?: PaymentStatus;
      plan_type?: string;
      date_from?: string;
      date_to?: string;
      amount_min?: number;
      amount_max?: number;
      customer_type?: string;
      invoice_number?: string;
      limit?: number;
    }
  ): Promise<BillingHistory[]> {
    try {
      let query = supabase
        .from('billing_history')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (criteria.payment_status) {
        query = query.eq('payment_status', criteria.payment_status);
      }

      if (criteria.plan_type) {
        query = query.eq('plan_type', criteria.plan_type);
      }

      if (criteria.date_from) {
        query = query.gte('created_at', criteria.date_from);
      }

      if (criteria.date_to) {
        query = query.lte('created_at', criteria.date_to);
      }

      if (criteria.amount_min) {
        query = query.gte('total_amount', criteria.amount_min);
      }

      if (criteria.amount_max) {
        query = query.lte('total_amount', criteria.amount_max);
      }

      if (criteria.customer_type) {
        query = query.eq('customer_type', criteria.customer_type);
      }

      if (criteria.invoice_number) {
        query = query.ilike('invoice_number', `%${criteria.invoice_number}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(criteria.limit || 100);

      if (error) {
        console.error('Error searching billing records:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Billing search failed:', error);
      return [];
    }
  }

  /**
   * Get subscription billing summary
   */
  static async getSubscriptionSummary(
    workspaceId: string,
    subscriptionId: string
  ): Promise<{
    total_paid: number;
    total_pending: number;
    total_failed: number;
    last_payment_date?: string;
    next_payment_date?: string;
    payment_history: BillingHistory[];
  } | null> {
    try {
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting subscription summary:', error);
        return null;
      }

      const records = data || [];
      const totalPaid = records
        .filter(r => r.payment_status === 'paid')
        .reduce((sum, r) => sum + r.total_amount, 0);
      
      const totalPending = records
        .filter(r => r.payment_status === 'pending')
        .reduce((sum, r) => sum + r.total_amount, 0);
      
      const totalFailed = records
        .filter(r => r.payment_status === 'failed')
        .reduce((sum, r) => sum + r.total_amount, 0);

      const lastPayment = records.find(r => r.payment_status === 'paid');
      const nextPayment = records.find(r => r.payment_status === 'pending');

      return {
        total_paid: totalPaid,
        total_pending: totalPending,
        total_failed: totalFailed,
        last_payment_date: lastPayment?.paid_at,
        next_payment_date: nextPayment?.due_date,
        payment_history: records
      };
    } catch (error) {
      console.error('Subscription summary failed:', error);
      return null;
    }
  }

  /**
   * Update billing record metadata
   */
  static async updateBillingMetadata(
    invoiceId: string,
    metadata: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('billing_history')
        .update({
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('invoice_id', invoiceId);

      if (error) {
        console.error('Error updating billing metadata:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Billing metadata update failed:', error);
      return false;
    }
  }

  /**
   * Calculate billing metrics from analytics data
   */
  private static calculateBillingMetrics(
    analytics: RevenueAnalytics,
    trends: BillingTrend[]
  ): BillingMetrics {
    const currentMonth = trends[0];
    const previousMonth = trends[1];
    
    const revenueGrowthRate = previousMonth && previousMonth.total_revenue > 0
      ? ((currentMonth?.total_revenue || 0) - previousMonth.total_revenue) / previousMonth.total_revenue * 100
      : 0;

    const totalCustomers = analytics.paid_invoices; // Simplified metric
    const averageRevenuePerUser = totalCustomers > 0 
      ? analytics.total_revenue / totalCustomers 
      : 0;

    const paymentSuccessRate = analytics.total_invoices > 0
      ? (analytics.paid_invoices / analytics.total_invoices) * 100
      : 0;

    const failedPaymentRate = analytics.total_invoices > 0
      ? (analytics.failed_invoices / analytics.total_invoices) * 100
      : 0;

    const refundRate = analytics.total_revenue > 0
      ? (analytics.refund_amount / analytics.total_revenue) * 100
      : 0;

    return {
      monthly_recurring_revenue: analytics.recurring_revenue,
      annual_recurring_revenue: analytics.recurring_revenue * 12,
      total_revenue_ytd: analytics.total_revenue,
      revenue_growth_rate: revenueGrowthRate,
      average_revenue_per_user: averageRevenuePerUser,
      customer_lifetime_value: averageRevenuePerUser * 12, // Simplified calculation
      churn_rate: 0, // Would need additional data to calculate properly
      payment_success_rate: paymentSuccessRate,
      failed_payment_rate: failedPaymentRate,
      refund_rate: refundRate,
      dispute_rate: 0, // Would need dispute data
      outstanding_invoices: analytics.pending_invoices,
      overdue_amount: 0, // Would need overdue calculation
      collections_needed: analytics.failed_invoices
    };
  }
}

export { InvoiceBuilder, PaymentStatusTracker };