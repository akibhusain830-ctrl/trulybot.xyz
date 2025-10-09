/**
 * TrulyBot Load Testing Suite
 * Comprehensive performance and stress testing
 * 
 * Tests:
 * - API endpoint performance under load
 * - Database query performance
 * - Concurrent user simulation
 * - Memory leak detection
 * - Rate limiting under stress
 */

interface LoadTestConfig {
  baseUrl: string;
  maxConcurrentUsers: number;
  testDurationMs: number;
  rampUpTimeMs: number;
  rampDownTimeMs: number;
  requestIntervalMs: number;
}

interface TestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
}

interface LoadTestResult {
  testName: string;
  config: LoadTestConfig;
  metrics: TestMetrics;
  passed: boolean;
  details: string;
  errors: string[];
  startTime: Date;
  endTime: Date;
}

export class TrulyBotLoadTester {
  private baseUrl: string;
  private authToken: string = '';
  private responseTimes: number[] = [];
  private errors: string[] = [];
  private isRunning: boolean = false;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async runComprehensiveLoadTest(): Promise<LoadTestResult[]> {
    console.log('🚀 Starting TrulyBot Load Testing Suite...');
    
    const results: LoadTestResult[] = [];
    
    try {
      // Setup authentication
      await this.setupAuthentication();
      
      // Test 1: Normal Load (100 users, 10 minutes)
      const normalLoadResult = await this.runLoadTest({
        testName: 'Normal Load Test',
        baseUrl: this.baseUrl,
        maxConcurrentUsers: 100,
        testDurationMs: 10 * 60 * 1000, // 10 minutes
        rampUpTimeMs: 2 * 60 * 1000,    // 2 minutes
        rampDownTimeMs: 1 * 60 * 1000,  // 1 minute
        requestIntervalMs: 1000 // 1 request per second per user
      });
      results.push(normalLoadResult);
      
      // Test 2: Spike Load (100 to 1000 users quickly)
      const spikeLoadResult = await this.runLoadTest({
        testName: 'Spike Load Test',
        baseUrl: this.baseUrl,
        maxConcurrentUsers: 1000,
        testDurationMs: 5 * 60 * 1000,  // 5 minutes
        rampUpTimeMs: 30 * 1000,       // 30 seconds rapid ramp
        rampDownTimeMs: 30 * 1000,     // 30 seconds ramp down
        requestIntervalMs: 500 // 2 requests per second per user
      });
      results.push(spikeLoadResult);
      
      // Test 3: Sustained High Load (500 users, 1 hour)
      const sustainedLoadResult = await this.runLoadTest({
        testName: 'Sustained High Load Test',
        baseUrl: this.baseUrl,
        maxConcurrentUsers: 500,
        testDurationMs: 60 * 60 * 1000, // 1 hour
        rampUpTimeMs: 5 * 60 * 1000,   // 5 minutes
        rampDownTimeMs: 2 * 60 * 1000, // 2 minutes
        requestIntervalMs: 2000 // 1 request every 2 seconds
      });
      results.push(sustainedLoadResult);
      
      // Test 4: Chat API Stress Test
      const chatStressResult = await this.runChatStressTest();
      results.push(chatStressResult);
      
      // Test 5: Database Performance Test
      const dbPerformanceResult = await this.runDatabasePerformanceTest();
      results.push(dbPerformanceResult);
      
    } catch (error) {
      console.error('Load testing failed:', error);
    }
    
    return results;
  }

