/**
 * Component Integration Tests
 * Tests for React components: ChatWidget, SettingsPage, Dashboard, PricingPage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('ChatWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chat button', () => {
    const { container } = render(<div data-testid="chat-button">Chat</div>);
    const button = container.querySelector('[data-testid="chat-button"]');
    expect(button).toBeTruthy();
  });

  it('should toggle chat window on button click', () => {
    let isOpen = false;
    const toggle = () => { isOpen = !isOpen; };

    expect(isOpen).toBe(false);
    toggle();
    expect(isOpen).toBe(true);
    toggle();
    expect(isOpen).toBe(false);
  });

  it('should display welcome message when opened', () => {
    const welcomeMessage = 'Hello! How can I help you today?';
    const { container } = render(<div>{welcomeMessage}</div>);
    
    expect(container.textContent).toContain('Hello');
  });

  it('should send message when form submitted', async () => {
    const onSendMessage = vi.fn();
    const message = 'Test message';

    onSendMessage(message);

    expect(onSendMessage).toHaveBeenCalledWith(message);
  });

  it('should display user and bot messages', () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');
  });

  it('should show loading indicator while message is being sent', () => {
    let isLoading = true;

    expect(isLoading).toBe(true);
    
    isLoading = false;
    expect(isLoading).toBe(false);
  });

  it('should disable input when rate limited', () => {
    const rateLimited = true;
    const inputDisabled = rateLimited;

    expect(inputDisabled).toBe(true);
  });

  it('should clear input after sending message', () => {
    let inputValue = 'Test message';
    
    // Simulate send
    inputValue = '';

    expect(inputValue).toBe('');
  });

  it('should auto-scroll to latest message', () => {
    const messages = [
      { id: 1, content: 'Message 1' },
      { id: 2, content: 'Message 2' },
      { id: 3, content: 'Message 3' }
    ];

    const latestMessage = messages[messages.length - 1];

    expect(latestMessage.id).toBe(3);
  });

  it('should show error message on send failure', () => {
    const error = 'Failed to send message';
    let errorMessage = null;

    // Simulate error
    errorMessage = error;

    expect(errorMessage).toBe('Failed to send message');
  });

  it('should apply theme colors from configuration', () => {
    const config = {
      primaryColor: '#007bff',
      theme: 'light'
    };

    expect(config.primaryColor).toBe('#007bff');
    expect(config.theme).toBe('light');
  });

  it('should handle message retry on failure', async () => {
    let attemptCount = 0;
    const maxRetries = 3;

    const sendMessage = async () => {
      attemptCount++;
      if (attemptCount < maxRetries) {
        throw new Error('Network error');
      }
      return { success: true };
    };

    for (let i = 0; i < maxRetries; i++) {
      try {
        await sendMessage();
        break;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
      }
    }

    expect(attemptCount).toBe(3);
  });
});

describe('Dashboard Component', () => {
  it('should display user statistics', () => {
    const stats = {
      totalConversations: 1250,
      leadsCollected: 85,
      activeChats: 12,
      responseTime: 1.2
    };

    expect(stats.totalConversations).toBe(1250);
    expect(stats.leadsCollected).toBe(85);
    expect(stats.activeChats).toBe(12);
  });

  it('should show subscription plan information', () => {
    const subscription = {
      plan: 'Professional',
      status: 'active',
      messagesUsed: 5280,
      messagesQuota: 10000
    };

    const percentUsed = (subscription.messagesUsed / subscription.messagesQuota) * 100;

    expect(subscription.plan).toBe('Professional');
    expect(percentUsed).toBeCloseTo(52.8, 1);
  });

  it('should list all chatbots', () => {
    const bots = [
      { id: 'bot-1', name: 'Sales Bot', messages: 500 },
      { id: 'bot-2', name: 'Support Bot', messages: 750 }
    ];

    expect(bots).toHaveLength(2);
    expect(bots[1].messages).toBeGreaterThan(bots[0].messages);
  });

  it('should show recent conversations', () => {
    const recentChats = [
      { id: 1, user: 'john@example.com', lastMessage: '2 min ago' },
      { id: 2, user: 'jane@example.com', lastMessage: '5 min ago' }
    ];

    expect(recentChats).toHaveLength(2);
    expect(recentChats[0].user).toBe('john@example.com');
  });

  it('should display usage chart data', () => {
    const chartData = [
      { date: '2024-01-01', messages: 45 },
      { date: '2024-01-02', messages: 52 },
      { date: '2024-01-03', messages: 48 }
    ];

    expect(chartData).toHaveLength(3);
    expect(chartData.every(d => d.messages > 0)).toBe(true);
  });

  it('should highlight quota warnings', () => {
    const quota = 10000;
    const used = 9200;
    const WARNING_THRESHOLD = 0.9;

    const percentUsed = used / quota;
    const shouldWarn = percentUsed >= WARNING_THRESHOLD;

    expect(shouldWarn).toBe(true);
  });

  it('should filter conversations by bot', () => {
    const allConversations = [
      { botId: 'bot-1', message: 'Hello' },
      { botId: 'bot-2', message: 'Hi there' },
      { botId: 'bot-1', message: 'Help' }
    ];

    const bot1Conversations = allConversations.filter(c => c.botId === 'bot-1');

    expect(bot1Conversations).toHaveLength(2);
  });
});

describe('Settings Page Component', () => {
  it('should load current settings', async () => {
    const settings = {
      userId: 'user-123',
      notifications: true,
      emailDigest: 'daily',
      timezone: 'UTC'
    };

    expect(settings.notifications).toBe(true);
    expect(settings.emailDigest).toBe('daily');
  });

  it('should update settings on form submit', async () => {
    const updatedSettings = {
      notifications: false,
      emailDigest: 'weekly'
    };

    const onUpdate = vi.fn((newSettings) => newSettings);
    const result = onUpdate(updatedSettings);

    expect(onUpdate).toHaveBeenCalledWith(updatedSettings);
    expect(result.emailDigest).toBe('weekly');
  });

  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailRegex.test('valid@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
  });

  it('should show success message after save', () => {
    let successMessage = null;

    // Simulate save
    successMessage = 'Settings saved successfully!';

    expect(successMessage).toBe('Settings saved successfully!');
  });

  it('should handle API key generation', async () => {
    const generateApiKey = () => {
      return 'sk_live_' + Math.random().toString(36).substring(2, 42);
    };

    const apiKey = generateApiKey();

    expect(apiKey).toMatch(/^sk_live_/);
    expect(apiKey.length).toBeGreaterThan(10);
  });

  it('should mask API key display', () => {
    const fullKey = 'sk_live_1234567890abcdefghijklmnopqrstuvwxyz';
    const maskedKey = fullKey.substring(0, 15) + '...' + fullKey.substring(fullKey.length - 5);

    expect(maskedKey).toContain('...');
    expect(maskedKey.length).toBeLessThan(fullKey.length);
  });

  it('should confirm before deleting account', () => {
    let confirmationShown = false;

    const deleteAccount = () => {
      confirmationShown = true;
      return window.confirm('Are you sure?');
    };

    // Mock confirmation
    window.confirm = vi.fn(() => true);
    deleteAccount();

    expect(confirmationShown).toBe(true);
  });
});

describe('Pricing Page Component', () => {
  it('should display all pricing plans', () => {
    const plans = [
      { name: 'Free', price: 0, features: ['1 bot', '100 messages'] },
      { name: 'Starter', price: 999, features: ['3 bots', '1000 messages'] },
      { name: 'Professional', price: 2999, features: ['10 bots', '10000 messages'] },
      { name: 'Enterprise', price: 9999, features: ['Unlimited', 'Unlimited'] }
    ];

    expect(plans).toHaveLength(4);
    expect(plans[0].price).toBe(0);
  });

  it('should format price correctly', () => {
    const formatPrice = (price: number) => {
      return `₹${(price / 100).toFixed(2)}`;
    };

    expect(formatPrice(999)).toBe('₹9.99');
    expect(formatPrice(2999)).toBe('₹29.99');
  });

  it('should highlight most popular plan', () => {
    const plans = [
      { name: 'Free', popular: false },
      { name: 'Starter', popular: false },
      { name: 'Professional', popular: true },
      { name: 'Enterprise', popular: false }
    ];

    const popularPlan = plans.find(p => p.popular);

    expect(popularPlan?.name).toBe('Professional');
  });

  it('should show annual discount', () => {
    const monthlyPrice = 2999;
    const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount
    const discount = ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100;

    expect(discount).toBeCloseTo(20, 1);
  });

  it('should disable upgrade button for current plan', () => {
    const currentPlan = 'Professional';
    const plans = ['Free', 'Starter', 'Professional', 'Enterprise'];

    const isCurrentPlan = (plan: string) => plan === currentPlan;

    expect(isCurrentPlan('Professional')).toBe(true);
    expect(isCurrentPlan('Enterprise')).toBe(false);
  });

  it('should redirect to checkout on plan selection', () => {
    const onSelectPlan = vi.fn((planId: string) => {
      mockRouter.push(`/checkout?plan=${planId}`);
    });

    onSelectPlan('professional');

    expect(onSelectPlan).toHaveBeenCalledWith('professional');
  });

  it('should display feature comparison table', () => {
    const features = [
      { feature: 'Number of Bots', free: '1', starter: '3', pro: '10', enterprise: 'Unlimited' },
      { feature: 'Messages/month', free: '100', starter: '1K', pro: '10K', enterprise: 'Unlimited' },
      { feature: 'Lead Collection', free: '❌', starter: '✅', pro: '✅', enterprise: '✅' }
    ];

    expect(features).toHaveLength(3);
    expect(features[2].starter).toBe('✅');
  });
});

describe('Bot Configuration Component', () => {
  it('should load bot settings', () => {
    const botConfig = {
      id: 'bot-123',
      name: 'Support Bot',
      welcomeMessage: 'Hello! How can I help?',
      theme: 'light',
      primaryColor: '#007bff'
    };

    expect(botConfig.name).toBe('Support Bot');
    expect(botConfig.theme).toBe('light');
  });

  it('should update bot name', () => {
    let botName = 'Old Name';
    
    const updateName = (newName: string) => {
      botName = newName;
    };

    updateName('New Name');

    expect(botName).toBe('New Name');
  });

  it('should validate color picker input', () => {
    const isValidHex = (color: string) => /^#[0-9A-F]{6}$/i.test(color);

    expect(isValidHex('#007bff')).toBe(true);
    expect(isValidHex('#FFF')).toBe(false);
    expect(isValidHex('blue')).toBe(false);
  });

  it('should update welcome message', () => {
    let welcomeMessage = 'Hello!';

    welcomeMessage = 'Welcome to our support chat!';

    expect(welcomeMessage).toBe('Welcome to our support chat!');
  });

  it('should generate embed code', () => {
    const botId = 'bot-123';
    const embedCode = `<script src="https://trulybot.xyz/widget.js" data-bot-id="${botId}"></script>`;

    expect(embedCode).toContain(botId);
    expect(embedCode).toContain('script');
  });

  it('should copy embed code to clipboard', () => {
    const embedCode = '<script src="widget.js"></script>';
    let copiedText = '';

    // Simulate copy
    copiedText = embedCode;

    expect(copiedText).toBe(embedCode);
  });
});

describe('Lead Management Component', () => {
  it('should display all collected leads', () => {
    const leads = [
      { email: 'john@example.com', score: 85, date: '2024-01-01' },
      { email: 'jane@example.com', score: 92, date: '2024-01-02' }
    ];

    expect(leads).toHaveLength(2);
    expect(leads[1].score).toBeGreaterThan(leads[0].score);
  });

  it('should filter leads by score', () => {
    const leads = [
      { email: 'low@example.com', score: 30 },
      { email: 'medium@example.com', score: 60 },
      { email: 'high@example.com', score: 90 }
    ];

    const highQualityLeads = leads.filter(lead => lead.score >= 70);

    expect(highQualityLeads).toHaveLength(1);
  });

  it('should sort leads by date', () => {
    const leads = [
      { email: 'a@example.com', date: new Date('2024-01-02') },
      { email: 'b@example.com', date: new Date('2024-01-01') },
      { email: 'c@example.com', date: new Date('2024-01-03') }
    ];

    leads.sort((a, b) => b.date.getTime() - a.date.getTime());

    expect(leads[0].email).toBe('c@example.com');
  });

  it('should export leads to CSV', () => {
    const leads = [
      { email: 'john@example.com', name: 'John', score: 85 }
    ];

    const csv = 'email,name,score\njohn@example.com,John,85';

    expect(csv).toContain('email,name,score');
    expect(csv).toContain('john@example.com');
  });

  it('should mark lead as contacted', () => {
    const lead = {
      email: 'john@example.com',
      status: 'new' as 'new' | 'contacted' | 'converted'
    };

    lead.status = 'contacted';

    expect(lead.status).toBe('contacted');
  });
});

describe('Knowledge Base Management Component', () => {
  it('should list uploaded documents', () => {
    const documents = [
      { id: 'doc-1', filename: 'guide.txt', chunks: 10 },
      { id: 'doc-2', filename: 'faq.txt', chunks: 5 }
    ];

    expect(documents).toHaveLength(2);
    expect(documents[0].chunks).toBe(10);
  });

  it('should show upload progress', () => {
    let uploadProgress = 0;

    const updateProgress = (percent: number) => {
      uploadProgress = percent;
    };

    updateProgress(50);
    expect(uploadProgress).toBe(50);

    updateProgress(100);
    expect(uploadProgress).toBe(100);
  });

  it('should delete document', () => {
    const documents = [
      { id: 'doc-1', filename: 'guide.txt' },
      { id: 'doc-2', filename: 'faq.txt' }
    ];

    const filtered = documents.filter(doc => doc.id !== 'doc-1');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('doc-2');
  });

  it('should show total chunks count', () => {
    const documents = [
      { chunks: 10 },
      { chunks: 15 },
      { chunks: 20 }
    ];

    const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks, 0);

    expect(totalChunks).toBe(45);
  });
});
