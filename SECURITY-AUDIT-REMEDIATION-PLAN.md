# Security Remediation Plan — CraftsBySam Production Application

**Audit Date:** 2026-05-30  
**Auditor:** CTO Agent  
**Plan Version:** 1.0  
**Estimated Completion:** 7-14 days

---

## Executive Summary

This remediation plan addresses 8 security vulnerabilities identified in the comprehensive security audit, prioritized by severity, exploitability, and business impact. The plan is organized into 3 phases:

- **Phase 1 (CRITICAL):** Immediate actions within 24-48 hours
- **Phase 2 (HIGH):** Priority fixes within 7 days  
- **Phase 3 (MEDIUM):** Security hardening within 30 days

---

## Phase 1: Critical Vulnerabilities (24-48 hours)

### Priority 1.1: Production Console Logging Removal

**Time Estimate:** 4-6 hours  
**Risk:** HIGH — exposes internal implementation to all users  
**Business Impact:** Information leakage, security reconnaissance

#### Implementation Steps:

1. **Create Production Logger Service** (1 hour)
   ```typescript
   // utils/logger.ts
   export const logger = {
     error: (message: string, error: any) => {
       if (import.meta.env.DEV) {
         console.error(message, error);
       } else {
         // TODO: Integrate with error tracking (Sentry, LogRocket)
         // sendToErrorTracking(message, error);
       }
     },
     warn: (message: string, data?: any) => {
       if (import.meta.env.DEV) console.warn(message, data);
     },
     info: (message: string, data?: any) => {
       if (import.meta.env.DEV) console.info(message, data);
     },
     debug: (message: string, data?: any) => {
       if (import.meta.env.DEV) console.debug(message, data);
     }
   };
   ```

2. **Configure Vite to Strip Console in Production** (30 minutes)
   ```typescript
   // vite.config.ts
   export default defineConfig({
     esbuild: {
       drop: import.meta.env.PROD ? ['console', 'debugger'] : []
     }
   });
   ```

3. **Replace Console Statements** (2-3 hours)
   - Find: 29 files with console statements
   - Replace with logger service
   - Priority files:
     - `utils/stripeApi.ts`
     - Payment components
     - API files
     - Services

4. **Testing** (1 hour)
   - Verify console logs appear in development
   - Verify console logs removed in production build
   - Test error handling still works correctly
   - Check payment flows for proper error handling

5. **Deployment** (30 minutes)
   - Build production bundle
   - Verify no console statements in `dist/`
   - Deploy to Vercel
   - Test in production

**Success Criteria:**
- ✅ No console statements in production bundle
- ✅ Error handling still functional
- ✅ Payment flows work without console output
- ✅ Development environment retains console logging

---

### Priority 1.2: DOMPurify Transitive Dependency Fix

**Time Estimate:** 2-3 hours  
**Risk:** HIGH — XSS bypass vulnerability in PDF generation  
**Business Impact:** Potential XSS attacks via PDF generation

#### Implementation Steps:

1. **Backup Current Working State** (15 minutes)
   ```bash
   git checkout -b backup-before-jspdf-update
   git push origin backup-before-jspdf-update
   ```

2. **Update jspdf Dependencies** (30 minutes)
   ```bash
   npm audit fix --force
   # This will update jspdf to 4.2.1 (breaking change)
   ```

3. **Test PDF Generation** (1 hour)
   - Test invoice generation
   - Test PDF download flows
   - Verify PDF formatting still correct
   - Check for API changes in jspdf 4.x

4. **Fix Breaking Changes** (30 minutes)
   - Update jspdf API calls if needed
   - Update jspdf-autotable integration
   - Verify all PDF generation paths

5. **Verification** (30 minutes)
   ```bash
   npm audit  # Should show no vulnerabilities
   npm ls dompurify  # Should show no vulnerable versions
   ```

6. **Deployment** (15 minutes)
   - Build production bundle
   - Test PDF generation in staging
   - Deploy to production

**Success Criteria:**
- ✅ `npm audit` shows no vulnerabilities
- ✅ PDF generation works correctly
- ✅ No DOMPurify vulnerabilities in transitive dependencies
- ✅ All invoice/download flows functional

**Fallback Plan:**
If jspdf update causes significant issues:
- Consider manual patching of jspdf's package.json to use dompurify@3.4.7
- Or wait for jspdf maintainers to release non-breaking update

---

## Phase 2: High Priority Fixes (Within 7 Days)

### Priority 2.1: Payment SDK Security Updates

**Time Estimate:** 2-3 hours  
**Risk:** HIGH — payment security patches missed  
**Business Impact:** Payment security, compliance

#### Implementation Steps:

1. **Update Stripe SDKs** (1 hour)
   ```bash
   npm install @stripe/react-stripe-js@latest @stripe/stripe-js@latest
   ```

2. **Test Payment Flows** (1-2 hours)
   - Stripe payment form
   - Payment intent creation
   - Webhook handling
   - Error handling

3. **Check Breaking Changes** (30 minutes)
   - Review Stripe SDK changelogs
   - Update code for API changes if needed
   - Test with Stripe test keys

