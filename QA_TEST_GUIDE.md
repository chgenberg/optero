# 🧪 QA Testing Guide

## Testscenarier innan produktion

### 1️⃣ Customer Bot Flow (End-to-End)

#### Setup (5 min)
1. Gå till `/bot`
2. Ange URL: `https://ikea.com`
3. Ange email: `test@customer.com`
4. Ladda upp dokument (valfritt PDF)
5. Klicka "Build & Chat"

#### Chat Test (10 min)
- [ ] Välkomstmeddelande visas på svenska
- [ ] Skriv: "Hej, vad kostar era produkter?"
  - ✅ Svar kommer på svenska
  - ✅ HTML-formatering: `<p>` och `<strong>` renderas
  - ✅ Svar är relevant för IKEA (inte generiskt)
  - ✅ Svarstid < 5 sekunder
- [ ] Skriv på engelska: "How many products do you have?"
  - ✅ Svar byter till engelska automatiskt
- [ ] Testa Settings-knappen
  - ✅ Kan ändra färg, namn, ton
  - ✅ Ändringar syns direkt i UI

#### Save Bot Test (5 min)
- [ ] Klicka "Save Bot"
- [ ] Välj "Customer Bot"
  - ✅ Embed-kod visas
  - ✅ Copy-knapp fungerar
  - ✅ Kod innehåller korrekt botId
  - ✅ "Go to Dashboard" leder till bot-detaljer

#### Widget Test (10 min)
- [ ] Skapa en test-HTML-fil med embed-koden
- [ ] Öppna i webbläsare
  - ✅ Widget-bubbla visas nere till höger
  - ✅ Klick öppnar chat-fönster
  - ✅ Chat fungerar (skicka/ta emot meddelanden)
  - ✅ Stäng-knapp fungerar
  - ✅ Mobil-responsiv (testa på telefon)

---

### 2️⃣ Internal Bot Flow (End-to-End)

#### Setup (5 min)
1. Gå till `/bot`
2. Ange URL: `https://yourcompany.com`
3. Ange email: `test@internal.com`
4. Ladda upp företagets policy-dokument
5. Klicka "Build & Chat"

#### Chat Test (10 min)
- [ ] Skriv: "Vad är våra brand-färger?"
  - ✅ Svar baserat på scrapade CSS-färger
- [ ] Skriv: "Hur ansöker jag om semester?"
  - ✅ Svar från uppladdade dokument
- [ ] Testa file upload i chatten
  - ✅ Kan ladda upp PDF/dokument
  - ✅ Bot lär sig från filen

#### Save Internal Bot Test (5 min)
- [ ] Klicka "Save Bot"
- [ ] Välj "Internal Bot"
  - ✅ Success-modal med "Next Steps"
  - ✅ "Go to Dashboard" fungerar
  - ✅ Bot visas i dashboard med "(Internal)" suffix

#### Internal Dashboard Test (10 min)
- [ ] Öppna `/internal/{botId}`
  - ✅ Kräver login (om auth är på)
  - ✅ Chat-interface för interna användare
  - ✅ Sidopanel med "Common Questions"
  - ✅ File upload fungerar

---

### 3️⃣ Dashboard & Analytics (20 min)

#### Bot Detail Page
- [ ] Gå till `/dashboard/{botId}`
  - ✅ Stats visas: messages, sessions, tokens
  - ✅ Top questions listas
  - ✅ Unanswered questions visas (röd highlight)
  - ✅ Recent sessions visas

#### Build Q&A Test
- [ ] Klicka "BUILD Q&A" på bot-detaljsidan
  - ✅ Knappen visar "Building Q&A…"
  - ✅ Alert visar coverage efter färdig build
  - ✅ Format: "Q&A built: +X answers. Coverage: Y/250 (Z%). High confidence: W."

#### Q&A Dashboard Test
- [ ] Gå till `/qa-dashboard`
  - ✅ Summary stats visas
  - ✅ Question categories visas med progress bars
  - ✅ Tabs fungerar: Overview, Top, Unanswered, Trending, By Bot
  - ✅ Filter fungerar: Time range, Bot, Search
  - ✅ Export CSV-knapp fungerar

#### Reindex Test
- [ ] Klicka "UPDATE FROM WEBSITE" i Training-tab
  - ✅ Spinner visas
  - ✅ Success-alert efter färdig scraping
  - ✅ KB Chunks uppdateras
  - ✅ Q&A rebuilt i bakgrunden (kolla efter 1-2 min)

---

### 4️⃣ Integration Tests (15 min)

