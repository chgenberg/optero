# 🚀 Production Checklist

## Kritiska säkerhetsåtgärder

### 🔐 Autentisering & Säkerhet

- [ ] **Byt JWT_SECRET** till en stark random string
  ```bash
  openssl rand -base64 64
  ```

- [ ] **Uppdatera alla credentials i .env**
  - [ ] DATABASE_URL (production database)
  - [ ] OPENAI_API_KEY (production key med rate limits)
  - [ ] JWT_SECRET (stark random key)
  - [ ] SENTRY_DSN (error tracking)
  
- [ ] **Implementera rate limiting**
  - [ ] API endpoints (max 100 requests/min per IP)
  - [ ] Login endpoints (max 5 försök/min)
  - [ ] Widget chat (max 20 meddelanden/session)

- [ ] **CORS-konfiguration**
  - [ ] Whitelist endast tillåtna domäner
  - [ ] Uppdatera widget.js CORS-headers

- [ ] **HTTPS enforce**
  - [ ] Redirecta http → https
  - [ ] Set secure flags på cookies
  - [ ] HSTS headers

- [ ] **Content Security Policy (CSP)**
  ```typescript
  // I next.config.mjs
  headers: [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
    ]
  }]
  ```

- [ ] **Input sanitization**
  - [ ] Sanitera all user input
  - [ ] XSS protection
  - [ ] SQL injection prevention (Prisma gör detta)

- [ ] **2FA för admin-konton** (starkt rekommenderat)

---

## 📊 Monitoring & Logging

### Error Tracking

- [ ] **Sentry integration**
  ```bash
  npm install @sentry/nextjs
  ```
  - [ ] Frontend error tracking
  - [ ] Backend error tracking
  - [ ] Performance monitoring

- [ ] **Logging system**
  - [ ] Winston eller Pino för structured logging
  - [ ] Log levels (error, warn, info)
  - [ ] Log rotation

### Analytics

- [ ] **User analytics**
  - [ ] Google Analytics eller Plausible
  - [ ] Conversion tracking
  - [ ] Bot usage metrics

- [ ] **Application metrics**
  - [ ] Response times
  - [ ] Database query performance
  - [ ] API endpoint latency
  - [ ] OpenAI API usage/costs

### Uptime Monitoring

- [ ] **UptimeRobot** eller **Better Uptime**
  - [ ] Monitor main site
  - [ ] Monitor API endpoints
  - [ ] Alert setup (email/SMS)

---

## 🗄️ Databas & Backups

- [ ] **Production database** (upgrade från free tier)
  - [ ] Railway Pro eller Supabase Pro
  - [ ] Connection pooling (PgBouncer)
  - [ ] Read replicas för skalning

- [ ] **Automated backups**
  - [ ] Daily backups (Railway gör detta automatiskt)
  - [ ] Backup retention (30 dagar)
  - [ ] Test restore process

- [ ] **Database indexing**
  - [ ] Verifiera alla @@index är optimala
  - [ ] Lägg till för ofta queryade fält
  
- [ ] **Database monitoring**
  - [ ] Query performance
  - [ ] Slow query log
  - [ ] Connection pool metrics

---

## 🎨 Frontend & UX

- [ ] **Performance optimization**
  - [ ] Next.js Image optimization
  - [ ] Code splitting
  - [ ] Lazy loading komponenter
  - [ ] Minify CSS/JS

- [ ] **SEO**
  - [ ] Meta tags på alla sidor
  - [ ] Open Graph images
  - [ ] Sitemap.xml (finns redan ✅)
  - [ ] Robots.txt (finns redan ✅)

- [ ] **Mobile responsiveness**
  - [ ] Testa på iPhone/Android
  - [ ] Widget fungerar på mobil
  - [ ] Touch-friendly controls

- [ ] **Accessibility**
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Color contrast (WCAG AA)

- [ ] **Loading states**
  - [ ] Skeleton screens
  - [ ] Progress indicators
  - [ ] Error boundaries

---

## 🤖 Bot & AI

- [ ] **OpenAI optimization**
  - [ ] Production API key med högre rate limits
  - [ ] Implementera caching (redan delvis ✅)
  - [ ] Fallback för API-fel
  - [ ] Cost monitoring

- [ ] **Bot testing**
  - [ ] Test alla bot-typer (customer, internal)
  - [ ] Test alla roller (admin, user, viewer)
  - [ ] Stress test med många meddelanden
  - [ ] Test widget på olika browsers

- [ ] **RAG optimization**
  - [ ] Vector database (Pinecone/Weaviate)
  - [ ] Embedding cache
  - [ ] Chunk size optimization
  
- [ ] **Content moderation**
  - [ ] Filter inappropriate content
  - [ ] PII detection och masking (finns delvis ✅)
  - [ ] Spam prevention

---

## 📧 Email & Notifikationer

- [ ] **Email service**
  - [ ] Resend, SendGrid eller AWS SES
  - [ ] Transactional emails
  - [ ] Email templates

- [ ] **Notifikationer**
  - [ ] Welcome emails
  - [ ] Password reset
  - [ ] Bot deployment confirmations
  - [ ] Admin alerts

---

## 💳 Betalning & Subscription

- [ ] **Stripe integration**
  - [ ] Subscription management
  - [ ] Webhook endpoints
  - [ ] Invoice generation
  - [ ] Usage-based billing

- [ ] **Plan limits enforcement**
  - [ ] Free: 50 messages/day
  - [ ] Pro: Unlimited
  - [ ] Rate limiting per plan

---

## 🧪 Testing

- [ ] **End-to-end tests**
  - [ ] Playwright eller Cypress
  - [ ] Test critical flows
  - [ ] Bot creation flow
  - [ ] Login/signup flow

