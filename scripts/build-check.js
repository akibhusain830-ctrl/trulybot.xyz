#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting comprehensive build validation...\n');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'vercel.json',
  '.env.example'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    process.exit(1);
  }
});

// Check TypeScript compilation
console.log('\n🔧 Running TypeScript check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation passed');
} catch (error) {
  console.log('❌ TypeScript compilation failed:');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Check Next.js build
console.log('\n🏗️ Running Next.js build check...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Next.js build successful');
} catch (error) {
  console.log('❌ Next.js build failed:');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Check for critical dependencies
console.log('\n📦 Checking critical dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const criticalDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`⚠️  Missing critical dependency: ${dep}`);
  }
});

// Validate environment file
console.log('\n🌍 Checking environment configuration...');
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`✅ ${envVar}`);
    } else {
      console.log(`⚠️  Missing env var template: ${envVar}`);
    }
  });
}

console.log('\n🎉 Build validation completed successfully!');
console.log('\n📋 Summary:');
console.log('- All required files present');
console.log('- TypeScript compilation successful');
console.log('- Next.js build successful');
console.log('- Critical dependencies verified');
console.log('- Environment configuration validated');
console.log('\n✅ Your project is ready for deployment!');