#### Integrations Page
- [ ] Gå till `/integrations`
  - ✅ Alla integrationskort visas
  - ✅ Kategorier fungerar (All, CRM, Commerce, Support)
  - ✅ "Connect"-knappar fungerar

#### HubSpot Integration (om konfigurerad)
- [ ] Connect HubSpot
- [ ] Skapa lead i bot
- [ ] Verifiera att lead syns i HubSpot

#### Shopify Integration (om konfigurerad)
- [ ] Connect Shopify
- [ ] Fråga "How many products?"
- [ ] Verifiera exakt antal från Shopify API

---

### 5️⃣ Performance Tests (10 min)

#### Page Load Times
- [ ] Homepage: < 1s
- [ ] Dashboard: < 2s
- [ ] Bot chat first message: < 5s
- [ ] Bot chat follow-up: < 3s

#### Mobile Test
- [ ] Öppna på telefon
- [ ] Widget visas korrekt
- [ ] Chat fungerar på touch
- [ ] Scrolling smooth
- [ ] Buttons är touch-friendly

---

### 6️⃣ Security Tests (15 min)

#### Rate Limiting
- [ ] Skicka 25+ meddelanden snabbt i chat
  - ✅ "Too many requests" efter 20 meddelanden
- [ ] Gör 150+ API-calls snabbt
  - ✅ Rate limit kickar in

#### Admin Endpoints (CRITICAL)
- [ ] Försök nå `/api/admin/purge-bots` utan token
  - ✅ 401 Unauthorized
- [ ] Försök med fel token
  - ✅ 401 Unauthorized
- [ ] Försök med korrekt ADMIN_TOKEN
  - ✅ 200 OK

#### Input Sanitization
- [ ] Skriv i chat: `<script>alert('XSS')</script>`
  - ✅ Renderas som text, inte exekveras
- [ ] Skriv: `'; DROP TABLE Bot; --`
  - ✅ Ingen SQL injection (Prisma skyddar)

---

### 7️⃣ Error Handling (10 min)

#### Network Errors
- [ ] Stäng av internet under chat
  - ✅ Error message visas
  - ✅ Kan retry när online igen

#### Invalid Inputs
- [ ] Ange ogiltig URL i bot builder
  - ✅ Validering fångar fel
- [ ] Skicka tomt meddelande i chat
  - ✅ Inget händer (disabled)

#### Database Errors (simulera)
- [ ] Testa med ogiltig DATABASE_URL
  - ✅ Graceful error, inte crash

---

### 8️⃣ Language Tests (10 min)

- [ ] Chat på **Svenska**: "Hej, hur mycket kostar det?"
  - ✅ Svar på svenska
- [ ] Chat på **Engelska**: "Hello, what's the price?"
  - ✅ Svar på engelska
- [ ] Chat på **Tyska**: "Hallo, wie viel kostet das?"
  - ✅ Svar på tyska
- [ ] Byt språk mitt i konversation
  - ✅ Bot följer med och byter språk

---

## 🎯 Pass/Fail Criteria

### ✅ Pass om:
- Alla Customer Bot-funktioner fungerar
- Alla Internal Bot-funktioner fungerar
- Inga kritiska fel i konsolen
- Prestanda < gränserna ovan
- Säkerhet: admin-endpoints skyddade
- Mobile: fungerar på minst iOS Safari + Android Chrome

### ❌ Fail om:
- Widget laddar inte
- Chat svarar inte inom 10s
- XSS/SQL injection möjlig
- Admin-endpoints öppna
- Crash vid invalid input

---

## 📊 Test Results Template

```
Datum: ____________________
Testare: __________________
Version/Commit: ___________

RESULTAT:
[ ] Customer Bot Flow: PASS / FAIL
[ ] Internal Bot Flow: PASS / FAIL
[ ] Dashboard & Analytics: PASS / FAIL
[ ] Integration Tests: PASS / FAIL
[ ] Performance Tests: PASS / FAIL
[ ] Security Tests: PASS / FAIL
[ ] Error Handling: PASS / FAIL
[ ] Language Tests: PASS / FAIL

BUGGAR HITTADE:
1. _____________________________
2. _____________________________
3. _____________________________

KRITISKA BLOCKERARE:
- _____________________________

PRODUKTIONSKLAR: JA / NEJ
```

---

## 🚀 När allt är PASS:

1. Kör load test: `k6 run load-test.js`
2. Verifiera inga errors i Sentry
3. Backup database
4. **Deploy till produktion**
5. Monitor första 24h

**Estimerad total testtid: 2-3 timmar**

