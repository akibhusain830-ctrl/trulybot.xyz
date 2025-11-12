## Goals
- Robust, production-grade subscription display that always shows the user’s plan and replies/month.
- Reliable replies tracking reflected across Settings and Dashboard, with consistent API/DB logic.
- Chatbot customization that is visible and usable, with clear gating per plan and graceful fallbacks.

## Current Findings
- Replies cap for Free is 300/month (`src/lib/constants/quotas.ts`, `src/lib/constants/pricing.ts`).
- Settings page loads profile and subscription but can render blank if profile rows are missing (`src/app/dashboard/settings/page.tsx`).
- Usage API returns monthly replies and cap (`src/app/api/usage/route.ts`) but requires auth; defaults previously mismatched.
- Customization UI is hidden when `canAccessFeature(...)` returns false; users on Free/Basic see nothing.
- Chat replies increment only when a cap exists in chat API; no increment when cap=null, reducing visibility.
- Embed widget loads config via `/api/widget/config/[id]` and passes theme/color/name; this is aligned with customization data.

## Implementation Plan
### 1) Subscription & Replies Display
- Settings: Always render a ‘Current Plan’, ‘Status’, and robust ‘Replies (Monthly)’ bar.
- Use `/api/usage` for monthly/conversation cap; if missing, fall back to plan defaults (Free=300).
- Integrate `/api/subscription/status` to show detailed health (e.g., trial dates, paid state) and surface inconsistencies.
- Ensure defaults when profile rows are missing: show Free/Active and a working usage bar.

### 2) Replies Tracking Robustness
- Chat API: Always increment `monthly_conversations` even when no cap is defined; keep cap enforcement when present.
- Continue enforcing limits per `PLAN_QUOTAS`; for Free, enforce 300.
- Make the increment idempotent per message request and tie by `workspace_id` + `month` for consistent tracking.
- Add minimal server-side validation and error logging to ensure write succeeds; fail-open on counter writes to avoid user-visible errors.

### 3) Customization UX and Gating
- Always show customization fields (Name, Welcome, Logo, Color, Theme/CSS):
  - If plan doesn’t allow a field, render it disabled with an inline upgrade prompt.
  - If allowed, render enabled and save to `profiles`.
- Map plan -> capabilities:
  - Free/Basic: Name, Welcome enabled.
  - Pro: Name, Welcome enabled (keep), optional additional branding limited.
  - Enterprise: All (Logo, Color, Theme, CSS) enabled.
- Keep current storage upload for logo and save immediately when allowed; otherwise, show disabled dropzone plus CTA.
- Add clear helper text explaining what is included for each tier.

### 4) API/Server Safety
- Usage API `/api/usage`: ensure default tier = `free` when missing, workspace fallback works; keep authentication requirement.
- Widget config `/api/widget/config/[userId]`: confirm it returns the fields used by the loader (name, message, color, theme, logo, subscription_tier).
- Subscription status `/api/subscription/status`: call from Settings to enrich the card and show trials/paid info.

### 5) Testing & Verification
- Type-check, lint, run dev; then manual tests:
  - Free plan user sees: Current Plan Free, Status Active, Replies 0/300, customization fields with Name+Welcome enabled; Logo/Color/Theme disabled with upgrade CTA.
  - Upgrade (mock or actual) to Enterprise shows all customization controls enabled; saving persists to `profiles` and widget reflects changes.
  - Chat via widget increments monthly replies and shows changes in Settings and Dashboard usage bars.

## Deliverables
- Updated Settings page with clear subscription and replies display + customization fields visible for all tiers with gating.
- Chat API tweak to always increment monthly conversations with cap enforcement.
- Defensive defaults so no section renders blank.
- Documentation in code comments explaining gating and fallbacks.

## Rollout
- Implement changes, verify locally (port 3001), then confirm on your environment.
- Optional: add a compact usage indicator to the Dashboard header.

Do you approve this plan?