4. **Deployment** (30 minutes)
   - Deploy to staging
   - Test payment flows end-to-end
   - Deploy to production

**Success Criteria:**
- ✅ Payment flows work correctly
- ✅ No breaking changes in production
- ✅ Stripe SDKs on latest stable versions

---

### Priority 2.2: Source Map Protection

**Time Estimate:** 1-2 hours  
**Risk:** MEDIUM — source code exposure  
**Business Impact:** Security reconnaissance, IP protection

#### Implementation Steps:

1. **Disable Source Maps in Production** (30 minutes)
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       sourcemap: false  // Disable for production
     }
   });
   ```

2. **Or Conditional Source Maps** (30 minutes)
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       sourcemap: process.env.NODE_ENV !== 'production'
     }
   });
   ```

3. **Verification** (30 minutes)
   ```bash
   npm run build
   ls dist/*.map  # Should be empty
   ```

4. **Deployment** (15 minutes)
   - Deploy to production
   - Verify no .map files accessible

**Success Criteria:**
- ✅ No source maps in production build
- ✅ Development debugging still works
- ✅ Production bundle size acceptable

---

### Priority 2.3: Content Security Policy (CSP)

**Time Estimate:** 2-3 hours  
**Risk:** MEDIUM — XSS protection gap  
**Business Impact:** Additional XSS defense layer

#### Implementation Steps:

1. **Design CSP Policy** (1 hour)
   - Identify required script sources
   - Identify required style sources
   - Identify required image sources
   - Identify required connect sources

2. **Add CSP to vercel.json** (30 minutes)
   ```json
   {
     "key": "Content-Security-Policy",
     "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.supabase.co https://generativelanguage.googleapis.com; frame-src 'self' https://js.stripe.com https://www.paypal.com; base-uri 'self'; form-action 'self';"
   }
   ```

3. **Test CSP in Report-Only Mode** (1 hour)
   ```json
   {
     "key": "Content-Security-Policy-Report-Only",
     "value": "..."
   }
   ```

4. **Monitor Violations** (30 minutes)
   - Check browser console for CSP violations
   - Adjust policy as needed
   - Test all features (payments, admin, checkout)

5. **Enable CSP** (15 minutes)
   - Switch from Report-Only to enforced
   - Deploy to production

**Success Criteria:**
- ✅ CSP enforced without breaking functionality
- ✅ All payment flows work
- ✅ All admin features work
- ✅ No CSP violations in console

---

## Phase 3: Security Hardening (Within 30 Days)

### Priority 3.1: Dependency Updates

**Time Estimate:** 4-6 hours  
**Risk:** LOW-MEDIUM — general security improvements  
**Business Impact:** Long-term security maintenance

#### Implementation Steps:

1. **Update Core Dependencies** (2 hours)
   ```bash
   npm install @supabase/supabase-js@latest
   npm install @vitejs/plugin-react@latest vite@latest
   ```

2. **Update React (Optional)** (2 hours)
   ```bash
   npm install react@latest react-dom@latest
   ```
   Note: React 19 is a major update — requires testing

3. **Update TypeScript** (1 hour)
   ```bash
   npm install typescript@latest
   ```

4. **Comprehensive Testing** (2-3 hours)
   - Test all application features
   - Check for breaking changes
   - Verify build process

5. **Deployment** (30 minutes)
   - Deploy to staging
   - Run full test suite
   - Deploy to production

**Success Criteria:**
- ✅ All dependencies updated to latest stable
- ✅ Application functions correctly
- ✅ No breaking changes in production

---

### Priority 3.2: Gitignore Defense in Depth

**Time Estimate:** 30 minutes  
**Risk:** LOW — human error protection  
**Business Impact:** Prevents accidental credential commits

#### Implementation Steps:

1. **Update .gitignore** (15 minutes)
   ```
   # Environment files
   .env*
   !.env.example
   !.env.local
   ```

2. **Verify No Secrets in Git History** (15 minutes)
   ```bash
   git log --all --full-history --source -- "*.env" "*.key" "*secret*"
   ```

3. **Add to Repository** (5 minutes)
   ```bash
   git add .gitignore
   git commit -m "SECURITY: Add explicit .env patterns to .gitignore"
   ```

**Success Criteria:**
- ✅ All .env files except .env.example and .env.local ignored
- ✅ No secrets found in git history

---

### Priority 3.3: Error Tracking Integration

**Time Estimate:** 3-4 hours  
**Risk:** LOW — monitoring improvement  
**Business Impact:** Production error visibility

#### Implementation Steps:

1. **Choose Error Tracking Service** (30 minutes)
   - Sentry (recommended)
   - LogRocket
   - Bugsnag

2. **Install SDK** (30 minutes)
   ```bash
   npm install @sentry/react
   ```

3. **Configure** (1 hour)
   ```typescript
   // main.tsx
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     integrations: [Sentry.browserTracingIntegration()],
     tracesSampleRate: 1.0,
     environment: import.meta.env.MODE
   });
   ```

4. **Update Logger Service** (30 minutes)
   ```typescript
   export const logger = {
     error: (message: string, error: any) => {
       Sentry.captureException(error);
     }
   };
   ```

