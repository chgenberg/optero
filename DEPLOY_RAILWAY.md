# 🚄 Deploy till Railway - Komplett Guide

## 🔴 KRITISKA steg (30 minuter)

### Steg 1: Generera säkra secrets (2 min)

```bash
# Generera JWT secret
openssl rand -base64 64

# Spara output - du behöver den strax!
```

### Steg 2: Railway Project Setup (10 min)

1. **Gå till Railway dashboard**: https://railway.app
2. **Skapa nytt projekt** eller välj befintligt
3. **Länka GitHub repo**:
   - New → Deploy from GitHub repo
   - Välj: MyAIGuy
   - Branch: main

### Steg 3: Environment Variables (10 min)

I Railway dashboard → Variables → Raw Editor, lägg till:

```bash
# Database (redan finns från din PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication (VIKTIGT: Använd din nya JWT secret från steg 1!)
JWT_SECRET=<din-nya-secret-från-steg-1>

# OpenAI (din production API key)
OPENAI_API_KEY=sk-proj-...

# Node Environment
NODE_ENV=production

# App URL (kommer från Railway)
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### Steg 4: Build Settings (3 min)

I Railway → Settings:

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:** `/`

### Steg 5: Deploy (5 min)

Railway deployer automatiskt när du pushar till GitHub!

```bash
# Commit allt
git add .
git commit -m "Production ready with RBAC"
git push origin main

# Railway bygger och deployer automatiskt!
```

---

## ✅ Verifiera Deployment

### 1. Kontrollera build logs

I Railway → Deployments → Klicka på senaste deploy → View Logs

Kolla efter:
- ✅ "Build successful"
- ✅ "Prisma Client generated"
- ✅ "Server started"

### 2. Testa endpoints

```bash
# Hämta din Railway URL från dashboard
RAILWAY_URL="https://myaiguy-production.up.railway.app"

# Test main page
curl $RAILWAY_URL

# Test API health
curl $RAILWAY_URL/api/health
```

### 3. Test login

1. Gå till `https://your-app.up.railway.app/internal/login`
2. Logga in med: `admin@company.com` / `demo123`
3. Verifiera att du kommer till dashboarden

---

## 🔄 Continuous Deployment

Railway deployer automatiskt vid varje push till main!

```bash
# Gör ändringar
git add .
git commit -m "Update feature"
git push

# Railway bygger om och deployer automatiskt 🎉
```

---

## 🗄️ Database Management på Railway

### Backups (KRITISKT)

1. **Railway dashboard → PostgreSQL service**
2. **Data → Backups**
3. **Enable Automated Backups** (Pro plan krävs)
4. Retention: 7 dagar rekommenderat

### Connection Pooling

Railway har inbyggd connection pooling - inget extra behövs!

### Monitoring

Railway visar:
- CPU usage
- Memory usage
- Network traffic
- Query metrics

---

## 🔐 Security på Railway

### 1. Private Networking

Railway services kan kommunicera privat (redan aktiverat).

### 2. Environment Variables

Alla secrets lagras säkert och exponeras aldrig i logs.

### 3. Access Control

1. Settings → Access Control
2. Lägg till team members
3. Sätt permissions

---

## 💰 Railway Pricing

### Hobby ($5/mån)
- Bra för: Development, testing
- Limits: 500 hours compute, 1GB RAM
- Backups: Manuella only

### Pro ($20/mån) ⭐ Rekommenderat
- Bra för: Production, small business
- Limits: Unlimited compute, 8GB RAM
- Backups: Automated
- Support: Priority

### Team ($Custom)
- Bra för: Scale, enterprise
- Custom limits
- Dedicated support
- SLA guarantees

---

## 📊 Post-Deploy Checklist

### Immediately (0-1h)

- [ ] Verify app loads: https://your-app.railway.app
- [ ] Test login: /internal/login
- [ ] Test admin panel: /internal/admin
- [ ] Create a test bot
- [ ] Test widget embed code

### First 24h

- [ ] Monitor error logs i Railway
- [ ] Check database usage
- [ ] Verify backups running
- [ ] Test from different browsers
- [ ] Mobile testing

### First Week

- [ ] Set up custom domain
- [ ] Configure Sentry
- [ ] Enable UptimeRobot
- [ ] Beta user testing
- [ ] Document any issues

---

## 🔧 Railway CLI (Optional)

```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run commands on Railway
railway run npm run db:seed

# Set env var
railway variables set JWT_SECRET="..."
```