- [ ] **API tests**
  - [ ] Jest för unit tests
  - [ ] Integration tests
  - [ ] Load testing (K6 eller Artillery)

- [ ] **Security testing**
  - [ ] OWASP Top 10 check
  - [ ] Penetration testing
  - [ ] SQL injection tests
  - [ ] XSS tests

---

## 🌍 Infrastructure

- [ ] **Deployment platform**
  - [ ] Vercel (rekommenderat för Next.js)
  - [ ] Railway
  - [ ] AWS/GCP

- [ ] **Environment variables**
  - [ ] Production .env på platform
  - [ ] NEVER commit .env to git
  - [ ] Use platform secrets manager

- [ ] **CDN**
  - [ ] Cloudflare för static assets
  - [ ] Image optimization
  - [ ] DDoS protection

- [ ] **Custom domain**
  - [ ] SSL certificate (Let's Encrypt)
  - [ ] DNS configuration
  - [ ] www → non-www redirect

---

## 📝 Legal & Compliance

- [ ] **GDPR compliance**
  - [ ] Privacy policy (finns ✅)
  - [ ] Terms of service (finns ✅)
  - [ ] Cookie consent (finns ✅)
  - [ ] Data export/delete (finns ✅)
  - [ ] Data Processing Agreement (DPA)

- [ ] **Business documentation**
  - [ ] API documentation
  - [ ] User guides
  - [ ] Admin documentation
  - [ ] Troubleshooting guide

---

## 🔄 CI/CD

- [ ] **GitHub Actions workflow**
  ```yaml
  # .github/workflows/deploy.yml
  - Lint code
  - Run tests
  - Build production
  - Deploy to Vercel
  - Run smoke tests
  ```

- [ ] **Pre-deploy checks**
  - [ ] TypeScript compile
  - [ ] Linting (ESLint)
  - [ ] Tests pass
  - [ ] No console.logs in production

- [ ] **Deployment strategy**
  - [ ] Staging environment
  - [ ] Preview deployments
  - [ ] Rollback plan

---

## 📱 Features att verifiera

### Widget (Customer Bot)
- [ ] Fungerar på alla browsers (Chrome, Safari, Firefox)
- [ ] Mobile responsive
- [ ] Customizable branding
- [ ] Offline handling
- [ ] Session persistence

### Internal Bot
- [ ] Säker inloggning
- [ ] Rollbaserad access (ADMIN, USER, VIEWER)
- [ ] File upload fungerar
- [ ] Conversation history
- [ ] Export conversations (admin)

### Admin Panel
- [ ] User management
- [ ] Role changes
- [ ] User deletion (med säkerhetskontroller)
- [ ] Invite users
- [ ] Analytics dashboard

---

## 🚨 Critical Pre-Launch

### MÅSTE göras innan launch:

1. ✅ **Säkerhet**
   - Byt alla secrets
   - Enable HTTPS
   - Set up rate limiting

2. ✅ **Backup**
   - Test database restore
   - Set up automated backups
   - Document backup procedure

3. ✅ **Monitoring**
   - Sentry configured
   - Uptime monitoring
   - Error alerts setup

4. ✅ **Legal**
   - Privacy policy reviewed
   - Terms of service reviewed
   - GDPR compliance verified

5. ✅ **Performance**
   - Load test critical paths
   - Optimize slow queries
   - CDN configured

---

## 📋 Launch Day Checklist

### 1 vecka innan:
- [ ] Full security audit
- [ ] Load testing
- [ ] Backup verification
- [ ] Documentation complete

### 1 dag innan:
- [ ] Final testing in staging
- [ ] Announce maintenance window
- [ ] Prepare rollback plan
- [ ] Team briefing

### Launch dag:
- [ ] Deploy to production
- [ ] Verify all services running
- [ ] Monitor errors/logs
- [ ] Test critical flows
- [ ] Announce launch

### Efter launch:
- [ ] Monitor for 24h
- [ ] Check error rates
- [ ] Verify backups running
- [ ] Collect user feedback

---

## 🛠️ Quick Wins (gör först)

1. **Sätt upp Sentry** (30 min)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Rate limiting** (1h)
   ```bash
   npm install express-rate-limit
   ```

3. **Email service** (1h)
   ```bash
   npm install resend
   # Setup transactional emails
   ```

4. **Uptime monitoring** (15 min)
   - Gå till uptimerobot.com
   - Lägg till monitors för main site + API

5. **SSL Certificate** (auto)
   - Vercel gör detta automatiskt
   - Railway också

---

## 💰 Kostnadsberäkning (månad)

### Minimal setup:
- Railway Database (Hobby): $5/mån
- Vercel (Pro): $20/mån
- OpenAI API: ~$50-200/mån (beroende på usage)
- **Total: ~$75-225/mån**

### Rekommenderad setup:
- Railway Database (Pro): $20/mån
- Vercel (Pro): $20/mån
- Sentry (Team): $26/mån
- Resend Email: $20/mån
- OpenAI API: ~$100-500/mån
- **Total: ~$186-586/mån**

---

## 📞 Support När Live

- [ ] Support email: support@mendio.com
- [ ] Status page: status.mendio.com
- [ ] Documentation: docs.mendio.com
- [ ] Response time SLA: 24h

---

## 🎯 Rekommendation

**Kör dessa 3 först:**

1. **Säkerhet** (kritiskt)
   - Byt JWT_SECRET
   - Sätt upp rate limiting
   - Enable HTTPS

2. **Monitoring** (viktigt)
   - Sentry error tracking
   - Uptime monitoring
   - Cost alerts för OpenAI

3. **Backup** (kritiskt)
   - Automated backups
   - Test restore
   - Backup alerts

**Därefter kan du lansera!** 🚀

Vill du att jag implementerar någon av dessa först?
