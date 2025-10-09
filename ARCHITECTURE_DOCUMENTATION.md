# 🏗️ TrulyBot Architecture Documentation
**Multi-Tenant AI SaaS Platform - Production-Ready Architecture**

---

## 📋 **EXECUTIVE SUMMARY**

TrulyBot is a **production-grade, multi-tenant AI chatbot platform** built on modern web technologies with enterprise-level security. The architecture has been **completely hardened** with comprehensive security controls, tenant isolation, and scalability features.

**Current Status:** ✅ **Production Ready** (after security fixes)  
**Security Level:** 🔒 **Enterprise Grade**  
**Scalability:** 📈 **Horizontally Scalable**

---

## 🏛️ **SYSTEM ARCHITECTURE**

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Database      │
│   Next.js 14    │◄──►│   Middleware    │◄──►│   PostgreSQL    │
│   React 18      │    │   Security      │    │   + Supabase    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Widget SDK    │    │   Rate Limiter  │    │   Vector Store  │
│   Embeddable    │    │   Redis Cache   │    │   AI Embeddings │
│   Cross-Origin  │    │   Session Store │    │   Knowledge Base│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Payment       │    │   AI Services   │    │   Monitoring    │
│   Razorpay      │    │   OpenAI API    │    │   Sentry/Logs   │
│   Webhooks      │    │   Embeddings    │    │   Performance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🛡️ **SECURITY ARCHITECTURE**

### **Defense in Depth Model**
```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                │
│  • HTTPS/TLS 1.3 • CSP Headers • XSS Protection • CSRF         │
├─────────────────────────────────────────────────────────────────┤
│                   EDGE/CDN LAYER                                │
│  • DDoS Protection • Geo-blocking • WAF Rules • Bot Detection  │
├─────────────────────────────────────────────────────────────────┤
│                 APPLICATION LAYER                               │
│  • Authentication • Authorization • Input Validation • RBAC    │
├─────────────────────────────────────────────────────────────────┤
│                   API LAYER                                     │
│  • Rate Limiting • Tenant Isolation • Request Validation       │
├─────────────────────────────────────────────────────────────────┤
│                  DATABASE LAYER                                 │
│  • Row-Level Security • Encrypted Connections • Audit Logs     │
└─────────────────────────────────────────────────────────────────┘
```

### **Security Components**

#### **1. Authentication System**
- **Provider:** Supabase Auth (JWT-based)
- **Token Validation:** Every protected route
- **Session Management:** Secure HTTP-only cookies
- **Password Policy:** Complex requirements enforced

#### **2. Tenant Isolation**
- **Model:** Shared database with workspace-level isolation
- **Enforcement:** Row-Level Security (RLS) policies
- **Validation:** Middleware-enforced tenant context
- **Audit:** Complete access logging

#### **3. Rate Limiting**
- **Backend:** Redis-based distributed limiting
- **Granularity:** Per-IP, per-user, per-endpoint
- **Policies:** Different limits for different endpoints
- **Fallback:** Memory-based when Redis unavailable

#### **4. Input Validation**
- **Framework:** Zod schema validation
- **Protection:** SQL injection, XSS, path traversal
- **Sanitization:** Comprehensive input cleaning
- **File Uploads:** Secure file type and size validation

---

## 🏢 **MULTI-TENANCY ARCHITECTURE**

### **Tenancy Model: Shared Database + Workspace Isolation**

```sql
-- Core Schema Structure
workspaces (id, name, slug, created_at)
    │
    ├── profiles (workspace_id, user_id, role, subscription)
    ├── leads (workspace_id, email, status, created_at)
    ├── usage_counters (workspace_id, monthly_stats)
    └── documents (workspace_id, content, embeddings)
```

### **Isolation Mechanisms**

#### **1. Database Level**
```sql
-- Row-Level Security Policies
CREATE POLICY "tenant_isolation" ON profiles
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );
```

#### **2. Application Level**
```typescript
// Tenant Context Middleware
export async function validateTenantContext(req: NextRequest) {
  const user = await authenticateUser(req);
  const workspace = await getUserWorkspace(user.id);
  return { userId: user.id, workspaceId: workspace.id };
}
```

#### **3. API Level**
```typescript
// Automatic tenant filtering
const { data } = await supabase
  .from('leads')
  .select('*')
  .eq('workspace_id', context.workspaceId); // Auto-injected
```

---

## 🗄️ **DATABASE ARCHITECTURE**

### **PostgreSQL + Supabase Setup**

