# 🧪 Testa Bot Builder Flow

## Problem: Ändringar syns inte?

**Lösning**: Cleara browserns sessionStorage och börja om.

## Steg för steg test:

### 1. Öppna Browser Console

```
Chrome/Edge: F12 eller Cmd+Option+I (Mac)
Firefox: F12 eller Cmd+Option+K (Mac)
Safari: Cmd+Option+C (Mac)
```

### 2. Cleara SessionStorage

I Console, skriv:
```javascript
sessionStorage.clear()
localStorage.clear()
location.reload()
```

### 3. Starta Bot Builder från början

Gå till: **http://localhost:3000/business/bot-builder/identify**

### 4. Följ flödet:

#### Step 1: Add Knowledge
- URL: `https://example.com` (eller din riktiga site)
- Email: `test@example.com`
- Upload: (optional) Ladda upp PDF/dokument
- Accept terms ✅
- Klicka **"Analyze Website"**

#### Step 2: Analyzing (auto)
- Vänta medan GPT-5 analyserar
- Du ska se progress bar

#### Step 3: Choose Bot Type (auto-visas)
- Välj en bot-typ (Support, Lead, Knowledge, etc.)
- Klicka **"Continue"**

#### Step 4: **NYA SIDAN** - Choose Purpose 🆕
**Här ska du se:**
- 🎯 **"WHO WILL USE YOUR BOT?"**
- Två stora kort:
  - 👥 **Customer Bot** (för website visitors)
  - 🏢 **Internal Bot** (för your team)

**Välj en och klicka "Continue"**

#### Step 5: Customize
- Brand colors, name, tone, etc.

#### Step 6: Integrations
- HubSpot, Zendesk, etc.

#### Step 7: Test
- Test din bot

#### Step 8: Launch
- För **Customer Bot**: Få HTML embed code
- För **Internal Bot**: Få dashboard link

---

## 🔍 Debug: Om du INTE ser "Choose Purpose" sidan

### Kontrollera 1: Är filen där?

```bash
ls -la app/business/bot-builder/bot-purpose/page.tsx
```

Om den saknas → Filen raderades av misstag

### Kontrollera 2: Startar analyze-sidan rätt navigation?

Öppna browser console efter "Analyze" och kolla network tab.

När du klickar "Continue" ska den navigera till:
```
/business/bot-builder/bot-purpose
```

### Kontrollera 3: Kolla browser console för errors

Öppna Console (F12) och se om det finns JavaScript errors.

---

## 🛠️ Manuell Test av Bot-Purpose Sidan

Gå direkt till:
```
http://localhost:3000/business/bot-builder/bot-purpose
```

**Borde se:**
- Titel: "WHO WILL USE YOUR BOT?"
- Två stora cards med Customer Bot och Internal Bot
- Beskrivningar och features
- Continue knapp (disabled tills du väljer)

**Om sidan inte laddar:**
- Kolla server logs
- Kolla browser console
- Kolla att dev-servern kör: `lsof -i :3000`

---

## 🎯 Quick Fix Script

Kör detta för att börja helt från början:

```bash
# 1. Stoppa server
lsof -ti:3000 | xargs kill -9

# 2. Cleara Next.js cache
rm -rf .next

# 3. Starta om
npm run dev

# 4. I browser:
# - Tryck Cmd+Shift+R (hard refresh)
# - F12 → Console → sessionStorage.clear()
# - Gå till: http://localhost:3000/business/bot-builder/identify
```

---

## 🐛 Common Issues

### Issue: "Cannot read property of undefined"

**Cause**: SessionStorage saknar nödvändig data  
**Fix**: Cleara sessionStorage och börja från `/identify`

### Issue: Sidan laddar inte alls

**Cause**: Build error eller syntax error  
**Fix**: 
```bash
# Check terminal för errors
# Kolla browser console
npm run build  # Test build
```

### Issue: Navigation hoppar över bot-purpose

**Cause**: Analyze-sidan går direkt till customize  
**Fix**: Kontrollera att analyze/page.tsx har:
```typescript
router.push("/business/bot-builder/bot-purpose");
```

---

## ✅ Förväntat Flöde

```
1. /identify
   ↓ (user adds website + docs)
2. /analyze  
   ↓ (GPT analyzes)
3. /bot-purpose  ← NY SIDA!
   ↓ (välj customer vs internal)
4. /customize
   ↓ (brand, colors, tone)
5. /integrations
   ↓ (optional integrations)
6. /test
   ↓ (test bot)
7. /launch
   ↓ (get embed code or dashboard link)
```

---

## 📸 Vad du BORDE se på bot-purpose

```
╔════════════════════════════════════════╗
║  WHO WILL USE YOUR BOT?                ║
╚════════════════════════════════════════╝

┌─────────────────┐  ┌─────────────────┐
│  👥 CUSTOMER    │  │  🏢 INTERNAL    │
│     BOT         │  │     BOT         │
│                 │  │                 │
│ For website     │  │ For your team   │
│ visitors        │  │                 │
│                 │  │                 │
│ • HTML embed    │  │ • Dashboard     │
│ • 24/7 support  │  │ • Policies      │
│ • Lead gen      │  │ • Excel help    │
└─────────────────┘  └─────────────────┘

         [CONTINUE TO CUSTOMIZE]
```

Testa nu och säg till om du ser denna sida! 🎯
