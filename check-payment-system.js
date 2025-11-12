#!/usr/bin/env node

/**
 * Payment System Health Check Script
 * Verifies Razorpay integration configuration
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔐 RAZORPAY PAYMENT SYSTEM HEALTH CHECK\n');
console.log('='.repeat(60));

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

// Parse environment variables
const env = {};
envLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check critical environment variables
const checks = [
  {
    name: 'Razorpay Public Key',
    key: 'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    required: true,
    validate: (val) => val && val.startsWith('rzp_'),
    advice: 'Should start with rzp_live_ (production) or rzp_test_ (testing)'
  },
  {
    name: 'Razorpay Secret Key',
    key: 'RAZORPAY_KEY_SECRET',
    required: true,
    validate: (val) => val && val.length >= 15,
    advice: 'Keep this secret! Never commit to git'
  },
  {
    name: 'Razorpay Webhook Secret',
    key: 'RAZORPAY_WEBHOOK_SECRET',
    required: true,
    validate: (val) => val && val !== 'your_webhook_secret_here',
    advice: 'Get from Razorpay Dashboard > Settings > Webhooks'
  },
  {
    name: 'Supabase URL',
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    validate: (val) => val && val.includes('supabase.co'),
    advice: 'Required for database operations'
  },
  {
    name: 'Supabase Service Role Key',
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    validate: (val) => val && val.startsWith('eyJ'),
    advice: 'Keep this secret! Has full database access'
  }
];

console.log('\n📋 Environment Variables Check:\n');

let allPassed = true;
let criticalFailures = 0;

checks.forEach(check => {
  const value = env[check.key];
  const exists = !!value;
  const valid = exists && check.validate(value);
  
  let status = '✅';
  let message = 'OK';
  
  if (!exists) {
    status = check.required ? '❌' : '⚠️';
    message = 'MISSING';
    if (check.required) {
      criticalFailures++;
      allPassed = false;
    }
  } else if (!valid) {
    status = check.required ? '❌' : '⚠️';
    message = 'INVALID';
    if (check.required) {
      criticalFailures++;
      allPassed = false;
    }
  }
  
  console.log(`${status} ${check.name}`);
  console.log(`   Key: ${check.key}`);
  console.log(`   Status: ${message}`);
  
  if (exists && value) {
    // Mask sensitive values
    const maskedValue = value.length > 10 
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : '***';
    console.log(`   Value: ${maskedValue}`);
  }
  
  if (!valid && check.advice) {
    console.log(`   ℹ️  ${check.advice}`);
  }
  
  console.log('');
});

console.log('='.repeat(60));

// Check file structure
console.log('\n📂 Critical Files Check:\n');

const criticalFiles = [
  'src/app/api/payments/create-order/route.ts',
  'src/app/api/payments/verify-payment/route.ts',
  'src/app/api/webhooks/razorpay/route.ts',
  'src/components/ui/RazorpayButton.tsx',
  'src/lib/constants/pricing.ts',
];

let filesOk = true;
criticalFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) filesOk = false;
});

console.log('\n='.repeat(60));

// Final summary
console.log('\n📊 SUMMARY:\n');

if (allPassed && filesOk) {
  console.log('✅ All checks passed!');
  console.log('✅ Payment system is configured correctly');
  console.log('\n📝 Next Steps:');
  console.log('   1. Configure webhook URL in Razorpay Dashboard');
  console.log('   2. Test payment flow in development');
  console.log('   3. Run: npm run dev');
  console.log('   4. Navigate to: http://localhost:3000/#pricing');
  console.log('   5. Test a payment with Razorpay test card');
} else {
  console.log(`❌ ${criticalFailures} critical issue(s) found`);
  console.log('⚠️  Payment system requires configuration');
  console.log('\n📝 Action Required:');
  console.log('   1. Add missing environment variables to .env.local');
  console.log('   2. Get Razorpay keys from: https://dashboard.razorpay.com/');
  console.log('   3. Re-run this script to verify');
}

console.log('\n📖 Full Documentation: PAYMENT_SYSTEM_AUDIT.md');
console.log('='.repeat(60));
console.log('');

process.exit(allPassed && filesOk ? 0 : 1);