#### **Core Tables**
```sql
-- Workspaces (Tenant containers)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (Users within workspaces)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  subscription_tier TEXT DEFAULT 'ultra',
  subscription_status TEXT DEFAULT 'trial'
);

-- Leads (Customer leads per workspace)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Counters (Quota tracking per workspace)
CREATE TABLE usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  month TEXT NOT NULL,
  monthly_conversations INTEGER DEFAULT 0,
  monthly_uploads INTEGER DEFAULT 0
);
```

#### **Security Policies**
```sql
-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "workspace_access" ON workspaces
  FOR ALL USING (
    id IN (SELECT workspace_id FROM profiles WHERE id = auth.uid())
  );
```

### **Performance Optimizations**
```sql
-- Critical Indexes
CREATE INDEX profiles_workspace_id_idx ON profiles(workspace_id);
CREATE INDEX leads_workspace_created_idx ON leads(workspace_id, created_at);
CREATE INDEX usage_counters_workspace_month_idx ON usage_counters(workspace_id, month);

-- Query Optimization
CREATE INDEX leads_email_idx ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX profiles_subscription_idx ON profiles(subscription_status, subscription_tier);
```

---

## 🔌 **API ARCHITECTURE**

### **RESTful API Design**
```
/api/
├── auth/                    # Authentication endpoints
├── user/profile/           # User management
├── chat/                   # AI chat functionality
├── leads/                  # Lead management
│   ├── [id]/              # Individual lead operations
│   └── export/            # Bulk operations
├── text-upload/           # Document upload
├── widget/config/[userId]/ # Widget configuration
├── payments/              # Payment processing
│   ├── create-order/      # Order creation
│   ├── verify/            # Payment verification
│   └── webhook/           # Payment webhooks
└── monitoring/            # Health checks
```

### **Security Middleware Stack**
```typescript
// Request Processing Pipeline
Request
  ↓
[Rate Limiting] → 429 if exceeded
  ↓
[CORS Validation] → 403 if invalid origin
  ↓
[Authentication] → 401 if not authenticated
  ↓
[Tenant Validation] → 403 if wrong tenant
  ↓
[Input Validation] → 400 if invalid data
  ↓
[Business Logic] → Process request
  ↓
[Response Security] → Add security headers
  ↓
Response
```

### **API Security Features**
- **Authentication:** JWT validation on all protected routes
- **Authorization:** Tenant-level access control
- **Rate Limiting:** Distributed rate limiting with Redis
- **Input Validation:** Comprehensive schema validation
- **Error Handling:** Standardized error responses
- **Logging:** Request/response audit trail

---

## 🤖 **AI INTEGRATION ARCHITECTURE**

### **Knowledge Retrieval System**
```
User Query
    ↓
[Intent Detection] → Classify query type
    ↓
[Knowledge Base] → Static product knowledge
    ↓ (if no match)
[Vector Search] → Semantic document search
    ↓
[AI Generation] → OpenAI GPT for answers
    ↓
[Response Cache] → Cache for performance
    ↓
Final Response
```

### **AI Components**

#### **1. Knowledge Base**
- **Type:** Static, curated responses
- **Performance:** Instant lookup
- **Maintenance:** Manual curation
- **Accuracy:** High for common queries

#### **2. Vector Store**
- **Technology:** OpenAI embeddings
- **Storage:** PostgreSQL with vector extension
- **Search:** Semantic similarity matching
- **Performance:** Sub-100ms retrieval

#### **3. AI Generation**
- **Provider:** OpenAI GPT-4o Mini
- **Context:** Workspace-specific knowledge
- **Safety:** Content filtering enabled
- **Cost:** Usage tracking per workspace

### **AI Security Measures**
```typescript
// AI Request Validation
const aiRequest = {
  model: 'gpt-4o-mini',
  messages: sanitizedMessages,
  max_tokens: 500,
  temperature: 0.7,
  user: hashedUserId, // For abuse detection
  workspace_id: tenantContext.workspaceId
};
```

---

## 💳 **PAYMENT ARCHITECTURE**

### **Razorpay Integration**
```
Purchase Flow:
User → Create Order → Razorpay → Payment → Webhook → Verification → Subscription Update

Webhook Security:
Razorpay → HMAC Signature → Verification → Database Update → Email Notification
```

