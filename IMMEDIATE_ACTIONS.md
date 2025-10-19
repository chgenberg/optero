# ⚡ Omedelbara åtgärder innan produktion

## 🔴 KRITISKT (Gör FÖRST - 1-2 timmar)

### 1. Säkerhet (30 min)

```bash
# Generera ny JWT secret
openssl rand -base64 64

# Uppdatera i .env.production
JWT_SECRET="<din-nya-secret-här>"

# Sätt NODE_ENV
NODE_ENV="production"
```

### 2. Database Setup (30 min)

**Railway Pro** (rekommenderat):
1. Uppgradera till Pro i Railway dashboard
2. Enable automated backups
3. Kopiera production DATABASE_URL
4. Kör migrations:
   ```bash
   DATABASE_URL="<production-url>" npx prisma db push
   ```

### 3. OpenAI API Key (10 min)

1. Gå till https://platform.openai.com/api-keys
2. Skapa ny key för production
3. Sätt usage limits ($100/mån för start)
4. Uppdatera OPENAI_API_KEY i .env

### 4. Deploy (20 min)

```bash
# Installera Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Sätt env vars i Vercel dashboard:
# - DATABASE_URL
# - JWT_SECRET
# - OPENAI_API_KEY
# - NODE_ENV=production
```

---

## 🟡 VIKTIGT (Gör samma dag - 2-4 timmar)

### 5. Error Tracking (30 min)

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure
npx @sentry/wizard@latest -i nextjs

# Följ wizard för att sätta upp
```

### 6. Uptime Monitoring (15 min)

1. Gå till https://uptimerobot.com
2. Add New Monitor:
   - Type: HTTPS
   - URL: https://mendio.com
   - Monitoring Interval: 5 minutes
3. Add Alert Contacts (email)

### 7. Custom Domain (30 min)

**I Vercel:**
1. Settings → Domains
2. Add: mendio.com
3. Add: www.mendio.com

**I din DNS (Namecheap/GoDaddy/etc):**
```
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

### 8. Email Service (1h)

```bash
# Install Resend
npm install resend

# Verify domain
# Lägg till DNS records från Resend dashboard

# Test email
curl -X POST https://api.resend.com/emails/send \
  -H "Authorization: Bearer re_..." \
  -H "Content-Type: application/json" \
  -d '{"from":"noreply@mendio.com","to":"ch.genberg@gmail.com","subject":"Test","html":"Works!"}'
```

---

## 🟢 BRA ATT HA (Nästa vecka - 4-8 timmar)

### 9. Analytics (1h)

**Google Analytics:**
```bash
# Install
npm install @next/third-parties

# I app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

<GoogleAnalytics gaId="G-..." />
```

**Eller Plausible** (mer privacy-friendly):
```html
<script defer data-domain="mendio.com" src="https://plausible.io/js/script.js"></script>
```

### 10. SSL & Security Headers (30 min)

✅ Vercel ger gratis SSL automatiskt

Lägg till security headers i `next.config.mjs`:
```javascript
// Använd next.config.production.mjs som finns redan
```

### 11. Backup Verification (1h)

```bash
# Test database restore
1. Ta backup från Railway
2. Restore till test-database
3. Verifiera data är intakt
4. Dokumentera process
```

### 12. Load Testing (2h)

```bash
# Install K6
brew install k6  # macOS

# Create test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
};

export default function() {
  const res = http.get('https://mendio.com');
  check(res, { 'status was 200': (r) => r.status === 200 });
}
EOF

# Run test
k6 run load-test.js
```

### 13. Documentation (2h)

- [ ] API dokumentation
- [ ] User guide (hur man använder bots)
- [ ] Admin manual (användarhantering)
- [ ] Widget integration guide

---

## 📋 Launch Day Checklist

### Morgon (innan launch)

- [ ] Alla critical tasks klara
- [ ] Team briefad
- [ ] Rollback plan klar
- [ ] Support email setup
- [ ] Status page klar

### Vid launch

- [ ] Deploy till production
- [ ] Verify health endpoints
- [ ] Test critical flows
- [ ] Monitor errors i real-time
- [ ] Announce launch

### Eftermiddag/Kväll

- [ ] Monitor för första 4-8h
- [ ] Respond till user feedback
- [ ] Fix critical bugs omedelbart
- [ ] Document any issues

---

## 🚨 Emergency Procedures

### Om sidan går ner:

1. **Check Vercel status**: https://vercel-status.com
2. **Check Railway status**: https://railway.app/status
3. **Check logs**: Vercel dashboard → Logs
4. **Rollback**: `vercel rollback`

### Om databas går ner:

1. **Check Railway**: Dashboard → Database metrics
2. **Check connections**: Connection limit nådd?
3. **Restart**: Railway dashboard → Restart
4. **Restore backup** om nödvändigt

### Om OpenAI går ner:

1. **Check status**: https://status.openai.com
2. **Fallback**: Visa error message till users
3. **Queue requests** för retry senare
4. **Notify users** om längre outage

---

## 📞 Support Contacts

**Platform Support:**
- Vercel: https://vercel.com/support
- Railway: help@railway.app
- OpenAI: https://help.openai.com

**Internal:**
- On-call: ch.genberg@gmail.com
- Backup: (sätt upp team member)

---

## ✅ När är du redo?

Du är redo för production när:

- [x] Alla KRITISKA tasks klara
- [x] Error tracking setup
- [x] Backups konfigurerade
- [x] Custom domain setup
- [x] Team utbildad
- [ ] Load testing done
- [ ] Security audit done
- [ ] Dokumentation klar

**Minimum för soft launch**: De 4 kritiska + error tracking

**Full production launch**: Alla checkboxar ✅

---

## 🎯 Rekommenderad timeline

**Dag 1 (idag):**
- Kritiska säkerhetsåtgärder (1-2h)
- Deploy till Vercel (30 min)
- Error tracking (30 min)

**Dag 2:**
- Custom domain
- Email service
- Uptime monitoring

**Dag 3-7:**
- Testing
- Documentation
- Beta user onboarding

**Vecka 2:**
- Full production launch
- Marketing
- Scale monitoring

---

## 💡 Pro Tips

1. **Soft launch först**: Bjud in 10-20 beta users
2. **Monitor intensivt**: Första veckan
3. **Iterate snabbt**: Fix bugs within hours
4. **Collect feedback**: Direkt från users
5. **Scale gradually**: Öka limits över tid

**Du kan lansera inom 24 timmar om du fokuserar på kritiska tasks!** 🚀