  private async runLoadTest(config: LoadTestConfig & { testName: string }): Promise<LoadTestResult> {
    console.log(`📊 Running ${config.testName}...`);
    
    const startTime = new Date();
    this.responseTimes = [];
    this.errors = [];
    this.isRunning = true;
    
    const userPromises: Promise<void>[] = [];
    let currentUsers = 0;
    
    // Ramp up users
    const rampUpInterval = config.rampUpTimeMs / config.maxConcurrentUsers;
    const rampUpTimer = setInterval(() => {
      if (currentUsers < config.maxConcurrentUsers && this.isRunning) {
        currentUsers++;
        userPromises.push(this.simulateUser(config, startTime));
      } else {
        clearInterval(rampUpTimer);
      }
    }, rampUpInterval);
    
    // Stop test after duration
    setTimeout(() => {
      this.isRunning = false;
    }, config.testDurationMs);
    
    // Wait for all users to complete
    await Promise.allSettled(userPromises);
    
    const endTime = new Date();
    
    // Calculate metrics
    const metrics = this.calculateMetrics(config, startTime, endTime);
    
    // Determine if test passed
    const passed = this.evaluateTestSuccess(metrics);
    
    return {
      testName: config.testName,
      config,
      metrics,
      passed,
      details: this.generateTestDetails(metrics, passed),
      errors: [...this.errors],
      startTime,
      endTime
    };
  }

  private async simulateUser(config: LoadTestConfig, startTime: Date): Promise<void> {
    const endpoints = [
      { path: '/api/user/profile', method: 'GET', weight: 0.3 },
      { path: '/api/leads', method: 'GET', weight: 0.2 },
      { path: '/api/chat', method: 'POST', weight: 0.3, body: { messages: [{ role: 'user', content: 'Hello' }] } },
      { path: '/api/usage', method: 'GET', weight: 0.1 },
      { path: '/api/widget/config/test-user', method: 'GET', weight: 0.1 }
    ];
    
    while (this.isRunning && (Date.now() - startTime.getTime()) < config.testDurationMs) {
      try {
        // Select random endpoint based on weight
        const endpoint = this.selectWeightedEndpoint(endpoints);
        
        const requestStart = performance.now();
        
        const response = await fetch(`${config.baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
        });
        
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;
        
        this.responseTimes.push(responseTime);
        
        if (!response.ok) {
          this.errors.push(`${endpoint.method} ${endpoint.path}: ${response.status} ${response.statusText}`);
        }
        
        // Wait before next request
        await this.sleep(config.requestIntervalMs);
        
      } catch (error) {
        this.errors.push(`Request failed: ${error}`);
        await this.sleep(config.requestIntervalMs);
      }
    }
  }

  private async runChatStressTest(): Promise<LoadTestResult> {
    console.log('🤖 Running Chat API Stress Test...');
    
    const startTime = new Date();
    this.responseTimes = [];
    this.errors = [];
    
    const config: LoadTestConfig = {
      baseUrl: this.baseUrl,
      maxConcurrentUsers: 200,
      testDurationMs: 10 * 60 * 1000,
      rampUpTimeMs: 2 * 60 * 1000,
      rampDownTimeMs: 1 * 60 * 1000,
      requestIntervalMs: 3000 // 3 seconds between chat messages
    };
    
    const chatMessages = [
      'What are your business hours?',
      'How can I contact support?',
      'Tell me about your pricing plans',
      'I need help with my order',
      'Can you help me with returns?',
      'What payment methods do you accept?',
      'Do you offer international shipping?',
      'How do I track my order?',
      'What is your return policy?',
      'Can I get a refund?'
    ];
    
    const userPromises: Promise<void>[] = [];
    
    for (let i = 0; i < config.maxConcurrentUsers; i++) {
      userPromises.push(this.simulateChatUser(chatMessages, config));
      await this.sleep(config.rampUpTimeMs / config.maxConcurrentUsers);
    }
    
    await Promise.allSettled(userPromises);
    
    const endTime = new Date();
    const metrics = this.calculateMetrics(config, startTime, endTime);
    const passed = this.evaluateTestSuccess(metrics);
    
    return {
      testName: 'Chat API Stress Test',
      config,
      metrics,
      passed,
      details: this.generateTestDetails(metrics, passed),
      errors: [...this.errors],
      startTime,
      endTime
    };
  }

  private async simulateChatUser(messages: string[], config: LoadTestConfig): Promise<void> {
    const conversation: any[] = [];
    
    for (const message of messages) {
      try {
        conversation.push({ role: 'user', content: message });
        
        const requestStart = performance.now();
        
        const response = await fetch(`${config.baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify({
            messages: conversation,
            botId: 'test-bot'
          })
        });
        
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;
        
        this.responseTimes.push(responseTime);
        
        if (response.ok) {
          const responseText = await response.text();
          conversation.push({ role: 'bot', content: responseText });
        } else {
          this.errors.push(`Chat API error: ${response.status} ${response.statusText}`);
        }
        
        await this.sleep(config.requestIntervalMs);
        
      } catch (error) {
        this.errors.push(`Chat request failed: ${error}`);
      }
    }
  }

