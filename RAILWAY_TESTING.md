# 🧪 Testa i Railway Production

## 🚀 Snabbguide: Från kod till live på Railway

### Steg 1: Commit och Push (1 min)

```bash
cd /Users/christophergenberg/Desktop/MyAIGuy

# Se vad som ska commitas
git status

# Lägg till allt
git add .

# Commit
git commit -m "Add RBAC and bot purpose selection"

# Push till GitHub
git push origin main
```

### Steg 2: Railway Deployer Automatiskt! (2-5 min)

1. **Öppna Railway dashboard**: https://railway.app
2. **Gå till ditt projekt** (MyAIGuy)
3. **Se deployment**:
   - Du ser "Deploying..." meddelande
   - Build logs rullar
   - Vänta på "Deployed" ✅

### Steg 3: Få Din Production URL (30 sek)

I Railway dashboard:
1. Klicka på din **Next.js service** (inte PostgreSQL)
2. Under **Settings** → **Networking**
3. Se din URL: `https://myaiguy-production.up.railway.app`
   - Eller klicka **"Generate Domain"** om den inte finns

**Kopiera denna URL!**

### Steg 4: Testa Production App (5 min)

Öppna din Railway URL i browser:
```
https://your-app.up.railway.app
```

**Test checklist:**

#### ✅ 1. Main Page
```
https://your-app.up.railway.app
```
Borde se: Landing page med Mendio branding

#### ✅ 2. Bot Builder Start
```
https://your-app.up.railway.app/business/bot-builder/identify
```
- Fyll i URL + email
- Klicka "Analyze Website"

#### ✅ 3. Bot Purpose Selection (NY!)
Efter analyze → Du borde se:
```
https://your-app.up.railway.app/business/bot-builder/bot-purpose
```
- "WHO WILL USE YOUR BOT?"
- Customer Bot | Internal Bot cards
- Välj en!

#### ✅ 4. Internal Login
```
https://your-app.up.railway.app/internal/login
```
- Login: `admin@company.com` / `demo123`
- Borde komma till internal dashboard

#### ✅ 5. Admin Panel
```
https://your-app.up.railway.app/internal/admin
```
- Bara admins kan se denna
- Lista över alla users
- Kan ändra roller

---

## 🔍 Verifiera Deployment

### Railway Dashboard

1. **Klicka på din service**
2. **Deployments tab**
3. **Senaste deployment** → "View Logs"

**Kolla efter:**
```bash
✅ "Build successful"
✅ "Prisma Client generated"  
✅ "Server started on port 3000"
✅ Inga röda error messages
```

### Test API Endpoints

```bash
# Sätt din Railway URL
RAILWAY_URL="https://your-app.up.railway.app"

# Test health (skapa denna om den inte finns)
curl $RAILWAY_URL/api/health

# Test auth endpoint
curl -X POST $RAILWAY_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"demo123"}'

# Borde få tillbaka JWT token
```

---

## 🗄️ Database Verification

### Kontrollera att seed-data finns i production:

**Option 1: Prisma Studio (mot production)**
```bash
# I din lokala terminal
DATABASE_URL="postgresql://postgres:PoUwZQKBHOVCIrkHlRNGLykOPTyBtMor@yamanote.proxy.rlwy.net:23397/railway" npx prisma studio
```

**Option 2: Railway Dashboard**
1. PostgreSQL service → Data tab
2. Query editor
3. Kör: 
   ```sql
   SELECT * FROM "User" WHERE "isInternal" = true;
   SELECT * FROM "Company";
   ```

**Borde se:**
- 3 users (admin, user, viewer)
- 1 company (Demo Company AB)

---

## 🧪 End-to-End Test i Production

### Test 1: Customer Bot Flow

1. Gå till: `https://your-app.railway.app/business/bot-builder/identify`
2. URL: `https://example.com`
3. Email: `production-test@test.com`
4. Analyze → Choose bot type → **Välj "Customer Bot"**
5. Customize → Test → Launch
6. **Förväntat resultat**: HTML embed code visas ✅

### Test 2: Internal Bot Flow

1. Cleara sessionStorage
2. Gå till: `/business/bot-builder/identify`
3. URL: `https://mycompany.com`
4. Email: `internal-test@test.com`
5. Analyze → Choose bot type → **Välj "Internal Bot"**
6. Customize → Test → Launch
7. **Förväntat resultat**: Dashboard link (ingen HTML code) ✅

### Test 3: RBAC

