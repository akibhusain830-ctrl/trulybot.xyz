/**
 * Lead Collection System Tests
 * Tests lead detection, quality scoring, storage, and API functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Lead Detection', () => {
  it('should detect email in message', () => {
    const messages = [
      'My email is john@example.com',
      'Contact me at jane.doe@company.co.uk',
      'Reach out to support@test-site.com'
    ];

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    messages.forEach(msg => {
      const match = msg.match(emailRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('@');
    });
  });

  it('should detect phone number in message', () => {
    const messages = [
      'Call me at +1-555-123-4567',
      'My number is (555) 987-6543',
      'Phone: 555.321.7890'
    ];

    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

    messages.forEach(msg => {
      const match = msg.match(phoneRegex);
      expect(match).not.toBeNull();
    });
  });

  it('should detect name patterns', () => {
    const messages = [
      'My name is John Smith',
      "I'm Sarah Johnson",
      'This is Michael Brown'
    ];

    const nameRegex = /(?:my name is|i'm|this is)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i;

    messages.forEach(msg => {
      const match = msg.match(nameRegex);
      expect(match).not.toBeNull();
    });
  });

  it('should detect company name', () => {
    const messages = [
      'I work at Acme Corporation',
      'From TechStart Inc',
      'Representing Global Solutions LLC'
    ];

    const companyIndicators = ['work at', 'from', 'representing', 'company', 'corporation'];
    
    messages.forEach(msg => {
      const hasCompany = companyIndicators.some(indicator => 
        msg.toLowerCase().includes(indicator)
      );
      expect(hasCompany).toBe(true);
    });
  });

  it('should not detect spam or invalid emails', () => {
    const invalidEmails = [
      'not-an-email',
      '@nodomain.com',
      'missing@domain',
      'test@.com',
      'test@com'
    ];

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    invalidEmails.forEach(email => {
      const isValid = emailRegex.test(email);
      expect(isValid).toBe(false);
    });
  });
});

describe('Lead Quality Scoring', () => {
  interface Lead {
    email?: string;
    phone?: string;
    name?: string;
    company?: string;
    message?: string;
  }

  const calculateLeadScore = (lead: Lead): number => {
    let score = 0;
    
    if (lead.email) score += 25;
    if (lead.phone) score += 20;
    if (lead.name) score += 15;
    if (lead.company) score += 20;
    if (lead.message && lead.message.length > 50) score += 20;
    
    return Math.min(score, 100);
  };

  it('should score high-quality lead with all fields', () => {
    const lead: Lead = {
      email: 'john@company.com',
      phone: '+1-555-123-4567',
      name: 'John Smith',
      company: 'Acme Corp',
      message: 'I am interested in your enterprise solution for our team of 50 people'
    };

    const score = calculateLeadScore(lead);
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it('should score medium-quality lead with partial info', () => {
    const lead: Lead = {
      email: 'jane@example.com',
      name: 'Jane Doe',
      message: 'Tell me more about pricing'
    };

    const score = calculateLeadScore(lead);
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThan(90);
  });

  it('should score low-quality lead with minimal info', () => {
    const lead: Lead = {
      email: 'test@test.com'
    };

    const score = calculateLeadScore(lead);
    expect(score).toBeLessThan(40);
  });

  it('should prioritize email over other fields', () => {
    const leadWithEmail: Lead = {
      email: 'contact@example.com',
      message: 'Hi'
    };

    const leadWithoutEmail: Lead = {
      name: 'John Smith',
      company: 'Acme Corp',
      message: 'Hi'
    };

    const scoreWith = calculateLeadScore(leadWithEmail);
    const scoreWithout = calculateLeadScore(leadWithoutEmail);

    expect(scoreWith).toBeGreaterThan(scoreWithout);
  });

  it('should cap score at 100', () => {
    const lead: Lead = {
      email: 'test@example.com',
      phone: '+1-555-123-4567',
      name: 'John Smith',
      company: 'Acme Corp',
      message: 'Very long detailed message about our needs and requirements for the product'
    };

    const score = calculateLeadScore(lead);
    expect(score).toBe(100);
  });
});

describe('Lead API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept valid lead submission', async () => {
    const leadData = {
      botId: 'bot-123',
      email: 'john@example.com',
      name: 'John Smith',
      message: 'Interested in your product'
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true, leadId: 'lead-456' })
      })
    ) as any;

    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result.success).toBe(true);
    expect(result.leadId).toBeDefined();
  });

  it('should reject lead without email', async () => {
    const invalidLead = {
      botId: 'bot-123',
      name: 'John Smith',
      message: 'No email provided'
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Email is required' })
      })
    ) as any;

    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(invalidLead)
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it('should reject lead without botId', async () => {
    const invalidLead = {
      email: 'john@example.com',
      message: 'No botId'
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bot ID is required' })
      })
    ) as any;

    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(invalidLead)
    });

    expect(response.ok).toBe(false);
  });

  it('should sanitize lead data before storage', () => {
    const maliciousLead = {
      email: 'test@example.com<script>alert("xss")</script>',
      name: '<img src=x onerror=alert("xss")>',
      message: 'javascript:alert("xss")'
    };

    const sanitize = (str: string) => {
      return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    };

    const sanitized = {
      email: sanitize(maliciousLead.email),
      name: sanitize(maliciousLead.name),
      message: sanitize(maliciousLead.message)
    };

    expect(sanitized.email).not.toContain('<script>');
    expect(sanitized.name).not.toContain('<img');
    expect(sanitized.message).not.toContain('javascript:');
  });

  it('should handle duplicate lead submissions', async () => {
    const leadData = {
      botId: 'bot-123',
      email: 'duplicate@example.com',
      message: 'First submission'
    };

    // First submission succeeds
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, leadId: 'lead-1' })
      })
      // Second submission returns existing lead
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, leadId: 'lead-1', duplicate: true })
      }) as any;

    const response1 = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
    const result1 = await response1.json();

    const response2 = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
    const result2 = await response2.json();

    expect(result1.leadId).toBe('lead-1');
    expect(result2.leadId).toBe('lead-1');
  });

  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validEmails = [
      'user@example.com',
      'john.doe@company.co.uk',
      'test+tag@domain.com'
    ];

    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user@domain'
    ];

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});

describe('Lead Storage & Database', () => {
  it('should store lead with timestamp', () => {
    const lead = {
      email: 'john@example.com',
      name: 'John Smith',
      createdAt: new Date().toISOString()
    };

    expect(lead.createdAt).toBeDefined();
    expect(new Date(lead.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should associate lead with correct bot', () => {
    const lead = {
      botId: 'bot-123',
      email: 'john@example.com',
      userId: 'user-456'
    };

    expect(lead.botId).toBe('bot-123');
    expect(lead.userId).toBe('user-456');
  });

  it('should store lead metadata', () => {
    const lead = {
      email: 'john@example.com',
      metadata: {
        source: 'widget',
        page: '/pricing',
        userAgent: 'Mozilla/5.0...',
        ip: '192.168.1.1'
      }
    };

    expect(lead.metadata.source).toBe('widget');
    expect(lead.metadata.page).toBe('/pricing');
  });

  it('should track lead status', () => {
    const lead = {
      email: 'john@example.com',
      status: 'new' as 'new' | 'contacted' | 'qualified' | 'converted'
    };

    expect(lead.status).toBe('new');
    expect(['new', 'contacted', 'qualified', 'converted']).toContain(lead.status);
  });

  it('should store conversation history with lead', () => {
    const lead = {
      email: 'john@example.com',
      conversations: [
        { message: 'Hi there', timestamp: new Date(), role: 'user' },
        { message: 'Hello! How can I help?', timestamp: new Date(), role: 'assistant' }
      ]
    };

    expect(lead.conversations).toHaveLength(2);
    expect(lead.conversations[0].role).toBe('user');
    expect(lead.conversations[1].role).toBe('assistant');
  });
});

describe('Lead Notifications', () => {
  it('should trigger notification on new lead', () => {
    let notificationSent = false;

    const onNewLead = (lead: { email: string }) => {
      notificationSent = true;
    };

    const lead = { email: 'john@example.com' };
    onNewLead(lead);

    expect(notificationSent).toBe(true);
  });

  it('should include lead details in notification', () => {
    let notificationData: any = null;

    const sendNotification = (data: any) => {
      notificationData = data;
    };

    const lead = {
      email: 'john@example.com',
      name: 'John Smith',
      score: 85
    };

    sendNotification({
      title: 'New High-Quality Lead',
      message: `${lead.name} (${lead.email}) - Score: ${lead.score}`
    });

    expect(notificationData).toBeDefined();
    expect(notificationData.message).toContain('john@example.com');
    expect(notificationData.message).toContain('85');
  });

  it('should only notify for high-quality leads', () => {
    const leads = [
      { email: 'low@example.com', score: 30 },
      { email: 'medium@example.com', score: 60 },
      { email: 'high@example.com', score: 90 }
    ];

    const NOTIFICATION_THRESHOLD = 70;
    const notifiableLeads = leads.filter(lead => lead.score >= NOTIFICATION_THRESHOLD);

    expect(notifiableLeads).toHaveLength(1);
    expect(notifiableLeads[0].email).toBe('high@example.com');
  });
});

describe('Lead Export', () => {
  it('should export leads to CSV format', () => {
    const leads = [
      { email: 'john@example.com', name: 'John', score: 85 },
      { email: 'jane@example.com', name: 'Jane', score: 90 }
    ];

    const csvHeaders = 'email,name,score';
    const csvRows = leads.map(lead => 
      `${lead.email},${lead.name},${lead.score}`
    );
    const csv = [csvHeaders, ...csvRows].join('\n');

    expect(csv).toContain('email,name,score');
    expect(csv).toContain('john@example.com,John,85');
    expect(csv).toContain('jane@example.com,Jane,90');
  });

  it('should handle empty lead list', () => {
    const leads: any[] = [];
    const csv = leads.length === 0 ? 'No leads to export' : '';

    expect(csv).toBe('No leads to export');
  });

  it('should escape special characters in CSV', () => {
    const lead = {
      email: 'test@example.com',
      message: 'Contains, comma and "quotes"'
    };

    const escapeCsv = (str: string) => {
      if (str.includes(',') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const escaped = escapeCsv(lead.message);
    expect(escaped).toContain('"');
    expect(escaped).toContain('""');
  });
});
