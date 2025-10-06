#!/usr/bin/env node

/**
 * TrulyBot Comprehensive Validation & Testing Suite
 * Master test runner for all validation scenarios
 * 
 * Usage: node run-validation-tests.js [--security] [--performance] [--failure] [--all]
 */

import TrulyBotSecurityTester from './src/tests/security/SecurityTestSuite.js';
import TrulyBotLoadTester from './src/tests/performance/LoadTestSuite.js';
import TrulyBotFailureScenarioTester from './src/tests/resilience/FailureScenarioTester.js';
import fs from 'fs';
import path from 'path';

interface ValidationConfig {
  baseUrl: string;
  outputDir: string;
  runSecurity: boolean;
  runPerformance: boolean;
  runFailure: boolean;
  generateReport: boolean;
}

interface ValidationResults {
  security?: any[];
  performance?: any[];
  failure?: any[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallPassed: boolean;
    criticalIssues: string[];
    recommendations: string[];
  };
}

class TrulyBotValidationRunner {
  private config: ValidationConfig;

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  async runCompleteValidation(): Promise<ValidationResults> {
    console.log('🚀 TrulyBot Production Readiness Validation Suite');
    console.log('================================================');
    console.log(`Base URL: ${this.config.baseUrl}`);
    console.log(`Output Directory: ${this.config.outputDir}`);
    console.log('');

    const results: ValidationResults = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        overallPassed: false,
        criticalIssues: [],
        recommendations: []
      }
    };

    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    try {
      // Phase 1: Security Testing (Critical)
      if (this.config.runSecurity) {
        console.log('🔒 Phase 1: Security Testing');
        console.log('=============================');
        
        const securityTester = new TrulyBotSecurityTester(this.config.baseUrl);
        results.security = await securityTester.runComprehensiveSecurityTests();
        
        const securityReport = securityTester.generateSecurityReport(results.security);
        this.saveReport('security-test-report.md', securityReport);
        
        const securityPassed = results.security.every(test => test.passed);
        const securityCritical = results.security.filter(test => 
          test.severity === 'critical' && !test.passed
        );
        
        results.summary.totalTests += results.security.length;
        results.summary.passedTests += results.security.filter(t => t.passed).length;
        results.summary.failedTests += results.security.filter(t => !t.passed).length;
        
        if (securityCritical.length > 0) {
          results.summary.criticalIssues.push(
            ...securityCritical.map(test => `Security: ${test.testName}`)
          );
        }
        
        console.log(`Security Tests: ${securityPassed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Critical Security Issues: ${securityCritical.length}`);
        console.log('');
      }

      // Phase 2: Performance Testing (High Priority)
      if (this.config.runPerformance) {
        console.log('⚡ Phase 2: Performance Testing');
        console.log('===============================');
        
        const loadTester = new TrulyBotLoadTester(this.config.baseUrl);
        results.performance = await loadTester.runComprehensiveLoadTest();
        
        const performanceReport = loadTester.generateLoadTestReport(results.performance);
        this.saveReport('performance-test-report.md', performanceReport);
        
        const performancePassed = results.performance.every(test => test.passed);
        const performanceCritical = results.performance.filter(test => 
          !test.passed && (test.metrics.errorRate > 5 || test.metrics.p99ResponseTime > 5000)
        );
        
        results.summary.totalTests += results.performance.length;
        results.summary.passedTests += results.performance.filter(t => t.passed).length;
        results.summary.failedTests += results.performance.filter(t => !t.passed).length;
        
        if (performanceCritical.length > 0) {
          results.summary.criticalIssues.push(
            ...performanceCritical.map(test => `Performance: ${test.testName}`)
          );
        }
        
        console.log(`Performance Tests: ${performancePassed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Critical Performance Issues: ${performanceCritical.length}`);
        console.log('');
      }

      // Phase 3: Failure Scenario Testing (Medium Priority)
      if (this.config.runFailure) {
        console.log('💥 Phase 3: Failure Scenario Testing');
        console.log('====================================');
        
        const failureTester = new TrulyBotFailureScenarioTester(this.config.baseUrl);
        results.failure = await failureTester.runComprehensiveFailureTests();
        
        const failureReport = failureTester.generateFailureTestReport(results.failure);
        this.saveReport('failure-scenario-report.md', failureReport);
        
        const failurePassed = results.failure.filter(test => test.passed).length >= results.failure.length * 0.8;
        const failureCritical = results.failure.filter(test => 
          !test.passed && (test.scenario.includes('Database') || test.scenario.includes('Authentication'))
        );
        
        results.summary.totalTests += results.failure.length;
        results.summary.passedTests += results.failure.filter(t => t.passed).length;
        results.summary.failedTests += results.failure.filter(t => !t.passed).length;
        
        if (failureCritical.length > 0) {
          results.summary.criticalIssues.push(
            ...failureCritical.map(test => `Resilience: ${test.scenario}`)
          );
        }
        
        console.log(`Failure Tests: ${failurePassed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Critical Resilience Issues: ${failureCritical.length}`);
        console.log('');
      }

      // Generate overall assessment
      results.summary.overallPassed = this.assessOverallReadiness(results);
      results.summary.recommendations = this.generateRecommendations(results);

      // Generate comprehensive report
      if (this.config.generateReport) {
        const comprehensiveReport = this.generateComprehensiveReport(results);
        this.saveReport('PRODUCTION_READINESS_REPORT.md', comprehensiveReport);
      }

      return results;

    } catch (error) {
      console.error('❌ Validation suite failed:', error);
      throw error;
    }
  }

  private assessOverallReadiness(results: ValidationResults): boolean {
    // Critical criteria for production readiness
    const hasNoCriticalSecurityIssues = !results.security || 
      results.security.filter(t => t.severity === 'critical' && !t.passed).length === 0;
    
    const hasAcceptablePerformance = !results.performance || 
      results.performance.every(t => t.metrics.errorRate < 5 && t.metrics.p95ResponseTime < 1000);
    
    const hasBasicResilience = !results.failure || 
      results.failure.filter(t => t.passed).length >= results.failure.length * 0.7;
    
    const overallPassRate = results.summary.passedTests / results.summary.totalTests;
    
    return hasNoCriticalSecurityIssues && 
           hasAcceptablePerformance && 
           hasBasicResilience && 
           overallPassRate >= 0.85;
  }

  private generateRecommendations(results: ValidationResults): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (results.security) {
      const failedSecurity = results.security.filter(t => !t.passed);
      if (failedSecurity.length > 0) {
        recommendations.push('Address all security vulnerabilities before production deployment');
        recommendations.push('Implement comprehensive security monitoring and alerting');
        recommendations.push('Conduct regular security audits and penetration testing');
      }
    }

    // Performance recommendations
    if (results.performance) {
      const failedPerformance = results.performance.filter(t => !t.passed);
      if (failedPerformance.length > 0) {
        recommendations.push('Optimize slow database queries and API endpoints');
        recommendations.push('Implement caching strategies for frequently accessed data');
        recommendations.push('Consider horizontal scaling for high-traffic scenarios');
        recommendations.push('Set up performance monitoring and alerting');
      }
    }

    // Resilience recommendations
    if (results.failure) {
      const failedResilience = results.failure.filter(t => !t.passed);
      if (failedResilience.length > 0) {
        recommendations.push('Implement circuit breakers for external service dependencies');
        recommendations.push('Add comprehensive error handling and retry logic');
        recommendations.push('Set up health checks and automatic recovery mechanisms');
        recommendations.push('Implement graceful degradation for non-critical features');
      }
    }

    // General recommendations
    if (results.summary.criticalIssues.length > 0) {
      recommendations.push('Address all critical issues before production deployment');
      recommendations.push('Implement comprehensive monitoring and observability');
      recommendations.push('Create incident response and recovery procedures');
    }

    return recommendations;
  }

  private generateComprehensiveReport(results: ValidationResults): string {
    const timestamp = new Date().toISOString();
    const passRate = ((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(1);
    
    let report = `# 🚀 TrulyBot Production Readiness Assessment
**Generated:** ${timestamp}
**Assessment Status:** ${results.summary.overallPassed ? '✅ PRODUCTION READY' : '❌ NOT READY FOR PRODUCTION'}

## 📊 Executive Summary

**Overall Test Score:** ${results.summary.passedTests}/${results.summary.totalTests} (${passRate}%)
**Critical Issues:** ${results.summary.criticalIssues.length}
**Production Ready:** ${results.summary.overallPassed ? 'YES' : 'NO'}

`;

    if (results.summary.criticalIssues.length > 0) {
      report += `## 🚨 Critical Issues
${results.summary.criticalIssues.map(issue => `- ${issue}`).join('\n')}

`;
    }

    // Security Section
    if (results.security) {
      const securityPassed = results.security.filter(t => t.passed).length;
      const securityTotal = results.security.length;
      const securityScore = ((securityPassed / securityTotal) * 100).toFixed(1);
      
      report += `## 🔒 Security Assessment
**Score:** ${securityPassed}/${securityTotal} (${securityScore}%)
**Status:** ${securityPassed === securityTotal ? '✅ SECURE' : '❌ VULNERABILITIES FOUND'}

`;
    }

    // Performance Section
    if (results.performance) {
      const performancePassed = results.performance.filter(t => t.passed).length;
      const performanceTotal = results.performance.length;
      const performanceScore = ((performancePassed / performanceTotal) * 100).toFixed(1);
      
      report += `## ⚡ Performance Assessment
**Score:** ${performancePassed}/${performanceTotal} (${performanceScore}%)
**Status:** ${performancePassed === performanceTotal ? '✅ OPTIMIZED' : '❌ PERFORMANCE ISSUES'}

`;
    }

    // Resilience Section
    if (results.failure) {
      const resiliencePassed = results.failure.filter(t => t.passed).length;
      const resilienceTotal = results.failure.length;
      const resilienceScore = ((resiliencePassed / resilienceTotal) * 100).toFixed(1);
      
      report += `## 💪 Resilience Assessment
**Score:** ${resiliencePassed}/${resilienceTotal} (${resilienceScore}%)
**Status:** ${resilienceScore >= '80' ? '✅ RESILIENT' : '❌ FRAGILE'}

`;
    }

    // Recommendations
    if (results.summary.recommendations.length > 0) {
      report += `## 📋 Recommendations

${results.summary.recommendations.map(rec => `1. ${rec}`).join('\n')}

`;
    }

    // Next Steps
    report += `## 🎯 Next Steps

`;

    if (results.summary.overallPassed) {
      report += `**The system is ready for production deployment!**

1. Deploy to staging environment for final validation
2. Set up production monitoring and alerting
3. Prepare incident response procedures
4. Schedule regular security and performance audits
5. Monitor system performance and user feedback post-deployment

`;
    } else {
      report += `**The system requires additional work before production deployment.**

1. Address all critical security and performance issues
2. Re-run validation tests to confirm fixes
3. Implement recommended monitoring and resilience features
4. Conduct additional testing in staging environment
5. Schedule follow-up assessment after improvements

`;
    }

    report += `## 📄 Detailed Reports

- [Security Test Report](./security-test-report.md)
- [Performance Test Report](./performance-test-report.md)
- [Failure Scenario Report](./failure-scenario-report.md)

---
*Generated by TrulyBot Validation Suite v1.0*`;

    return report;
  }

  private saveReport(filename: string, content: string): void {
    const filepath = path.join(this.config.outputDir, filename);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`📄 Report saved: ${filepath}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const config: ValidationConfig = {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    outputDir: process.env.OUTPUT_DIR || './test-reports',
    runSecurity: args.includes('--security') || args.includes('--all'),
    runPerformance: args.includes('--performance') || args.includes('--all'),
    runFailure: args.includes('--failure') || args.includes('--all'),
    generateReport: true
  };

  // Default to all tests if no specific test type specified
  if (!config.runSecurity && !config.runPerformance && !config.runFailure) {
    config.runSecurity = true;
    config.runPerformance = true;
    config.runFailure = true;
  }

  console.log('🧪 TrulyBot Comprehensive Validation Suite');
  console.log('===========================================');
  console.log('This suite will validate production readiness by:');
  console.log('- Testing security vulnerabilities and defenses');
  console.log('- Measuring performance under various load conditions');
  console.log('- Verifying system resilience during failure scenarios');
  console.log('');

  const runner = new TrulyBotValidationRunner(config);
  
  try {
    const results = await runner.runCompleteValidation();
    
    console.log('🎉 Validation Complete!');
    console.log('=======================');
    console.log(`Overall Status: ${results.summary.overallPassed ? '✅ PRODUCTION READY' : '❌ NOT READY'}`);
    console.log(`Test Score: ${results.summary.passedTests}/${results.summary.totalTests}`);
    console.log(`Critical Issues: ${results.summary.criticalIssues.length}`);
    console.log('');
    console.log(`Reports generated in: ${config.outputDir}`);
    
    // Exit with appropriate code
    process.exit(results.summary.overallPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TrulyBotValidationRunner, ValidationConfig, ValidationResults };