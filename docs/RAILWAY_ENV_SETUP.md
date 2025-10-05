# Railway Environment Variables Setup

## Kritiska miljövariabler som MÅSTE vara satta:

### 1. Database
```
DATABASE_URL=postgresql://postgres:PoUwZQKBHOVCIrkHlRNGLykOPTyBtMor@yamanote.proxy.rlwy.net:23397/railway
```

### 2. OpenAI API (KRITISK!)
```
OPENAI_API_KEY=sk-proj-...
```
**OBS:** Utan denna får du inga AI-resultat!

### 3. Stripe (för betalningar)
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 4. Email (Resend)
```
RESEND_API_KEY=re_...
```

### 5. Base URL
```
NEXT_PUBLIC_BASE_URL=https://mendio.io
```

---

## Hur du lägger till i Railway:

1. Gå till Railway dashboard
2. Välj ditt projekt
3. Klicka på **Variables** (i vänstermenyn)
4. Klicka **+ New Variable**
5. Lägg till varje variabel
6. Klicka **Deploy** för att applicera

---

## Verifiera att variabler är satta:

I Railway → Deployments → Senaste deployment → Logs

Sök efter:
- "OPENAI_API_KEY" (ska INTE visas i logs av säkerhetsskäl)
- "Failed to fetch recommendations" (betyder API-key saknas)

---

## Troubleshooting:

### Problem: Tomma resultat från API
**Orsak:** OPENAI_API_KEY saknas eller är ogiltig
**Lösning:** Lägg till giltig API-key i Railway Variables

### Problem: 502 Bad Gateway
**Orsak:** Database connection failed
**Lösning:** Verifiera DATABASE_URL

### Problem: Stripe-fel
**Orsak:** Stripe keys saknas
**Lösning:** Lägg till Stripe keys (behövs bara för premium)

---

## Viktigt!

Efter du lagt till OPENAI_API_KEY:
1. Railway deployas automatiskt om
2. Vänta 1-2 minuter
3. Testa analysen igen
4. Nu ska du få resultat! ✅