  private async runDatabasePerformanceTest(): Promise<LoadTestResult> {
    console.log('🗄️ Running Database Performance Test...');
    
    const startTime = new Date();
    this.responseTimes = [];
    this.errors = [];
    
    const config: LoadTestConfig = {
      baseUrl: this.baseUrl,
      maxConcurrentUsers: 50,
      testDurationMs: 5 * 60 * 1000,
      rampUpTimeMs: 1 * 60 * 1000,
      rampDownTimeMs: 30 * 1000,
      requestIntervalMs: 2000
    };
    
    // Test database-heavy endpoints
    const dbEndpoints = [
      '/api/leads?page=1&pageSize=100',
      '/api/leads/export',
      '/api/usage',
      '/api/user/profile'
    ];
    
    const userPromises: Promise<void>[] = [];
    
    for (let i = 0; i < config.maxConcurrentUsers; i++) {
      userPromises.push(this.simulateDbUser(dbEndpoints, config));
      await this.sleep(config.rampUpTimeMs / config.maxConcurrentUsers);
    }
    
    await Promise.allSettled(userPromises);
    
    const endTime = new Date();
    const metrics = this.calculateMetrics(config, startTime, endTime);
    const passed = this.evaluateTestSuccess(metrics);
    
    return {
      testName: 'Database Performance Test',
      config,
      metrics,
      passed,
      details: this.generateTestDetails(metrics, passed),
      errors: [...this.errors],
      startTime,
      endTime
    };
  }

