# 🚀 Deployment Guide

## Rekommenderad Stack för Production

### Frontend & Backend
**Vercel** (Bäst för Next.js)
- Auto-scaling
- Edge network
- Zero-config SSL
- Preview deployments
- **Pris**: $20/mån (Pro) eller $0/mån (Hobby)

### Database
**Railway** eller **Supabase**
- Automated backups
- Connection pooling
- Monitoring
- **Pris**: $5-20/mån

### Email
**Resend**
- Modern API
- Great deliverability
- Templates
- **Pris**: $20/mån (100k emails)

### Error Tracking
**Sentry**
- Error tracking
- Performance monitoring
- User feedback
- **Pris**: $0/mån (Developer) eller $26/mån (Team)

---

## Deployment på Vercel (Rekommenderat)

### Steg 1: Förbered projektet

```bash
# Installera Vercel CLI
npm install -g vercel

# Logga in
vercel login
```

### Steg 2: Första deployment

```bash
# Från projektmappen
vercel

# Följ prompten:
# - Link to existing project? No
# - What's your project name? myaiguy
# - Which directory? ./ (default)
# - Want to modify settings? No
```

### Steg 3: Sätt environment variables

```bash
# Production secrets
vercel env add DATABASE_URL production
# Klistra in din Railway DATABASE_URL

vercel env add JWT_SECRET production
# Generera: openssl rand -base64 64

vercel env add OPENAI_API_KEY production
# Din OpenAI production key

# Andra viktiga vars
vercel env add NODE_ENV production
vercel env add NEXT_PUBLIC_APP_URL production
```

### Steg 4: Deploy till production

```bash
vercel --prod
```

### Steg 5: Kör migrations

```bash
# Från Vercel dashboard eller lokalt mot production DB
DATABASE_URL="your-production-url" npx prisma db push
```

### Steg 6: Custom domain

1. Gå till Vercel dashboard
2. Settings → Domains
3. Lägg till din domain (mendio.com)
4. Uppdatera DNS records hos din registrar

---

## Deployment på Railway

### Steg 1: Anslut GitHub

1. Gå till railway.app
2. New Project → Deploy from GitHub repo
3. Välj MyAIGuy repo

### Steg 2: Configure

```bash
# Build Command
npm run build

# Start Command
npm start

# Root Directory
/
```

### Steg 3: Environment Variables

I Railway dashboard → Variables:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto från Railway
OPENAI_API_KEY=sk-...
JWT_SECRET=<generate-secure-key>
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

### Steg 4: Deploy

Railway deployer automatiskt vid git push till main!

---

## Pre-deployment Checklist

### Kod
- [ ] Alla TODO/console.log borttagna
- [ ] TypeScript errors fixade
- [ ] Tests kör grönt
- [ ] Build fungerar lokalt: `npm run build`

### Databas
- [ ] Production database setup
- [ ] Migrations körda
- [ ] Backups konfigurerade
- [ ] Connection pooling enabled

### Environment
- [ ] Alla env vars satta
- [ ] JWT_SECRET är stark och unik
- [ ] Production OpenAI API key
- [ ] Correct APP_URL

### Säkerhet
- [ ] HTTPS enabled (Vercel gör automatiskt)
- [ ] Secure cookies (httpOnly, secure)
- [ ] Rate limiting implementerad
- [ ] CORS konfigurerad

---

## Post-deployment

### Immediate (0-1h)

1. **Smoke tests**
   ```bash
   # Test main endpoints
   curl https://mendio.com
   curl https://mendio.com/api/health
   ```

2. **Verify core flows**
   - Registrering fungerar
   - Login fungerar
   - Bot creation fungerar
   - Widget laddas

3. **Check logs**
   - Inga critiska errors
   - Database connections OK
   - API responses snabba

### First 24h

1. **Monitor metrics**
   - Error rate < 1%
   - Response time < 500ms
   - Database queries optimala

2. **User testing**
   - Internal team testing
   - Beta users feedback
   - Fix critical bugs

3. **Performance**
   - Lighthouse score > 90
   - Load time < 2s
   - Widget loads < 1s

### First Week

1. **Optimize**
   - Fix slow queries
   - Add missing indexes
   - Optimize images

2. **Security audit**
   - Check for vulnerabilities
   - Review access logs
   - Test rate limits

3. **Documentation**
   - Update API docs
   - User guides
   - Admin manual

---

## Rollback Plan

### Om något går fel:

```bash
# Vercel
vercel rollback

# Railway
# Gå till Deployments → Välj previous → Redeploy

# Database
# Restore från senaste backup
```

### När att rolla tillbaka:

- Error rate > 5%
- Critical feature broken
- Data loss detected
- Security breach

---

## Monitoring Setup

### Sentry (Error Tracking)

```bash
# Install
npm install @sentry/nextjs

# Configure
npx @sentry/wizard@latest -i nextjs

# Test
Sentry.captureMessage("Production deployment test");
```

### UptimeRobot (Uptime Monitoring)

1. Gå till uptimerobot.com
2. Add New Monitor
   - Type: HTTPS
   - URL: https://mendio.com
   - Interval: 5 minutes
3. Set up alerts (email/SMS)

### Vercel Analytics

1. Enable i Vercel dashboard
2. Se real-time traffic
3. Web Vitals tracking

---

## Cost Optimization

### Gratis tier (för start):
```
Vercel Hobby:      $0/mån
Railway Hobby:     $5/mån
Sentry Developer:  $0/mån
Resend Free:       $0/mån (3k emails)
OpenAI:            Pay-as-you-go
━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:             ~$5-50/mån
```

### Production tier (för scale):
```
Vercel Pro:        $20/mån
Railway Pro:       $20/mån
Sentry Team:       $26/mån
Resend Pro:        $20/mån
OpenAI:            $100-500/mån
━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:             ~$186-586/mån
```

---

## Support & Maintenance

### Daily
- Check error logs
- Monitor uptime
- Review user feedback

### Weekly
- Database backups verified
- Security updates applied
- Performance metrics reviewed

### Monthly
- Cost analysis
- Feature planning
- Security audit

---

## Emergency Contacts

**On-call rotation**:
- Primary: admin@company.com
- Secondary: tech@company.com

**Escalation**:
- Database issues → Railway/Supabase support
- App issues → Vercel support
- API issues → OpenAI support

---

## Success Metrics

After 1 week in production:

- [ ] 99.9% uptime
- [ ] Error rate < 0.1%
- [ ] Response time < 300ms (p95)
- [ ] Zero security incidents
- [ ] User satisfaction > 4/5

🎯 **You're ready for production!**