---

## 🚨 Troubleshooting

### Build fails

**Check logs för:**
- TypeScript errors → Fix locally först
- Missing dependencies → npm install
- Environment variables → Sätt i Railway

**Solution:**
```bash
# Test build locally
npm run build

# Fix errors
# Commit and push
git push
```

### Database connection fails

**Check:**
1. DATABASE_URL är korrekt
2. PostgreSQL service körs
3. Private networking enabled

**Solution:**
```bash
# I Railway, regenerate DATABASE_URL om nödvändigt
# Update env var
# Redeploy
```

### App crashes on start

**Check logs för:**
- Missing env vars
- Port configuration
- Prisma Client not generated

**Solution:**
```bash
# Ensure Prisma generate in build command
# Build command should be:
npm install && npx prisma generate && npm run build
```

---

## 🎯 Custom Domain på Railway

### Steg 1: Railway Settings

1. Settings → Networking
2. Generate Domain → Custom Domain
3. Add: mendio.com

### Steg 2: DNS Configuration

I din DNS provider (Namecheap/GoDaddy):

```
CNAME   @     <din-app>.up.railway.app
CNAME   www   <din-app>.up.railway.app
```

### Steg 3: SSL Certificate

Railway genererar automatiskt SSL via Let's Encrypt!
Vänta 5-10 minuter för propagation.

---

## 📈 Monitoring på Railway

### Built-in Metrics

Railway visar automatiskt:
- **CPU**: Bör vara under 70%
- **Memory**: Bör vara under 80%
- **Network**: In/out traffic
- **Build Time**: Optimera om >5 min

### Custom Metrics

För mer detaljerad monitoring, använd:
- **Sentry** för errors
- **UptimeRobot** för uptime
- **LogTail** eller **Datadog** för advanced logs

---

## 🚀 KOMPLETT DEPLOYMENT (kör nu!)

```bash
# 1. Generera secrets
echo "Ny JWT_SECRET:"
openssl rand -base64 64

# 2. I Railway dashboard:
#    - Variables → Add:
#      JWT_SECRET=<din-nya-secret>
#      NODE_ENV=production
#      (DATABASE_URL finns redan)

# 3. Commit och push
git add .
git commit -m "Production ready"
git push origin main

# 4. Railway deployer automatiskt!
#    Se progress i Railway dashboard

# 5. När deploy är klar, testa:
#    https://your-app.up.railway.app/internal/login
```

---

## ⚡ Quick Commands

```bash
# Se deployment status
# → Gå till Railway dashboard

# View logs
# → Railway dashboard → Deployments → View Logs

# Rollback
# → Railway dashboard → Deployments → Previous → Deploy

# Environment variables
# → Railway dashboard → Variables

# Custom domain
# → Railway dashboard → Settings → Networking
```

---

## 🎉 Efter Deploy

### Test dessa:

1. **Internal bot login**
   - URL: `https://your-app.railway.app/internal/login`
   - Login: `admin@company.com` / `demo123`
   - Verify: Admin panel fungerar

2. **Customer bot widget**
   - Skapa en customer bot
   - Kopiera embed code
   - Test på din hemsida

3. **GDPR funktioner**
   - Test data export
   - Test data deletion

4. **Rollhantering**
   - Login som admin
   - Gå till `/internal/admin`
   - Ändra en users roll
   - Verify permissions uppdateras

---

## 💡 Railway Tips

### Optimize Costs
- Use PostgreSQL connection pooling
- Enable sleep mode för dev environments
- Monitor resource usage

### Speed up Builds
- Cache dependencies
- Use Railway's Nixpacks (auto-enabled)
- Optimize Docker layers om du använder Dockerfile

### Better Logs
- Use structured logging (Winston/Pino)
- Filter noise från logs
- Set up log drains till LogTail

---

## 📞 Support

**Railway Issues:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: help@railway.app

**Deployment Issues:**
- Check: Railway status page
- Logs: Railway dashboard
- Rollback: Previous deployment

---

## ✨ Du är redo!

Följ bara dessa steg:

1. ✅ Generera JWT_SECRET
2. ✅ Sätt env vars i Railway
3. ✅ Push till GitHub
4. ✅ Railway deployer automatiskt
5. ✅ Test och verifiera

**Det tar ~30 minuter total!** 🚀

Vill du att jag hjälper dig sätta env vars eller något annat?