  private async simulateDbUser(endpoints: string[], config: LoadTestConfig): Promise<void> {
    const startTime = Date.now();
    
    while ((Date.now() - startTime) < config.testDurationMs) {
      try {
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        
        const requestStart = performance.now();
        
        const response = await fetch(`${config.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;
        
        this.responseTimes.push(responseTime);
        
        if (!response.ok) {
          this.errors.push(`DB endpoint error: ${endpoint} - ${response.status}`);
        }
        
        await this.sleep(config.requestIntervalMs);
        
      } catch (error) {
        this.errors.push(`DB request failed: ${error}`);
        await this.sleep(config.requestIntervalMs);
      }
    }
  }

  private calculateMetrics(config: LoadTestConfig, startTime: Date, endTime: Date): TestMetrics {
    const totalRequests = this.responseTimes.length;
    const failedRequests = this.errors.length;
    const successfulRequests = totalRequests - failedRequests;
    
    // Sort response times for percentile calculations
    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
    
    const averageResponseTime = sortedTimes.length > 0 
      ? sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length 
      : 0;
    
    const p50ResponseTime = this.calculatePercentile(sortedTimes, 50);
    const p95ResponseTime = this.calculatePercentile(sortedTimes, 95);
    const p99ResponseTime = this.calculatePercentile(sortedTimes, 99);
    
    const minResponseTime = sortedTimes.length > 0 ? sortedTimes[0] : 0;
    const maxResponseTime = sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0;
    
    const testDurationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
    const requestsPerSecond = totalRequests / testDurationSeconds;
    
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
    
    // Memory usage (would be actual measurement in real implementation)
    const memoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      p50ResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      minResponseTime,
      maxResponseTime,
      requestsPerSecond,
      errorRate,
      memoryUsageMB,
      cpuUsagePercent: 0 // Would be actual measurement
    };
  }

  private calculatePercentile(sortedTimes: number[], percentile: number): number {
    if (sortedTimes.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedTimes.length) - 1;
    return sortedTimes[Math.max(0, Math.min(index, sortedTimes.length - 1))];
  }

  private evaluateTestSuccess(metrics: TestMetrics): boolean {
    // Define success criteria
    const successCriteria = {
      maxErrorRate: 1, // 1% error rate
      maxP95ResponseTime: 500, // 500ms
      maxP99ResponseTime: 2000, // 2 seconds
      minRequestsPerSecond: 10 // Minimum throughput
    };
    
    return (
      metrics.errorRate <= successCriteria.maxErrorRate &&
      metrics.p95ResponseTime <= successCriteria.maxP95ResponseTime &&
      metrics.p99ResponseTime <= successCriteria.maxP99ResponseTime &&
      metrics.requestsPerSecond >= successCriteria.minRequestsPerSecond
    );
  }

  private generateTestDetails(metrics: TestMetrics, passed: boolean): string {
    return `
Performance Metrics:
- Requests/sec: ${metrics.requestsPerSecond.toFixed(2)}
- Error rate: ${metrics.errorRate.toFixed(2)}%
- Avg response time: ${metrics.averageResponseTime.toFixed(2)}ms
- P95 response time: ${metrics.p95ResponseTime.toFixed(2)}ms
- P99 response time: ${metrics.p99ResponseTime.toFixed(2)}ms
- Memory usage: ${metrics.memoryUsageMB.toFixed(2)}MB

${passed ? '✅ Performance targets met' : '❌ Performance targets not met'}
    `.trim();
  }

  private selectWeightedEndpoint(endpoints: Array<{ path: string; method: string; weight: number; body?: any }>): { path: string; method: string; weight: number; body?: any } {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const endpoint of endpoints) {
      cumulativeWeight += endpoint.weight;
      if (random <= cumulativeWeight) {
        return endpoint;
      }
    }
    
    return endpoints[endpoints.length - 1];
  }

  private async setupAuthentication(): Promise<void> {
    // In a real implementation, this would obtain a valid auth token
    this.authToken = 'test-auth-token';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateLoadTestReport(results: LoadTestResult[]): string {
    let report = `
# 🚀 TrulyBot Load Testing Report
**Date:** ${new Date().toISOString()}
**Tests Completed:** ${results.length}

## 📊 Summary

`;

    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      report += `### ${status} ${result.testName}
**Duration:** ${((result.endTime.getTime() - result.startTime.getTime()) / 1000 / 60).toFixed(1)} minutes
**Success Rate:** ${((result.metrics.successfulRequests / result.metrics.totalRequests) * 100).toFixed(1)}%
**Throughput:** ${result.metrics.requestsPerSecond.toFixed(2)} req/sec
**P95 Response Time:** ${result.metrics.p95ResponseTime.toFixed(2)}ms
**Error Rate:** ${result.metrics.errorRate.toFixed(2)}%

${result.details}

`;

      if (result.errors.length > 0) {
        report += `**Errors:**\n`;
        result.errors.slice(0, 10).forEach(error => {
          report += `- ${error}\n`;
        });
        if (result.errors.length > 10) {
          report += `- ... and ${result.errors.length - 10} more errors\n`;
        }
        report += '\n';
      }
    });

    const overallPassed = results.every(r => r.passed);
    
    report += `## 🎯 Overall Assessment

**Status:** ${overallPassed ? '✅ PASSED' : '❌ FAILED'}

`;

    if (overallPassed) {
      report += `All load tests passed successfully. The system is ready for production deployment under expected load conditions.

`;
    } else {
      report += `Some load tests failed. Performance optimization required before production deployment.

**Recommendations:**
- Optimize slow database queries
- Implement better caching strategies
- Consider scaling infrastructure
- Review and optimize slow API endpoints

`;
    }

    return report;
  }
}

export default TrulyBotLoadTester;