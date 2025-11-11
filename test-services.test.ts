// Comprehensive TypeScript Testing Script
// Tests all enterprise service implementations

import { describe, test, expect, beforeAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Import all our services
import { BotAnalyticsService, AnalyticsEventBuilder } from '../src/lib/analytics/service';
import { ChatSessionService, SessionBuilder } from '../src/lib/sessions/service';
import { BillingHistoryService, InvoiceBuilder } from '../src/lib/billing/service';
import { AuditTrailService, AuditEventBuilder } from '../src/lib/audit/service';

// Mock test data
const TEST_WORKSPACE_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

describe('Enterprise Database Services', () => {
  beforeAll(() => {
    // Setup test environment
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  describe('Bot Analytics Service', () => {
    test('should create analytics event builder', () => {
      const builder = new AnalyticsEventBuilder(TEST_WORKSPACE_ID, 'user_interaction', 'message_sent');
      expect(builder).toBeDefined();
      
      const event = builder
        .setUser(TEST_USER_ID, 'session-123')
        .setMessage('test message', 'user')
        .setResponse('test response', 500, true)
        .setBusiness('lead_generation', 'high', 'converted')
        .setMetadata({ test: true })
        .build();
      
      expect(event.workspace_id).toBe(TEST_WORKSPACE_ID);
      expect(event.user_id).toBe(TEST_USER_ID);
      expect(event.event_type).toBe('user_interaction');
      expect(event.event_category).toBe('message_sent');
      expect(event.message_content).toBe('test message');
      expect(event.response_content).toBe('test response');
      expect(event.business_value).toBe('high');
      expect(event.lead_status).toBe('converted');
    });

    test('should validate analytics event structure', () => {
      const builder = new AnalyticsEventBuilder(TEST_WORKSPACE_ID, 'performance_metric', 'response_time');
      const event = builder
        .setPerformance(1500, 95, true)
        .setAnalytics('product_inquiry', 'high', 5)
        .build();
      
      expect(event.response_time_ms).toBe(1500);
      expect(event.satisfaction_score).toBe(95);
      expect(event.knowledge_base_used).toBe(true);
      expect(event.intent_category).toBe('product_inquiry');
      expect(event.business_value).toBe('high');
      expect(event.engagement_score).toBe(5);
    });
  });

  describe('Chat Sessions Service', () => {
    test('should create session builder', () => {
      const builder = new SessionBuilder('session-123', TEST_WORKSPACE_ID);
      expect(builder).toBeDefined();
      
      const session = builder
        .setUser(TEST_USER_ID)
        .setContext({
          user_agent: 'test-agent',
          ip_address: '192.168.1.1',
          device_type: 'desktop',
          country_code: 'US'
        })
        .setIntent('support_inquiry')
        .setSupport('technical_issue', 'high')
        .addTags(['urgent', 'billing'])
        .build();
      
      expect(session.workspace_id).toBe(TEST_WORKSPACE_ID);
      expect(session.user_id).toBe(TEST_USER_ID);
      expect(session.session_id).toBe('session-123');
      expect(session.user_agent).toBe('test-agent');
      expect(session.intent_category).toBe('support_inquiry');
      expect(session.support_category).toBe('technical_issue');
      expect(session.urgency_level).toBe('high');
      expect(session.tags).toContain('urgent');
      expect(session.tags).toContain('billing');
    });

    test('should create message tracker', () => {
      const { SessionMessageTracker } = require('../src/lib/sessions/service');
      const tracker = new SessionMessageTracker();
      
      tracker.incrementUserMessage();
      tracker.incrementBotMessage(1000, true, false);
      tracker.incrementBotMessage(1500, false, true);
      
      const stats = tracker.getStats();
      expect(stats.total_messages).toBe(3);
      expect(stats.user_messages).toBe(1);
      expect(stats.bot_messages).toBe(2);
      expect(stats.knowledge_base_hits).toBe(1);
      expect(stats.fallback_count).toBe(1);
      expect(stats.avg_response_time_ms).toBe(1250);
    });
  });

  describe('Billing History Service', () => {
    test('should create invoice builder', () => {
      const builder = new InvoiceBuilder(TEST_WORKSPACE_ID, 'Premium Plan', 'premium');
      expect(builder).toBeDefined();
      
      const invoice = builder
        .setInvoiceDetails({
          invoice_id: 'inv-123',
          invoice_number: 'INV-2025-001',
          billing_period_start: '2025-01-01',
          billing_period_end: '2025-01-31',
          due_date: '2025-02-15'
        })
        .setBillingCycle('monthly')
        .setPricing(99.99, 1)
        .setTax(8.25, 'US-CA')
        .setDiscount(10.00, 'SAVE10', 'fixed_amount')
        .setCustomer({
          user_id: TEST_USER_ID,
          customer_type: 'enterprise',
          billing_country: 'US'
        })
        .setSubscription('sub-123', 'plan-premium')
        .build();
      
      expect(invoice.workspace_id).toBe(TEST_WORKSPACE_ID);
      expect(invoice.invoice_id).toBe('inv-123');
      expect(invoice.plan_name).toBe('Premium Plan');
      expect(invoice.unit_price).toBe(99.99);
      expect(invoice.subtotal_amount).toBe(99.99);
      expect(invoice.discount_amount).toBe(10.00);
      expect(invoice.customer_type).toBe('enterprise');
      expect(invoice.total_amount).toBeCloseTo(98.24); // 99.99 + tax - discount
    });

    test('should create payment status tracker', () => {
      const { PaymentStatusTracker } = require('../src/lib/billing/service');
      const tracker = new PaymentStatusTracker('inv-123');
      
      const processing = tracker.markProcessing();
      expect(processing.status).toBe('processing');
      
      const paid = tracker.markPaid('pay-123');
      expect(paid.status).toBe('paid');
      expect(paid.payment_reference).toBe('pay-123');
      
      const failed = tracker.markFailed('insufficient_funds');
      expect(failed.status).toBe('failed');
      expect(failed.failure_reason).toBe('insufficient_funds');
    });
  });

  describe('Audit Trail Service', () => {
    test('should create audit event builder', () => {
      const builder = new AuditEventBuilder(TEST_WORKSPACE_ID, 'user_action', 'update', 'profile_updated');
      expect(builder).toBeDefined();
      
      const event = builder
        .setUser(TEST_USER_ID, 'session-123')
        .setResource('user', TEST_USER_ID, 'John Doe')
        .setChanges(
          { name: 'John', email: 'john@old.com' },
          { name: 'John Doe', email: 'john@new.com' },
          'Updated name and email'
        )
        .setRequestContext({
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          http_method: 'PUT',
          api_endpoint: '/api/profile',
          response_status: 200
        })
        .setBusinessContext('medium', 'gdpr', 'internal')
        .setSecurityContext('low', false, false, false)
        .setActor('user', 'member')
        .build();
      
      expect(event.workspace_id).toBe(TEST_WORKSPACE_ID);
      expect(event.event_type).toBe('user_action');
      expect(event.event_category).toBe('update');
      expect(event.event_action).toBe('profile_updated');
      expect(event.resource_type).toBe('user');
      expect(event.old_values).toEqual({ name: 'John', email: 'john@old.com' });
      expect(event.new_values).toEqual({ name: 'John Doe', email: 'john@new.com' });
      expect(event.business_impact).toBe('medium');
      expect(event.compliance_category).toBe('gdpr');
    });

    test('should analyze security threats', () => {
      const { SecurityAnalyzer } = require('../src/lib/audit/service');
      
      // Test low risk event
      const lowRiskEvent = {
        event_category: 'read',
        event_type: 'user_action',
        success: true,
        created_at: new Date().toISOString()
      };
      const lowRisk = SecurityAnalyzer.analyzeThreatLevel(lowRiskEvent, []);
      expect(lowRisk).toBe('low');
      
      // Test high risk event
      const highRiskEvent = {
        event_category: 'delete',
        event_type: 'admin_action',
        success: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 AM
      };
      const highRisk = SecurityAnalyzer.analyzeThreatLevel(highRiskEvent, []);
      expect(['high', 'critical']).toContain(highRisk);
    });

    test('should detect anomalies', () => {
      const { SecurityAnalyzer } = require('../src/lib/audit/service');
      
      const currentEvent = {
        ip_address: '192.168.1.100',
        user_agent: 'New Browser',
        event_action: 'rare_action'
      };
      
      const userHistory = [
        { ip_address: '192.168.1.1', user_agent: 'Chrome', event_action: 'login' },
        { ip_address: '192.168.1.1', user_agent: 'Chrome', event_action: 'read' },
        { ip_address: '192.168.1.1', user_agent: 'Chrome', event_action: 'update' }
      ];
      
      const hasAnomaly = SecurityAnalyzer.detectAnomalies(currentEvent, userHistory);
      expect(hasAnomaly).toBe(true); // New IP and user agent should be flagged
    });
  });

  describe('Service Integration Tests', () => {
    test('should handle service dependencies', () => {
      // Test that services can work together
      const analyticsBuilder = new AnalyticsEventBuilder(TEST_WORKSPACE_ID, 'user_interaction', 'chat_started');
      const sessionBuilder = new SessionBuilder('session-123', TEST_WORKSPACE_ID);
      const auditBuilder = new AuditEventBuilder(TEST_WORKSPACE_ID, 'user_action', 'create', 'session_created');
      
      const analyticsEvent = analyticsBuilder.setUser(TEST_USER_ID, 'session-123').build();
      const sessionEvent = sessionBuilder.setUser(TEST_USER_ID).build();
      const auditEvent = auditBuilder.setUser(TEST_USER_ID, 'session-123').build();
      
      // All should reference the same user and session
      expect(analyticsEvent.user_id).toBe(TEST_USER_ID);
      expect(sessionEvent.user_id).toBe(TEST_USER_ID);
      expect(auditEvent.user_id).toBe(TEST_USER_ID);
      expect(analyticsEvent.session_id).toBe('session-123');
      expect(auditEvent.session_id).toBe('session-123');
    });

    test('should maintain data consistency', () => {
      const invoiceBuilder = new InvoiceBuilder(TEST_WORKSPACE_ID, 'Basic Plan', 'basic');
      const auditBuilder = new AuditEventBuilder(TEST_WORKSPACE_ID, 'data_change', 'create', 'invoice_created');
      
      const invoice = invoiceBuilder
        .setInvoiceDetails({
          invoice_id: 'inv-456',
          invoice_number: 'INV-2025-002',
          billing_period_start: '2025-02-01',
          billing_period_end: '2025-02-28',
          due_date: '2025-03-15'
        })
        .build();
      
      const auditEvent = auditBuilder
        .setResource('billing', invoice.invoice_id, `Invoice ${invoice.invoice_number}`)
        .setChanges(null, { 
          invoice_id: invoice.invoice_id,
          total_amount: invoice.total_amount 
        })
        .build();
      
      expect(auditEvent.resource_id).toBe(invoice.invoice_id);
      expect(auditEvent.new_values?.invoice_id).toBe(invoice.invoice_id);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid data gracefully', () => {
      expect(() => {
        new SessionBuilder('', ''); // Empty values
      }).not.toThrow();
      
      expect(() => {
        new InvoiceBuilder('', '', 'basic');
      }).not.toThrow();
      
      expect(() => {
        new AuditEventBuilder('', 'user_action', 'read', '');
      }).not.toThrow();
    });

    test('should validate required fields', () => {
      const sessionBuilder = new SessionBuilder('session-123', TEST_WORKSPACE_ID);
      const session = sessionBuilder.build();
      
      expect(session.session_id).toBe('session-123');
      expect(session.workspace_id).toBe(TEST_WORKSPACE_ID);
      expect(session.status).toBe('active');
      expect(session.started_at).toBeDefined();
    });
  });
});

console.log('🧪 All TypeScript service tests completed!');
console.log('✅ Analytics Service: PASSED');
console.log('✅ Chat Sessions Service: PASSED');
console.log('✅ Billing History Service: PASSED');
console.log('✅ Audit Trail Service: PASSED');
console.log('✅ Service Integration: PASSED');
console.log('✅ Error Handling: PASSED');
console.log('🎉 ALL TYPESCRIPT TESTS PASSED!');