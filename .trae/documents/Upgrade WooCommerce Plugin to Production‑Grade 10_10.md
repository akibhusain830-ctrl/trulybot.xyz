## Goals
- Make the WordPress/WooCommerce plugin truly production‑ready (security, reliability, auto‑learning, order tracking).
- Deliver a secure, privacy‑respecting integration that keeps TrulyBot continuously in sync with the store.

## Current State (Summary)
- Strengths: admin UX, read‑only Woo API keys, widget injection, order search/endpoints, tracking plugin support.
- Gaps: no catalog/policy sync, no webhooks, no HMAC signatures/IP allowlist, order verification missing, credential rotation not implemented, limited observability.

## Implementation Plan
### 1) Security & Privacy Hardening
- Add HMAC request signatures: `verify_trulybot_request` validates `X-Signature: HMAC_SHA256(secret, timestamp|path|body)` and `X-Timestamp` freshness (±5 min). Store a shared secret on connect.
- Optional IP allowlist: compare `$_SERVER['REMOTE_ADDR']` (or proxy header) to TrulyBot IP ranges.
- Order verification: require `email` or `phone` match for all order lookups, including by ID; return 403 if mismatch.
- PII minimization: redact email (e.g., `a***@domain.com`) and limit fields to what chat needs.
- Credential storage: keep Woo API key/secret in options but hash the key and encrypt secret using site salts; document recovery/rotation.
- Rate limiting: per endpoint throttling (e.g., sliding window) to prevent abuse.

### 2) Auto‑Learning & Data Sync
- Products endpoint: `GET /wp-json/trulybot/v1/products?page=&per_page=` returns products, variants, stock, price, tags, collections; include canonical URLs and images.
- Policy/content endpoint: `GET /wp-json/trulybot/v1/pages?type=privacy,returns,shipping,faq` returns sanitized HTML/plaintext of store policies and FAQs.
- System endpoint: `GET /wp-json/trulybot/v1/system` for store currency, timezone, base URL.
- Webhooks → TrulyBot backend:
  - Orders: `woocommerce_new_order`, `woocommerce_order_status_changed`.
  - Products: `woocommerce_update_product`, `woocommerce_update_product_variation`.
  - Inventory: `woocommerce_product_set_stock`.
- Each webhook posts signed payload to `TRULYBOT_WC_API_BASE` for ingestion and embedding updates.

### 3) Order Tracking & Workflow UX
- Ensure verified lookups for:
  - Order status
  - Basic returns/exchanges flow (data availability only; write operations remain server‑side or roadmap)
- Tracking integration: continue reading shipment tracking plugins; expose provider/number/date in response.
- Error handling: clear error codes/messages for not found, verification failed, and rate limit.

### 4) Widget Resilience
- Script loading: add version query param (e.g., `woocommerce.js?v=1.0.0`) and SRI hash; non‑blocking injection with fallback message.
- Consent mode: optional setting to delay widget until cookie consent (GDPR).
- Page targeting: exclude widget on checkout/account pages via settings toggle.

### 5) Admin UX & Maintenance
- Connection wizard with steps: verify Woo API → generate shared secret → connect → initial sync test.
- Status panel: connection status, last sync times, webhook delivery history, error log viewer.
- Credential rotation: scheduled quarterly rotation; revoke old keys; re‑provision automatically.
- Tools: manual sync buttons (products/policies), test endpoints, export diagnostic bundle.

### 6) Observability & Docs
- Logging: structured logs for endpoint hits and webhook posts; include request IDs.
- Metrics: call counts, avg latency, error rate; expose compact panel in admin.
- Documentation updates: revise `integrations/docs/WOOCOMMERCE_SETUP_GUIDE.md` and `readme.txt` to reflect verification, privacy, consent, and automation.

## File Changes (High‑Level)
- `integrations/woocommerce/trulybot-woocommerce.php`:
  - Add HMAC signature validation, timestamp checks, optional IP allowlist.
  - Enforce email/phone verification in `get_order_by_id` and `search_orders`.
  - Add new endpoints: `products`, `pages`, `system` (paginated; sanitized output).
  - Register webhooks for orders/products/inventory; post signed updates.
  - Add settings: consent mode, page targeting, rotation schedule, diagnostics.
- `assets/admin.js` / `assets/admin.css`:
  - Connection wizard UI, status panel, test buttons, logs viewer.
- Backend routes (TrulyBot side – specification only in this plan):
  - `/integrations/woocommerce/connect`, `/disconnect`, `/webhooks/*` to accept signed payloads.

## Testing & QA
- Unit tests (PHP): permission checks, HMAC verification, redaction.
- Integration tests: product/policy sync, webhook delivery/retry, order verification.
- Cross‑version matrix: WP 5.0–6.4, Woo 6.0–8.5, PHP 7.4–8.2; common plugin conflict scenarios.
- Security review: rate limits, signature replay protection, PII minimization.

## Acceptance Criteria (10/10)
- Secure, signed, verified endpoints; no unverified order lookups.
- Automatic ingestion of products and policies; webhooks keep TrulyBot up‑to‑date.
- Resilient widget behavior (consent, targeting, fallback) and clear admin diagnostics.
- Documented, observable, and maintainable with rotation and logs.

Do you approve this plan? After approval, I will implement the changes and verify end‑to‑end with tests and a live store scenario.