5. **Test** (30 minutes)
   - Trigger intentional errors
   - Verify Sentry dashboard receives events

6. **Deployment** (15 minutes)
   - Deploy to production
   - Monitor error dashboard

**Success Criteria:**
- ✅ Errors captured in production
- ✅ Error dashboard accessible
- ✅ No sensitive data in error reports

---

## Implementation Timeline

### Week 1 (Days 1-7)
- **Day 1-2:** Phase 1 (Console Logging + DOMPurify)
- **Day 3-4:** Priority 2.1 (Payment SDKs)
- **Day 5-6:** Priority 2.2 (Source Maps)
- **Day 7:** Priority 2.3 (CSP) + testing

### Week 2-4 (Days 8-30)
- **Week 2:** Priority 3.1 (Dependency Updates)
- **Week 3:** Priority 3.2 (Gitignore) + Priority 3.3 (Error Tracking)
- **Week 4:** Buffer for testing, documentation, deployment

---

## Risk Assessment

### High-Risk Items
- **Console Logging Removal:** Risk of breaking error handling
- **jspdf Update:** Breaking changes in PDF generation
- **Payment SDK Updates:** Risk to payment flows

### Medium-Risk Items
- **CSP Implementation:** Risk of blocking legitimate resources
- **Source Map Removal:** Harder to debug production issues

### Low-Risk Items
- **Gitignore Update:** No breaking changes
- **Dependency Updates:** Testable in staging

---

## Testing Strategy

### Unit Tests
- Logger service functionality
- Error handling without console
- PDF generation with new jspdf

### Integration Tests
- Payment flows with updated SDKs
- Admin functionality
- Checkout process

### E2E Tests (Playwright)
- Full checkout flow
- Payment completion
- PDF download
- Admin operations

### Security Tests
- Verify no console in production bundle
- Check source maps not deployed
- Test CSP enforcement
- Verify error handling without information leakage

---

## Deployment Strategy

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Staging environment validated
- [ ] Security scan passes (`npm audit`)
- [ ] Performance audit passes (Lighthouse)
- [ ] Payment flows tested
- [ ] Rollback plan documented

### Deployment Process
1. **Staging Deployment**
   - Deploy to staging
   - Run full test suite
   - Manual testing of critical paths
   - Security validation

2. **Production Deployment**
   - Deploy during low-traffic period
   - Monitor error rates
   - Have rollback ready
   - Monitor payment success rates

3. **Post-Deployment**
   - Monitor for 24 hours
   - Check error tracking dashboard
   - Verify payment metrics
   - Review security headers

---

## Rollback Plan

### If Payment Fails
- Rollback payment SDK updates
- Investigate breaking changes
- Fix issues and redeploy

### If PDF Generation Fails
- Rollback jspdf update
- Consider manual patching
- Wait for stable jspdf release

### If CSP Breaks Site
- Switch to Report-Only mode
- Investigate violations
- Adjust policy

### If Console Removal Breaks Error Handling
- Verify logger service implementation
- Add back critical console.error for debugging
- Implement proper error tracking

---

## Success Metrics

### Phase 1 (Critical)
- ✅ Zero console statements in production bundle
- ✅ Zero vulnerabilities in `npm audit`
- ✅ All payment flows functional
- ✅ PDF generation working

### Phase 2 (High Priority)
- ✅ Source maps disabled in production
- ✅ CSP enforced without violations
- ✅ Payment SDKs updated to latest
- ✅ No source code exposure

### Phase 3 (Hardening)
- ✅ All dependencies updated
- ✅ Gitignore protection in place
- ✅ Error tracking operational
- ✅ No credentials in git history

---

## Estimated Effort

| Phase | Tasks | Time Estimate | Risk Level |
|-------|-------|---------------|------------|
| Phase 1 | 2 priorities | 6-9 hours | HIGH |
| Phase 2 | 3 priorities | 5-8 hours | MEDIUM |
| Phase 3 | 3 priorities | 7-10 hours | LOW |
| **Total** | **8 priorities** | **18-27 hours** | **MEDIUM** |

---

## Approval Required

### Board Approval Required For:
- [ ] React 19 major update (if chosen)
- [ ] Production deployment during business hours
- [ ] CSP enforcement (if Report-Only shows issues)

### CEO Approval Required For:
- [ ] Payment SDK updates (critical business flow)
- [ ] Error tracking service selection (cost)

---

## Next Steps

1. **Immediate:** Start Phase 1 (Console Logging + DOMPurify)
2. **Week 1:** Complete Phase 2 (Payment SDKs, Source Maps, CSP)
3. **Week 2-4:** Complete Phase 3 (Dependencies, Gitignore, Error Tracking)
4. **Documentation:** Update SECURITY-AUDIT.md with completion status
5. **Verification:** Run full security audit to confirm all issues resolved

---

**Acceptance Criteria Met:**
✅ Prioritized implementation roadmap provided  
✅ Phased approach with clear timelines  
✅ Risk assessment and mitigation strategies  
✅ Testing and deployment strategy  
✅ Rollback plans for each phase  
✅ Estimated effort and resource requirements
