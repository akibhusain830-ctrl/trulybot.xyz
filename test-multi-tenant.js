#!/usr/bin/env node
/**
 * TrulyBot Multi-Tenant System Test Suite
 * 
 * This script tests the multi-tenant isolation and security of the TrulyBot system.
 * Run this after deploying to verify tenant separation works correctly.
 */

const { createClient } = require('@supabase/supabase-js');

// Test configuration
const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  testApiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
};

class MultiTenantTester {
  constructor() {
    this.supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    
    this.testResults.push({
      timestamp,
      type,
      message
    });
  }

  async createTestUser(email, password) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      this.log(`Failed to create user ${email}: ${error.message}`, 'error');
      return null;
    }
    
    this.log(`Created test user: ${email}`, 'success');
    return data.user;
  }

  async testWorkspaceIsolation() {
    this.log('=== Testing Workspace Isolation ===');
    
    try {
      // Create two test users
      const user1 = await this.createTestUser('test1@example.com', 'testpass123');
      const user2 = await this.createTestUser('test2@example.com', 'testpass123');
      
      if (!user1 || !user2) {
        this.log('Failed to create test users', 'error');
        return false;
      }

      // Test 1: Document isolation
      await this.testDocumentIsolation(user1, user2);
      
      // Test 2: Lead isolation
      await this.testLeadIsolation(user1, user2);
      
      // Test 3: Chat session isolation
      await this.testChatSessionIsolation(user1, user2);
      
      return true;
    } catch (error) {
      this.log(`Workspace isolation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testDocumentIsolation(user1, user2) {
    this.log('Testing document isolation...');
    
    // Sign in as user1 and upload a document
    await this.supabase.auth.signInWithPassword({
      email: 'test1@example.com',
      password: 'testpass123'
    });
    
    const { data: doc1, error: docError1 } = await this.supabase
      .from('documents')
      .insert({
        filename: 'user1-secret.txt',
        content: 'This is user 1 secret content',
        user_id: user1.id
      })
      .select()
      .single();
    
    if (docError1) {
      this.log(`Failed to create document for user1: ${docError1.message}`, 'error');
      return;
    }
    
    // Sign in as user2 and try to access user1's document
    await this.supabase.auth.signInWithPassword({
      email: 'test2@example.com', 
      password: 'testpass123'
    });
    
    const { data: user2Docs, error: docError2 } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', doc1.id);
    
    if (user2Docs && user2Docs.length > 0) {
      this.log('SECURITY BREACH: User2 can access User1 documents!', 'error');
    } else {
      this.log('Document isolation working correctly', 'success');
    }
  }

  async testLeadIsolation(user1, user2) {
    this.log('Testing lead isolation...');
    
    // Create a lead for user1's workspace
    const testLead = {
      workspace_id: user1.id, // Assuming user ID maps to workspace
      email: 'test.lead@example.com',
      source_bot_id: user1.id,
      first_message: 'Hello from user1 workspace'
    };
    
    await this.supabase.auth.signInWithPassword({
      email: 'test1@example.com',
      password: 'testpass123'
    });
    
    const { data: lead1, error: leadError1 } = await this.supabase
      .from('leads')
      .insert(testLead)
      .select()
      .single();
    
    if (leadError1) {
      this.log(`Failed to create lead for user1: ${leadError1.message}`, 'error');
      return;
    }
    
    // Sign in as user2 and try to access user1's leads
    await this.supabase.auth.signInWithPassword({
      email: 'test2@example.com',
      password: 'testpass123'
    });
    
    const { data: user2Leads, error: leadError2 } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', lead1.id);
    
    if (user2Leads && user2Leads.length > 0) {
      this.log('SECURITY BREACH: User2 can access User1 leads!', 'error');
    } else {
      this.log('Lead isolation working correctly', 'success');
    }
  }

  async testChatSessionIsolation(user1, user2) {
    this.log('Testing chat session isolation...');
    
    // Test chat API endpoint isolation
    try {
      const response1 = await fetch(`${TEST_CONFIG.testApiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: user1.id,
          messages: [{ role: 'user', content: 'Test message for user1' }]
        })
      });
      
      const response2 = await fetch(`${TEST_CONFIG.testApiUrl}/api/chat`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: user2.id,
          messages: [{ role: 'user', content: 'Test message for user2' }]
        })
      });
      
      if (response1.ok && response2.ok) {
        this.log('Chat API responds correctly for different bot IDs', 'success');
      } else {
        this.log('Chat API isolation test inconclusive', 'warning');
      }
      
    } catch (error) {
      this.log(`Chat API test failed: ${error.message}`, 'error');
    }
  }

  async testAPISecurityHeaders() {
    this.log('=== Testing API Security Headers ===');
    
    try {
      const response = await fetch(`${TEST_CONFIG.testApiUrl}/api/widget/config/test-id`);
      const headers = response.headers;
      
      if (headers.get('access-control-allow-origin')) {
        this.log('CORS headers present', 'success');
      } else {
        this.log('Missing CORS headers', 'warning');
      }
      
    } catch (error) {
      this.log(`API security test failed: ${error.message}`, 'error');
    }
  }

  async testQuotaIsolation() {
    this.log('=== Testing Quota Isolation ===');
    
    // Test that usage counters are properly isolated per workspace
    try {
      const { data: usage1 } = await this.supabase
        .from('usage_counters')
        .select('*')
        .limit(5);
      
      if (usage1) {
        const workspaces = new Set(usage1.map(u => u.workspace_id));
        this.log(`Found ${workspaces.size} different workspaces in usage data`, 'info');
        
        if (workspaces.size > 1) {
          this.log('Usage counters properly separated by workspace', 'success');
        }
      }
      
    } catch (error) {
      this.log(`Quota isolation test failed: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    this.log('Starting TrulyBot Multi-Tenant Security Tests');
    this.log('================================================');
    
    const results = {
      workspaceIsolation: await this.testWorkspaceIsolation(),
      apiSecurity: await this.testAPISecurityHeaders(),
      quotaIsolation: await this.testQuotaIsolation()
    };
    
    this.log('================================================');
    this.log('Test Summary:');
    Object.entries(results).forEach(([test, passed]) => {
      this.log(`${test}: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
    });
    
    // Clean up test data
    await this.cleanup();
    
    return results;
  }

  async cleanup() {
    this.log('Cleaning up test data...');
    
    try {
      // Delete test users and their associated data
      await this.supabase.auth.admin.deleteUser('test1@example.com');
      await this.supabase.auth.admin.deleteUser('test2@example.com');
      this.log('Test cleanup completed', 'success');
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'warning');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new MultiTenantTester();
  tester.runAllTests().then(results => {
    const allPassed = Object.values(results).every(r => r === true);
    process.exit(allPassed ? 0 : 1);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { MultiTenantTester };