1. Login: `https://your-app.railway.app/internal/login`
2. Test alla 3 roller:
   - **Admin** → Kan se Settings icon → Admin panel
   - **User** → Kan chatta, ladda upp filer
   - **Viewer** → Read-only, no file upload

---

## 📊 Monitor Production

### Real-time Logs

**Railway Dashboard:**
1. Service → Deployments
2. Latest → View Logs
3. Se requests i real-time

**Filtrera logs:**
```bash
# Railway CLI (optional)
npm install -g @railway/cli
railway login
railway link
railway logs  # Stream logs
```

### Metrics

Railway visar automatiskt:
- **CPU usage**: Bör vara <50% idle
- **Memory**: Bör vara <500MB
- **Network**: In/out traffic
- **Response times**: Bör vara <500ms

### Error Tracking

Se errors i:
1. Railway logs (search för "error")
2. Browser console (F12)
3. Sentry (när du sätter upp det)

---

## 🐛 Troubleshooting Production Issues

### Issue: 404 på bot-purpose sidan

**Debug:**
```bash
# Check om filen är deployed
# I Railway logs search för:
"bot-purpose"

# Eller check build output
# Borde se: "Compiling /business/bot-builder/bot-purpose"
```

**Fix:**
- Ensure filen finns i repo: `git ls-files | grep bot-purpose`
- Om den saknas: `git add app/business/bot-builder/bot-purpose/page.tsx`
- Push igen: `git push`

### Issue: "Cannot read property"

**Cause**: SessionStorage data från gamla flödet  
**Fix**: Cleara sessionStorage i production också:
```javascript
// I browser console på production URL
sessionStorage.clear()
window.location.reload()
```

### Issue: Database connection error

**Check:**
1. Railway → PostgreSQL → Se att den är "Running"
2. Check DATABASE_URL i service variables
3. Private networking enabled

**Fix:**
- Restart PostgreSQL service
- Redeploy Next.js service

### Issue: Authentication errors

**Check:**
1. JWT_SECRET är satt
2. Users finns i database (kör seed igen)
3. Cookies fungerar (check browser settings)

---

## 🎯 Production Testing Workflow

```
┌─────────────────────────────────────────┐
│  1. LOKALT                              │
│  • Utveckla feature                     │
│  • Test lokalt (localhost:3000)         │
│  • Fix bugs                             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  2. COMMIT & PUSH                       │
│  • git add .                            │
│  • git commit -m "..."                  │
│  • git push origin main                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  3. RAILWAY AUTO-DEPLOY                 │
│  • Vänta 2-5 min                        │
│  • Se build logs                        │
│  • Vänta på "Deployed" ✅              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  4. TEST PRODUCTION                     │
│  • Öppna Railway URL                    │
│  • Test alla flows                      │
│  • Cleara sessionStorage om nödvändigt  │
│  • Verifiera funktionalitet             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  5. MONITOR                             │
│  • Check error logs                     │
│  • Monitor performance                  │
│  • User feedback                        │
└─────────────────────────────────────────┘
```

---

## 🚀 Deploy & Test NU (5 minuter)

```bash
# 1. Commit alla ändringar
git add .
git commit -m "RBAC + bot purpose selection ready"
git push origin main

# 2. Öppna Railway dashboard
open https://railway.app

# 3. Vänta på deployment (2-3 min)
# Se "Building..." → "Deployed" ✅

# 4. Öppna din production URL
open https://your-app.railway.app/business/bot-builder/identify

# 5. Test flödet:
# - Add website
# - Analyze  
# - Choose bot type
# - 🆕 SEE: "Choose Purpose" page!
# - Select Customer Bot eller Internal Bot
# - Continue...
```

---

## 💡 Pro Tip: Preview Deployments

För att testa INNAN produktion:

1. **Skapa ny branch:**
   ```bash
   git checkout -b test-feature
   git push origin test-feature
   ```

2. **Railway skapar preview deployment automatiskt**

3. **Test på preview URL** (typ `test-feature.up.railway.app`)

4. **Merge till main när det fungerar:**
   ```bash
   git checkout main
   git merge test-feature
   git push
   ```

---

## 📞 Support vid Problem

**Railway-specifika problem:**
- Dashboard: https://railway.app
- Logs: Service → Deployments → View Logs
- Restart: Service → Settings → Restart

**App-specifika problem:**
- Browser console (F12)
- Network tab (se failed requests)
- Cleara sessionStorage

**Database problem:**
- Prisma Studio: `DATABASE_URL="..." npx prisma studio`
- Railway Data tab: Query editor
- Restart PostgreSQL service

---

Kör detta nu och säg till när Railway har deployat! 🚀
