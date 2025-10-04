# 📊 Database & Analytics Guide

## Översikt

Systemet sparar **all användarinteraktion** i databasen för att:
1. **Accelerera laddningstider** - Återanvända AI-genererade resultat
2. **Förbättra rekommendationer** - Lära från populära kombinationer
3. **Samla insights** - Förstå hur användare interagerar med tjänsten

---

## 🗄️ Database Schema

### 1. **ProfessionSpecialization**
Sparar AI-genererade specialiseringar per yrke.

```typescript
{
  profession: "Lärare",
  specializations: ["Gymnasielärare", "Högstadielärare", "Grundskolelärare"],
  hitCount: 47  // Antal gånger detta yrke sökts
}
```

**Användning:** Nästa gång någon söker "Lärare" får de samma specialiseringar direkt från DB istället för att vänta på AI.

---

### 2. **CommonTasks**
Sparar vanliga arbetsuppgifter per yrke + specialisering.

```typescript
{
  profession: "Säljare",
  specialization: "Fordonssäljare",
  tasks: [
    "Kvalificera leads och boka provkörningar",
    "Presentera fordon och förhandla priser",
    "Hantera finansieringsalternativ"
  ],
  hitCount: 12
}
```

**Användning:** Förslag på uppgifter baserat på vad andra med samma roll har valt.

---

### 3. **RecommendationCache**
Sparar kompletta AI-rekommendationer.

```typescript
{
  cacheKey: "hash_of_profession_spec_tasks",
  profession: "Ekonom",
  specialization: "Redovisningskonsult",
  tasks: [...],
  recommendations: [...],  // AI-verktyg
  scenarios: [...],        // Användningsfall
  hitCount: 8,
  lastUsed: "2025-01-04"
}
```

**Användning:** Om exakt samma kombination söks igen = instant resultat (0.2s istället för 5-10s).

---

### 4. **UserSession**
Spårar hela användarresan.

```typescript
{
  id: "session_abc123",
  profession: "Projektledare",
  specialization: "IT-projekt",
  selectedTasks: [...],
  viewedTools: ["Notion", "ChatGPT"],
  copiedPrompts: ["prompt_1", "prompt_5"],
  timeSpent: 180,  // sekunder
  completedSteps: 4,
  clickedPremium: false
}
```

**Användning:** 
- Förstå var användare hoppar av
- Vilka verktyg som är mest intressanta
- Conversion rate till premium

---

### 5. **Feedback**
Sparar användarfeedback på verktyg.

```typescript
{
  profession: "Marknadsförare",
  recommendationName: "ChatGPT Plus",
  rating: 5,
  helpful: true,
  comment: "Använder detta dagligen!"
}
```

**Användning:** Förbättra rekommendationer baserat på verklig feedback.

---

### 6. **PopularCombinations**
Identifierar mönster i uppgiftsval.

```typescript
{
  profession: "Lärare",
  specialization: "Gymnasielärare",
  taskCombination: [
    "Planera lektioner",
    "Rätta prov",
    "Skapa presentationer"
  ],
  frequency: 23
}
```

**Användning:** Föreslå relevanta uppgifter baserat på vad andra i samma roll brukar välja.

---

## 🚀 Hur det fungerar i praktiken

### Första gången någon söker "Säljare → Fordonssäljare"
1. ✅ AI genererar specialiseringar (5-10s)
2. ✅ AI genererar arbetsuppgifter (5-10s)
3. ✅ AI genererar rekommendationer (10-15s)
4. ✅ **Allt sparas i DB**
5. ⏱️ **Total tid: ~25-35s**

### Andra gången någon söker samma kombination
1. ⚡ Hämta specialiseringar från DB (0.1s)
2. ⚡ Hämta uppgifter från DB (0.1s)
3. ⚡ Hämta rekommendationer från cache (0.2s)
4. ⏱️ **Total tid: ~0.4s** (98% snabbare!)

---

## 📈 Analytics Dashboard

Besök `/admin/analytics` för att se:

### **Översikt**
- Totalt antal sessioner
- Completion rate (hur många som går hela vägen)
- Genomsnittlig tid på sidan
- Conversion rate till premium

### **Populära yrken**
- Top 10 mest sökta yrken
- Antal sökningar per yrke

### **Populära kombinationer**
- Vilka yrke + specialisering som söks mest
- Vanliga uppgiftskombinationer

### **Cache Performance**
- Antal cachade kombinationer
- Total cache hits
- Genomsnittliga hits per entry
- Top 10 mest återanvända kombinationer

---

## 🔧 API Endpoints

### **POST /api/session**
Spara användardata.

```typescript
{
  sessionId?: string,  // Om uppdatering
  profession: string,
  specialization?: string,
  selectedTasks?: Array,
  completedSteps: number
}
```

### **GET /api/session**
Hämta analytics.

Query params:
- `?type=popular-professions` - Mest sökta yrken
- `?type=popular-combinations` - Mest sökta kombinationer
- `?type=conversion-rate` - Premium conversion

### **GET /api/cache-stats**
Hämta cache-statistik.

---

## 🎯 Användningsområden

### **1. Produktförbättring**
- Se vilka yrken som saknas
- Identifiera var användare fastnar
- Optimera flödet baserat på data

### **2. Marknadsföring**
- "Över 1000 ekonomer har hittat sina AI-verktyg"
- Case studies från populära kombinationer
- Testimonials från feedback

### **3. Premium Conversion**
- A/B-testa olika erbjudanden
- Se vilka yrken som konverterar bäst
- Optimera CTA-placering

### **4. SEO & Content**
- Skapa landningssidor för populära yrken
- Blogginlägg om vanliga use cases
- FAQ baserat på verklig användning

---

## 🔐 Privacy & GDPR

- **Ingen personlig data** sparas (ingen email, namn, IP)
- **Anonyma sessioner** med random ID
- **Aggregerad data** för analytics
- **Opt-out möjligt** (framtida feature)

---

## 📊 Deployment till Railway

### 1. Lägg till DATABASE_URL i Railway
```
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### 2. Kör migrations
```bash
npx prisma migrate deploy
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Deploy
```bash
git push
```

---

## 🎉 Resultat

Med detta system får du:

✅ **98% snabbare laddning** för återkommande sökningar  
✅ **Bättre rekommendationer** baserat på verklig användning  
✅ **Djupa insights** om dina användare  
✅ **Data för marknadsföring** och case studies  
✅ **Grunden för AI-förbättringar** (fine-tuning på verklig data)

---

## 🚀 Nästa steg

1. **Testa lokalt** - Kör några sökningar och se data i `/admin/analytics`
2. **Deploy till Railway** - Lägg till DATABASE_URL och kör migrations
3. **Övervaka** - Följ cache hit rate och populära kombinationer
4. **Optimera** - Använd data för att förbättra rekommendationer

**Nu sparas allt och varje sökning gör systemet smartare! 🎯**
