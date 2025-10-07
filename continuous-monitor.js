// Continuous Monitoring Script for Payment System Robustness
// This script should be run periodically (e.g., every 15 minutes) to ensure system health

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

console.log("🔄 CONTINUOUS PAYMENT SYSTEM MONITOR");
console.log("=".repeat(50));
console.log("Started at:", new Date().toISOString());

const config = {
  BASE_URL: process.env.MONITOR_BASE_URL || 'http://localhost:3000',
  RECOVERY_ADMIN_KEY: process.env.RECOVERY_ADMIN_KEY || 'dev-recovery-key',
  CHECK_INTERVAL: 15 * 60 * 1000, // 15 minutes
  ALERT_THRESHOLD: 3 // Alert after 3 failed checks
};

let consecutiveFailures = 0;
let isMonitoring = true;

// Health check results
const healthMetrics = {
  lastCheck: null,
  totalChecks: 0,
  successfulChecks: 0,
  failedChecks: 0,
  lastRecoveryRun: null,
  usersRecovered: 0
};

/**
 * Basic health check of the API
 */
async function performHealthCheck() {
  const checks = [];
  
  try {
    // Check 1: Basic server response
    const pingResponse = await fetch(`${config.BASE_URL}/api/health`);
    checks.push({
      name: 'Server Health',
      success: pingResponse.ok,
      details: `HTTP ${pingResponse.status}`
    });
  } catch (error) {
    checks.push({
      name: 'Server Health',
      success: false,
      details: error.message
    });
  }

  try {
    // Check 2: Subscription status endpoint (should require auth)
    const statusResponse = await fetch(`${config.BASE_URL}/api/subscription/status`);
    checks.push({
      name: 'Auth Protection',
      success: statusResponse.status === 401 || statusResponse.status === 403,
      details: `Auth check: ${statusResponse.status}`
    });
  } catch (error) {
    checks.push({
      name: 'Auth Protection',
      success: false,
      details: error.message
    });
  }

  try {
    // Check 3: Payment endpoint accessibility
    const paymentResponse = await fetch(`${config.BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    checks.push({
      name: 'Payment Endpoints',
      success: paymentResponse.status === 401 || paymentResponse.status === 400,
      details: `Payment check: ${paymentResponse.status}`
    });
  } catch (error) {
    checks.push({
      name: 'Payment Endpoints',
      success: false,
      details: error.message
    });
  }

  return checks;
}

/**
 * Run automatic recovery process
 */
async function runRecoveryProcess() {
  try {
    console.log("🔄 Running automatic recovery process...");
    
    const response = await fetch(`${config.BASE_URL}/api/subscription/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_key: config.RECOVERY_ADMIN_KEY })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      const result = data.result;
      console.log(`✅ Recovery completed: ${result.usersRecovered}/${result.usersChecked} users recovered`);
      
      healthMetrics.lastRecoveryRun = new Date().toISOString();
      healthMetrics.usersRecovered += result.usersRecovered;
      
      if (result.usersRecovered > 0) {
        console.log("🚨 ALERT: Found and recovered failed subscription activations!");
        console.log("Recovery actions:", result.recoveryActions);
      }
      
      return {
        success: true,
        usersChecked: result.usersChecked,
        usersRecovered: result.usersRecovered,
        failures: result.failures
      };
    } else {
      console.log("❌ Recovery process failed:", data.error || data.message);
      return { success: false, error: data.error || data.message };
    }
    
  } catch (error) {
    console.log("❌ Recovery process error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send alert notification (placeholder - implement based on your notification system)
 */
async function sendAlert(alertType, details) {
  console.log(`🚨 ALERT [${alertType}]:`, details);
  
  // TODO: Implement actual alerting
  // - Send email to admin
  // - Send Slack notification
  // - Log to monitoring service
  // - etc.
  
  // For now, just log prominently
  console.log("=".repeat(50));
  console.log("⚠️  SYSTEM ALERT - IMMEDIATE ATTENTION REQUIRED");
  console.log("Type:", alertType);
  console.log("Details:", JSON.stringify(details, null, 2));
  console.log("Time:", new Date().toISOString());
  console.log("=".repeat(50));
}

/**
 * Main monitoring loop
 */
async function runMonitoringCycle() {
  try {
    console.log(`\n🔍 Running monitoring cycle ${healthMetrics.totalChecks + 1}`);
    
    // Perform health checks
    const healthChecks = await performHealthCheck();
    const allHealthy = healthChecks.every(check => check.success);
    
    healthMetrics.totalChecks++;
    healthMetrics.lastCheck = new Date().toISOString();
    
    if (allHealthy) {
      console.log("✅ All health checks passed");
      healthMetrics.successfulChecks++;
      consecutiveFailures = 0;
    } else {
      console.log("❌ Some health checks failed:");
      healthChecks.filter(check => !check.success).forEach(check => {
        console.log(`  - ${check.name}: ${check.details}`);
      });
      
      healthMetrics.failedChecks++;
      consecutiveFailures++;
      
      if (consecutiveFailures >= config.ALERT_THRESHOLD) {
        await sendAlert('HEALTH_CHECK_FAILURES', {
          consecutiveFailures,
          failedChecks: healthChecks.filter(check => !check.success),
          threshold: config.ALERT_THRESHOLD
        });
      }
    }
    
    // Run recovery process
    const recoveryResult = await runRecoveryProcess();
    
    if (!recoveryResult.success) {
      await sendAlert('RECOVERY_PROCESS_FAILED', {
        error: recoveryResult.error,
        time: new Date().toISOString()
      });
    } else if (recoveryResult.usersRecovered > 0) {
      await sendAlert('USERS_RECOVERED', {
        usersRecovered: recoveryResult.usersRecovered,
        usersChecked: recoveryResult.usersChecked,
        failures: recoveryResult.failures
      });
    }
    
    // Print status summary
    console.log("\n📊 System Status:");
    console.log(`  Health: ${allHealthy ? '✅ Healthy' : '❌ Issues detected'}`);
    console.log(`  Checks: ${healthMetrics.successfulChecks}/${healthMetrics.totalChecks} successful`);
    console.log(`  Recovery: ${recoveryResult.usersRecovered} users recovered this cycle`);
    console.log(`  Total recovered: ${healthMetrics.usersRecovered} users`);
    console.log(`  Next check: ${new Date(Date.now() + config.CHECK_INTERVAL).toLocaleTimeString()}`);
    
  } catch (error) {
    console.error("❌ Monitoring cycle failed:", error);
    await sendAlert('MONITORING_SYSTEM_ERROR', {
      error: error.message,
      stack: error.stack
    });
  }
}

/**
 * Start continuous monitoring
 */
async function startMonitoring() {
  console.log("🚀 Starting continuous payment system monitoring");
  console.log(`Check interval: ${config.CHECK_INTERVAL / 1000 / 60} minutes`);
  console.log(`Alert threshold: ${config.ALERT_THRESHOLD} consecutive failures`);
  
  // Run initial check
  await runMonitoringCycle();
  
  // Set up recurring checks
  const monitoringInterval = setInterval(async () => {
    if (isMonitoring) {
      await runMonitoringCycle();
    }
  }, config.CHECK_INTERVAL);
  
  // Graceful shutdown handling
  process.on('SIGINT', () => {
    console.log('\n🛑 Monitoring shutdown requested');
    isMonitoring = false;
    clearInterval(monitoringInterval);
    
    console.log("📊 Final Statistics:");
    console.log(`  Total checks: ${healthMetrics.totalChecks}`);
    console.log(`  Success rate: ${((healthMetrics.successfulChecks / healthMetrics.totalChecks) * 100).toFixed(1)}%`);
    console.log(`  Users recovered: ${healthMetrics.usersRecovered}`);
    console.log(`  Monitoring duration: ${new Date().toISOString()}`);
    
    process.exit(0);
  });
  
  console.log("✅ Monitoring system started. Press Ctrl+C to stop.");
}

// Start monitoring if this script is run directly
if (require.main === module) {
  startMonitoring().catch(error => {
    console.error("Failed to start monitoring:", error);
    process.exit(1);
  });
}

module.exports = { 
  startMonitoring, 
  runMonitoringCycle, 
  performHealthCheck,
  healthMetrics 
};