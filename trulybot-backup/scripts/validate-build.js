#!/usr/bin/env node

// Simple build validation script
console.log('🔍 Validating build configuration...')

const fs = require('fs')
const path = require('path')

// Check critical files
const criticalFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'middleware.ts'
]

let hasErrors = false

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing critical file: ${file}`)
    hasErrors = true
  } else {
    console.log(`✅ Found: ${file}`)
  }
})

// Check package.json dependencies
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
  
  // Critical dependencies for Next.js
  const criticalDeps = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    'typescript'
  ]
  
  criticalDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]) {
      console.error(`❌ Missing dependency: ${dep}`)
      hasErrors = true
    } else {
      console.log(`✅ Dependency found: ${dep}`)
    }
  })
  
} catch (error) {
  console.error('❌ Error reading package.json:', error.message)
  hasErrors = true
}

// Check environment template
try {
  const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8')
  if (envExample.includes('NEXT_PUBLIC_SUPABASE_URL') && 
      envExample.includes('OPENAI_API_KEY')) {
    console.log('✅ Environment template looks good')
  } else {
    console.warn('⚠️  Environment template might be incomplete')
  }
} catch (error) {
  console.warn('⚠️  No .env.example file found')
}

if (hasErrors) {
  console.error('\n❌ Build validation failed!')
  process.exit(1)
} else {
  console.log('\n✅ Build validation passed!')
  process.exit(0)
}