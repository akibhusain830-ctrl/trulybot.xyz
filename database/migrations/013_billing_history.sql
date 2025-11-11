-- Billing History Table for Complete Payment Audit Trail
-- Provides comprehensive payment tracking, financial compliance, and customer billing support

-- Create billing_history table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Billing Identity
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  billing_cycle TEXT NOT NULL, -- monthly, annual, one-time
  
  -- Invoice Information
  invoice_id TEXT UNIQUE NOT NULL,
  invoice_number TEXT NOT NULL,
  billing_period_start TIMESTAMPTZ NOT NULL,
  billing_period_end TIMESTAMPTZ NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  
  -- Financial Details
  subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Payment Information
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded')
  ),
  payment_method TEXT CHECK (
    payment_method IN ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'apple_pay', 'google_pay', 'stripe', 'other')
  ),
  payment_provider TEXT DEFAULT 'stripe',
  payment_reference TEXT, -- Payment gateway transaction ID
  paid_at TIMESTAMPTZ,
  
  -- Plan & Subscription Details
  plan_id TEXT,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (
    plan_type IN ('free', 'basic', 'premium', 'enterprise', 'custom')
  ),
  subscription_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  
  -- Business Intelligence
  customer_type TEXT DEFAULT 'regular' CHECK (
    customer_type IN ('regular', 'enterprise', 'non_profit', 'educational', 'startup')
  ),
  sales_channel TEXT DEFAULT 'self_service' CHECK (
    sales_channel IN ('self_service', 'sales_team', 'partner', 'referral', 'marketing')
  ),
  discount_code TEXT,
  discount_type TEXT CHECK (
    discount_type IN ('percentage', 'fixed_amount', 'free_trial', 'upgrade_credit')
  ),
  
  -- Compliance & Audit
  tax_jurisdiction TEXT,
  tax_rate DECIMAL(5,4) DEFAULT 0.0000,
  tax_exempt BOOLEAN DEFAULT FALSE,
  compliance_status TEXT DEFAULT 'compliant' CHECK (
    compliance_status IN ('compliant', 'pending_review', 'requires_action', 'disputed')
  ),
  
  -- Customer Support
  payment_attempts INTEGER DEFAULT 0,
  failure_reason TEXT,
  support_notes TEXT,
  dispute_status TEXT CHECK (
    dispute_status IN ('none', 'inquiry', 'chargeback', 'resolved', 'lost')
  ),
  dispute_amount DECIMAL(10,2),
  
  -- Geographic & Temporal
  billing_country TEXT,
  billing_state TEXT,
  billing_timezone TEXT,
  processed_at TIMESTAMPTZ,
  
  -- Metadata & Timestamps
  invoice_url TEXT, -- Link to downloadable invoice
  receipt_url TEXT, -- Link to payment receipt
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_history_workspace_id ON billing_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_invoice_id ON billing_history(invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_payment_status ON billing_history(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_history_billing_period ON billing_history(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_billing_history_plan_type ON billing_history(plan_type);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_history_due_date ON billing_history(due_date);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON billing_history(subscription_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_billing_history_workspace_status ON billing_history(workspace_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_history_workspace_period ON billing_history(workspace_id, billing_period_start, billing_period_end);

-- Enable Row Level Security
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_history
CREATE POLICY "Users can view their workspace billing history"
  ON billing_history FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage billing history"
  ON billing_history FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_billing_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER trigger_billing_history_updated_at
  BEFORE UPDATE ON billing_history
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_history_updated_at();

-- Helper function to calculate revenue metrics
CREATE OR REPLACE FUNCTION get_revenue_analytics(
  p_workspace_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_revenue DECIMAL(10,2),
  recurring_revenue DECIMAL(10,2),
  one_time_revenue DECIMAL(10,2),
  total_invoices INTEGER,
  paid_invoices INTEGER,
  pending_invoices INTEGER,
  failed_invoices INTEGER,
  avg_invoice_amount DECIMAL(10,2),
  churn_amount DECIMAL(10,2),
  refund_amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN bh.payment_status = 'paid' THEN bh.total_amount ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN bh.payment_status = 'paid' AND bh.billing_cycle IN ('monthly', 'annual') THEN bh.total_amount ELSE 0 END), 0) as recurring_revenue,
    COALESCE(SUM(CASE WHEN bh.payment_status = 'paid' AND bh.billing_cycle = 'one-time' THEN bh.total_amount ELSE 0 END), 0) as one_time_revenue,
    COUNT(*)::INTEGER as total_invoices,
    COUNT(CASE WHEN bh.payment_status = 'paid' THEN 1 END)::INTEGER as paid_invoices,
    COUNT(CASE WHEN bh.payment_status = 'pending' THEN 1 END)::INTEGER as pending_invoices,
    COUNT(CASE WHEN bh.payment_status = 'failed' THEN 1 END)::INTEGER as failed_invoices,
    COALESCE(AVG(CASE WHEN bh.payment_status = 'paid' THEN bh.total_amount END), 0) as avg_invoice_amount,
    COALESCE(SUM(CASE WHEN bh.payment_status = 'cancelled' THEN bh.total_amount ELSE 0 END), 0) as churn_amount,
    COALESCE(SUM(CASE WHEN bh.payment_status IN ('refunded', 'partially_refunded') THEN bh.total_amount ELSE 0 END), 0) as refund_amount
  FROM billing_history bh
  WHERE bh.workspace_id = p_workspace_id
    AND (p_start_date IS NULL OR bh.created_at >= p_start_date)
    AND (p_end_date IS NULL OR bh.created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get billing trends
CREATE OR REPLACE FUNCTION get_billing_trends(
  p_workspace_id UUID,
  p_months INTEGER DEFAULT 12
)
RETURNS TABLE (
  month_year TEXT,
  total_revenue DECIMAL(10,2),
  invoice_count INTEGER,
  avg_amount DECIMAL(10,2),
  payment_success_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC('month', bh.created_at), 'YYYY-MM') as month_year,
    COALESCE(SUM(CASE WHEN bh.payment_status = 'paid' THEN bh.total_amount ELSE 0 END), 0) as total_revenue,
    COUNT(*)::INTEGER as invoice_count,
    COALESCE(AVG(bh.total_amount), 0) as avg_amount,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN bh.payment_status = 'paid' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
      ELSE 0 
    END as payment_success_rate
  FROM billing_history bh
  WHERE bh.workspace_id = p_workspace_id
    AND bh.created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' * p_months
  GROUP BY DATE_TRUNC('month', bh.created_at)
  ORDER BY month_year DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get overdue invoices
CREATE OR REPLACE FUNCTION get_overdue_invoices(
  p_workspace_id UUID DEFAULT NULL
)
RETURNS TABLE (
  workspace_id UUID,
  invoice_id TEXT,
  invoice_number TEXT,
  total_amount DECIMAL(10,2),
  currency TEXT,
  due_date TIMESTAMPTZ,
  days_overdue INTEGER,
  customer_type TEXT,
  payment_attempts INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bh.workspace_id,
    bh.invoice_id,
    bh.invoice_number,
    bh.total_amount,
    bh.currency,
    bh.due_date,
    EXTRACT(days FROM NOW() - bh.due_date)::INTEGER as days_overdue,
    bh.customer_type,
    bh.payment_attempts
  FROM billing_history bh
  WHERE bh.payment_status IN ('pending', 'failed')
    AND bh.due_date < NOW()
    AND (p_workspace_id IS NULL OR bh.workspace_id = p_workspace_id)
  ORDER BY bh.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update payment status
CREATE OR REPLACE FUNCTION update_payment_status(
  p_invoice_id TEXT,
  p_payment_status TEXT,
  p_payment_reference TEXT DEFAULT NULL,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := FALSE;
BEGIN
  UPDATE billing_history 
  SET 
    payment_status = p_payment_status,
    payment_reference = COALESCE(p_payment_reference, payment_reference),
    failure_reason = p_failure_reason,
    paid_at = CASE WHEN p_payment_status = 'paid' THEN NOW() ELSE paid_at END,
    processed_at = NOW(),
    payment_attempts = CASE WHEN p_payment_status = 'failed' THEN payment_attempts + 1 ELSE payment_attempts END,
    updated_at = NOW()
  WHERE invoice_id = p_invoice_id;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE billing_history IS 'Complete payment audit trail for financial compliance and customer billing support';
COMMENT ON COLUMN billing_history.invoice_id IS 'Unique invoice identifier from payment processor';
COMMENT ON COLUMN billing_history.billing_cycle IS 'Subscription billing frequency';
COMMENT ON COLUMN billing_history.payment_status IS 'Current payment processing status';
COMMENT ON COLUMN billing_history.compliance_status IS 'Tax and regulatory compliance status';
COMMENT ON COLUMN billing_history.dispute_status IS 'Chargeback and dispute tracking';
COMMENT ON COLUMN billing_history.metadata IS 'Additional billing data and integration details';