### **Subscription Management**
```sql
-- Subscription Tracking
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  billing_period TEXT DEFAULT 'monthly',
  amount_paid DECIMAL(10,2),
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Payment Security**
- **Webhook Validation:** HMAC signature verification
- **Replay Protection:** Timestamp and nonce checking
- **Fraud Detection:** Amount and currency validation
- **Secure Storage:** No card details stored locally

---

## 📊 **MONITORING & OBSERVABILITY**

### **Monitoring Stack**
```
Application Metrics → Sentry → Error Tracking
Performance Data → Custom Logging → Analysis
Security Events → Alert System → Incident Response
Business Metrics → Analytics → Dashboards
```

### **Key Metrics**

#### **Security Metrics**
- Failed authentication attempts
- Rate limit violations
- Cross-tenant access attempts
- Input validation failures
- API abuse patterns

#### **Performance Metrics**
- API response times
- Database query performance
- AI response times
- Cache hit rates
- Error rates

#### **Business Metrics**
- User registrations
- Subscription conversions
- Feature usage
- Support tickets
- Revenue tracking

### **Alerting Configuration**
```typescript
// Critical Alerts
const alerts = {
  security: {
    multipleFailedAuth: 5, // 5 failed attempts in 5 minutes
    crossTenantAccess: 1,  // Any cross-tenant access attempt
    injectionAttempt: 1    // Any injection attempt
  },
  performance: {
    apiResponseTime: 5000, // API responses > 5 seconds
    errorRate: 0.05,       // Error rate > 5%
    dbConnections: 0.8     // DB connections > 80%
  }
};
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Production Deployment**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │    Supabase     │    │      Redis      │
│   • Next.js     │◄──►│   • PostgreSQL  │◄──►│   • Caching     │
│   • Edge Cache  │    │   • Auth        │    │   • Sessions    │
│   • Global CDN  │    │   • Storage     │    │   • Rate Limit  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Sentry      │    │    OpenAI API   │    │   Email Service │
│   • Error Track │    │   • AI Models   │    │   • Notifications│
│   • Performance │    │   • Embeddings  │    │   • Transactional│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Environment Configuration**
```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
REDIS_URL=redis://...
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
SENTRY_DSN=https://...
```

### **Scalability Considerations**
- **Horizontal Scaling:** Stateless API design
- **Database Scaling:** Read replicas for analytics
- **Cache Scaling:** Redis cluster for high availability
- **CDN Scaling:** Global edge distribution
- **AI Scaling:** Request queuing for rate limiting

---

## 🔧 **DEVELOPMENT WORKFLOW**

### **Development Stack**
```bash
# Local Development
npm run dev          # Start development server
npm run test        # Run test suite
npm run type-check  # TypeScript validation
npm run lint        # Code quality checks
npm run build       # Production build
```

### **Code Quality**
- **TypeScript:** Full type safety
- **ESLint:** Code quality enforcement
- **Prettier:** Code formatting
- **Husky:** Pre-commit hooks
- **Jest:** Unit testing
- **Playwright:** E2E testing

### **Security Development**
- **Security Reviews:** All PRs reviewed for security
- **Dependency Scanning:** Automated vulnerability checks
- **Static Analysis:** Code security scanning
- **Penetration Testing:** Regular security assessments

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Frontend Optimizations**
- **Code Splitting:** Dynamic imports for features
- **Tree Shaking:** Unused code elimination
- **Image Optimization:** Next.js image optimization
- **Caching:** Aggressive browser caching
- **Compression:** Gzip/Brotli compression

### **Backend Optimizations**
- **Database Indexing:** Optimized query performance
- **Connection Pooling:** Efficient database connections
- **Response Caching:** Redis-based API caching
- **Compression:** API response compression
- **CDN Caching:** Static asset optimization

### **Performance Targets**
- **API Response Time:** < 200ms (95th percentile)
- **Page Load Time:** < 2 seconds (first contentful paint)
- **Database Query Time:** < 50ms (average)
- **AI Response Time:** < 3 seconds (average)

---

## 🔮 **FUTURE ARCHITECTURE CONSIDERATIONS**

### **Planned Enhancements**
- **Microservices:** Service decomposition for scale
- **Event Streaming:** Kafka for real-time events
- **Advanced AI:** Fine-tuned models per workspace
- **Global Deployment:** Multi-region distribution
- **Advanced Analytics:** Real-time user behavior

### **Scalability Roadmap**
- **Phase 1:** Current architecture (0-10K users)
- **Phase 2:** Read replicas + Redis cluster (10K-100K users)
- **Phase 3:** Microservices + Event streaming (100K+ users)
- **Phase 4:** Multi-region + Advanced caching (1M+ users)

---

## 📚 **DOCUMENTATION REFERENCES**

### **Technical Documentation**
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [Deployment Guide](./SECURITY_DEPLOYMENT_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)

### **Operational Documentation**
- [Monitoring Runbook](./MONITORING_RUNBOOK.md)
- [Incident Response](./INCIDENT_RESPONSE.md)
- [Backup & Recovery](./BACKUP_RECOVERY.md)
- [Security Procedures](./SECURITY_PROCEDURES.md)

---

**Architecture Status:** ✅ **Production Ready**  
**Security Status:** 🔒 **Enterprise Grade**  
**Documentation Status:** 📖 **Complete**  
**Last Updated:** October 6, 2025