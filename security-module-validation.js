/**
 * TrulyBot Security Module Validation
 * Direct testing of security components without HTTP requests
 */

// Test the security modules directly
async function validateSecurityModules() {
  console.log('🔒 TrulyBot Security Module Validation');
  console.log('======================================');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Check if security files exist
  const fs = require('fs');
  const path = require('path');
  
  const securityFiles = [
    'src/lib/security/rateLimit.ts',
    'src/lib/security/tenantIsolation.ts',
    'src/lib/security/inputValidation.ts',
    'src/lib/security/secureApiWrapper.ts',
    'src/app/api/widget/config/[userId]/route-secure.ts',
    'src/app/api/chat/route-secure.ts'
  ];

  console.log('📁 Checking security file existence...');
  for (const file of securityFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    const result = {
      name: `Security File: ${file}`,
      passed: exists,
      details: exists ? 'File exists' : 'File missing'
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  }

  // Test 2: Check security module exports
  console.log('\n🔧 Checking security module structure...');
  try {
    const rateLimit = require('./src/lib/security/rateLimit.ts');
    const result = {
      name: 'Rate Limit Module Structure',
      passed: typeof rateLimit === 'object',
      details: typeof rateLimit === 'object' ? 'Module exports correctly' : 'Module export issue'
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  } catch (error) {
    const result = {
      name: 'Rate Limit Module Structure',
      passed: false,
      details: `Module load error: ${error.message}`
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Test 3: Check TypeScript compilation
  console.log('\n🔍 Checking TypeScript compilation...');
  try {
    const { execSync } = require('child_process');
    execSync('npx tsc --noEmit --project tsconfig.json', { 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    const result = {
      name: 'TypeScript Compilation',
      passed: true,
      details: 'All TypeScript files compile without errors'
    };
    results.tests.push(result);
    results.total++;
    results.passed++;
    console.log(`   ✅ ${result.name}: ${result.details}`);
  } catch (error) {
    const result = {
      name: 'TypeScript Compilation',
      passed: false,
      details: `TypeScript errors detected: ${error.message.slice(0, 100)}...`
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Test 4: Check package.json dependencies
  console.log('\n📦 Checking security dependencies...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'next',
      'react',
      '@supabase/supabase-js',
      'redis'
    ];
    
    let missingDeps = [];
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    }
    
    const result = {
      name: 'Security Dependencies',
      passed: missingDeps.length === 0,
      details: missingDeps.length === 0 
        ? 'All required dependencies present' 
        : `Missing: ${missingDeps.join(', ')}`
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  } catch (error) {
    const result = {
      name: 'Security Dependencies',
      passed: false,
      details: `Package.json check failed: ${error.message}`
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Test 5: Check environment variables setup
  console.log('\n🌍 Checking environment configuration...');
  const envFile = '.env.local';
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY'
    ];
    
    let missingEnvVars = [];
    for (const envVar of requiredEnvVars) {
      if (!envContent.includes(envVar)) {
        missingEnvVars.push(envVar);
      }
    }
    
    const result = {
      name: 'Environment Configuration',
      passed: missingEnvVars.length === 0,
      details: missingEnvVars.length === 0 
        ? 'All required environment variables configured' 
        : `Missing: ${missingEnvVars.join(', ')}`
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  } else {
    const result = {
      name: 'Environment Configuration',
      passed: false,
      details: '.env.local file not found'
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Test 6: Check API route structure
  console.log('\n🛣️ Checking API route structure...');
  const apiRoutes = [
    'src/app/api/chat',
    'src/app/api/widget',
    'src/app/api/user',
    'src/app/api/leads'
  ];
  
  let validRoutes = 0;
  for (const route of apiRoutes) {
    if (fs.existsSync(path.join(process.cwd(), route))) {
      validRoutes++;
    }
  }
  
  const result = {
    name: 'API Route Structure',
    passed: validRoutes === apiRoutes.length,
    details: `${validRoutes}/${apiRoutes.length} API routes found`
  };
  results.tests.push(result);
  results.total++;
  if (result.passed) results.passed++;
  else results.failed++;
  console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);

  // Summary
  console.log('\n📊 Validation Summary');
  console.log('=====================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  const overallPassed = results.failed === 0;
  console.log(`\n🎯 Overall Status: ${overallPassed ? '✅ SECURITY MODULES VALIDATED' : '❌ ISSUES DETECTED'}`);
  
  if (!overallPassed) {
    console.log('\n🚨 Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
  }

  // Generate recommendations
  console.log('\n📋 Security Assessment');
  console.log('======================');
  
  const criticalIssues = results.tests.filter(t => 
    !t.passed && (
      t.name.includes('Security File') || 
      t.name.includes('TypeScript') ||
      t.name.includes('Dependencies')
    )
  );
  
  if (criticalIssues.length === 0) {
    console.log('✅ All critical security components are in place');
    console.log('✅ System appears ready for security testing');
    console.log('');
    console.log('Next Steps:');
    console.log('1. Start the application server');
    console.log('2. Run comprehensive security tests');
    console.log('3. Conduct performance and resilience testing');
    console.log('4. Generate final production readiness report');
  } else {
    console.log('❌ Critical security issues detected');
    console.log('');
    console.log('Required Actions:');
    criticalIssues.forEach(issue => {
      console.log(`   - Fix: ${issue.name} - ${issue.details}`);
    });
  }

  return results;
}

// Run the validation
validateSecurityModules().catch(console.error);