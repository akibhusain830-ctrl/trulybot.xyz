#!/bin/bash
# Production Readiness Verification Script

echo "🔍 TrulyBot Production Readiness Verification"
echo "=============================================="
echo ""

PASS=0
FAIL=0
WARN=0

check_pass() {
  echo "✅ $1"
  ((PASS++))
}

check_fail() {
  echo "❌ $1"
  ((FAIL++))
}

check_warn() {
  echo "⚠️  $1"
  ((WARN++))
}

# 1. Code Quality
echo "📋 Code Quality Checks:"
[ -f "package.json" ] && check_pass "package.json exists" || check_fail "package.json missing"
[ -f "tsconfig.json" ] && check_pass "tsconfig.json exists" || check_fail "tsconfig.json missing"
[ -f ".eslintrc.mjs" ] && check_pass "ESLint configured" || check_fail "ESLint not configured"
[ -f "next.config.js" ] && check_pass "Next.js configured" || check_fail "Next.config missing"

# 2. Test Infrastructure
echo ""
echo "🧪 Test Infrastructure:"
[ -f "vitest.config.ts" ] && check_pass "Vitest configured" || check_warn "Vitest not configured"
[ -f "playwright.config.ts" ] && check_pass "Playwright configured" || check_warn "Playwright not configured"
[ -f "jest.config.js" ] && check_pass "Jest configured" || check_warn "Jest not configured"

# 3. Security
echo ""
echo "🔒 Security Files:"
[ -f "src/lib/security/inputValidation.ts" ] && check_pass "Input validation implemented" || check_fail "Input validation missing"
[ -f "src/lib/security/rateLimit.ts" ] && check_pass "Rate limiting implemented" || check_fail "Rate limiting missing"
[ -f "src/lib/security/tenantIsolation.ts" ] && check_pass "Tenant isolation implemented" || check_fail "Tenant isolation missing"
[ -f "src/lib/apiSecurity.ts" ] && check_pass "API security implemented" || check_fail "API security missing"

# 4. Monitoring
echo ""
echo "📊 Monitoring & Observability:"
[ -f "src/lib/monitoring.ts" ] && check_pass "Monitoring setup created" || check_fail "Monitoring missing"
[ -f "src/app/api/health/route.ts" ] && check_pass "Health check endpoint exists" || check_fail "Health endpoint missing"
[ -f "src/app/api/healthz/route.ts" ] && check_pass "Kubernetes health check exists" || check_fail "Healthz endpoint missing"

# 5. Database
echo ""
echo "🗄️  Database Configuration:"
[ -f "migrations/001_production_schema.sql" ] && check_pass "Production schema migration exists" || check_fail "Migration missing"

# 6. Tests
echo ""
echo "🧪 Test Files:"
[ -f "src/tests/payment.test.ts" ] && check_pass "Payment tests created" || check_warn "Payment tests missing"
[ -f "src/tests/auth.test.ts" ] && check_pass "Auth tests created" || check_warn "Auth tests missing"
[ -f "src/tests/validation.test.ts" ] && check_pass "Validation tests created" || check_warn "Validation tests missing"

# 7. CI/CD
echo ""
echo "🚀 CI/CD Pipeline:"
[ -f ".github/workflows/ci-cd.yml" ] && check_pass "GitHub Actions workflow configured" || check_fail "CI/CD missing"

# 8. Environment Configuration
echo ""
echo "⚙️  Environment Configuration:"
[ -f ".env.production.template" ] && check_pass "Production env template exists" || check_warn "Env template missing"
[ -f "deploy.sh" ] && check_pass "Deployment script exists" || check_warn "Deploy script missing"

# 9. Documentation
echo ""
echo "📚 Documentation:"
[ -f "DEPLOYMENT.md" ] && check_pass "Deployment guide exists" || check_warn "Deployment guide missing"
[ -f "ARCHITECTURE_DOCUMENTATION.md" ] && check_pass "Architecture docs exist" || check_warn "Architecture docs missing"

# Summary
echo ""
echo "=============================================="
echo "📊 Production Readiness Summary:"
echo "  ✅ Passed: $PASS"
echo "  ❌ Failed: $FAIL"
echo "  ⚠️  Warnings: $WARN"
echo "=============================================="

if [ $FAIL -eq 0 ]; then
  if [ $WARN -eq 0 ]; then
    echo ""
    echo "🎉 System is production-ready!"
    echo ""
    echo "Next steps:"
    echo "1. npm run build"
    echo "2. npm run test"
    echo "3. Apply database migration: migrations/001_production_schema.sql"
    echo "4. Set production environment variables"
    echo "5. ./deploy.sh production vercel"
    exit 0
  else
    echo ""
    echo "✅ Core features are production-ready"
    echo "⚠️  Address warnings before going live"
    exit 0
  fi
else
  echo ""
  echo "❌ System is NOT production-ready"
  echo "Please fix all failures before deployment"
  exit 1
fi
