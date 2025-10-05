# Mendio International Scaling Strategy

## Vision: Ett globalt AI-prompt bibliotek

### Nyckelinsikt
**En tysk lärare och en svensk lärare har samma utmaningar** - bara på olika språk. Genom att dela prompts över språkgränser multiplicerar vi värdet exponentiellt.

## 1. Multi-språk arkitektur

### Språk som stöds
- 🇸🇪 **Svenska** (hemmamarknad)
- 🇬🇧 **Engelska** (global standard)
- 🇪🇸 **Spanska** (500M+ talare)
- 🇫🇷 **Franska** (300M+ talare)
- 🇩🇪 **Tyska** (100M+ talare, stark ekonomi)

### Hur det fungerar

```typescript
// En prompt skapad på svenska
{
  id: "prompt-123",
  language: "sv",
  name: "Automatisera fakturahantering",
  prompt: "Du är en expert på ekonomi...",
  
  // Automatiskt översatt till alla språk
  translations: {
    "en": {
      name: "Automate invoice management",
      prompt: "You are an expert in finance..."
    },
    "es": {
      name: "Automatizar gestión de facturas",
      prompt: "Eres un experto en finanzas..."
    },
    "fr": { ... },
    "de": { ... }
  }
}
```

### Nätverkseffekt
- 1 svensk lärare skapar 10 prompts → 10 prompts tillgängliga
- 10 tyska lärare skapar 10 prompts var → 100 nya prompts
- **Alla 110 prompts översätts automatiskt** → 550 prompts totalt (110 × 5 språk)

## 2. Översättningsstrategi

### Automatisk översättning (GPT-5)
```typescript
// När en ny prompt skapas
1. Spara på originalspråk
2. Översätt automatiskt till alla 4 andra språk
3. Markera som "auto-translated"
4. Tillåt manuell förbättring senare
```

### Kvalitetssäkring
- **Tier 1**: Auto-översättning (GPT-5) - 95% kvalitet
- **Tier 2**: Community review - användare kan föreslå förbättringar
- **Tier 3**: Professional review - för premium/verifierade prompts

### Kostnadseffektivitet
```
Översättningskostnad per prompt:
- 4 språk × ~500 tokens × $0.01/1K tokens = $0.02 per prompt
- 10,000 prompts = $200 i översättningskostnader
- Värde: 50,000 översatta prompts (10K × 5 språk)
```

## 3. Användarupplevelse

### Språkval
```typescript
// Automatisk språkdetektering
1. Browser language
2. IP-baserad geo-location
3. Användarvald preferens (sparas)
```

### Sömlös upplevelse
- Tysk användare söker "Lehrer" → Hittar alla lärarprompts
- Ser prompts på tyska (oavsett originalspråk)
- Kan byta språk när som helst
- Prenumeration gäller alla språk

## 4. Affärsmodell per marknad

### Prissättning (anpassad per marknad)
```typescript
const PRICING_BY_MARKET = {
  se: { professional: 197, business: 697 }, // SEK
  de: { professional: 19, business: 69 },   // EUR
  en: { professional: 20, business: 70 },   // USD/GBP
  es: { professional: 18, business: 65 },   // EUR
  fr: { professional: 19, business: 69 },   // EUR
};
```

### Lokalisering
- Valuta per marknad
- Betalningsmetoder (Klarna för Norden, SEPA för EU)
- Lokala exempel och case studies
- Kulturanpassade prompts

## 5. Marknadsexpansion (Fas för fas)

### Fas 1: Nordiska marknaden (Q1 2025)
- 🇸🇪 Sverige (hemma)
- 🇳🇴 Norge
- 🇩🇰 Danmark
- 🇫🇮 Finland

**Strategi**: Samma språk (nästan), liknande arbetssätt, stark köpkraft

### Fas 2: DACH-regionen (Q2 2025)
- 🇩🇪 Tyskland (största EU-ekonomin)
- 🇦🇹 Österrike
- 🇨🇭 Schweiz

**Strategi**: Tysk översättning klar, professionell marknad, hög betalningsvilja

### Fas 3: Engelskspråkiga (Q3 2025)
- 🇬🇧 Storbritannien
- 🇺🇸 USA (selektivt)
- 🇦🇺 Australien

**Strategi**: Största marknaden, men också mest konkurrens

### Fas 4: Latinamerika & Frankofona (Q4 2025)
- 🇪🇸 Spanien
- 🇲🇽 Mexico
- 🇫🇷 Frankrike
- 🇨🇦 Kanada (Quebec)

**Strategi**: Underutnyttjade marknader, mindre konkurrens

## 6. Teknisk implementation

### Database struktur
```sql
-- Alla prompts i en tabell
-- Översättningar i JSON-fält
-- Snabb sökning på alla språk

CREATE INDEX idx_profession_lang ON prompt_library(profession, language);
CREATE INDEX idx_translations ON prompt_library USING gin(translations);
```

### API endpoints
```typescript
// Hämta prompts på valfritt språk
GET /api/prompts?profession=teacher&lang=de

// Översätt en specifik prompt
POST /api/prompts/translate
{ promptId, targetLanguages: ["de", "fr"] }

// Batch-översätt alla prompts för ett yrke
PUT /api/prompts/translate
{ profession: "teacher", targetLanguages: ["de"] }
```

### Caching strategi
```typescript
// Cache översättningar aggressivt
- Redis cache per språk/yrke
- CDN för statiskt innehåll
- Edge functions för geo-routing
```

## 7. Konkurrensfördelar

### Varför vi vinner internationellt

1. **First-mover i Europa**: Få konkurrenter fokuserar på europeiska språk
2. **Nätverkseffekt**: Mer innehåll på fler språk → mer värde
3. **Lokal expertis**: Förstår europeiska arbetsmarknader
4. **GDPR-compliant**: Redan byggt för EU-regler
5. **Kvalitet över kvantitet**: Verifierade, testade prompts

### Moat building
- **Data moat**: Första till 100K+ prompts på 5 språk
- **Network moat**: Användare i 10+ länder
- **Brand moat**: "Mendio = AI för europeiska yrkesverksamma"

## 8. Go-to-Market per land

### Tyskland (exempel)
```typescript
Launch checklist:
✅ Översätt alla prompts till tyska
✅ Lokalisera hemsida (mendio.de)
✅ Tyska betalningsmetoder (SEPA, Sofort)
✅ Tyska case studies (tysk lärare, tysk ekonom)
✅ Partnership med tysk fackförening/branschorganisation
✅ Content marketing på tyska (LinkedIn, YouTube)
✅ Tysk customer support
```

### Marknadsföring
- LinkedIn ads (targeting: "Lehrer Deutschland")
- Google Ads (keywords: "KI für Lehrer", "AI Prompts Deutsch")
- Partnerships med tyska EdTech-företag
- Webinars på tyska

## 9. Metrics & KPIs

### Per marknad
```typescript
Track:
- Users per country
- Prompts per language
- Translation quality score
- Conversion rate per market
- LTV per market
- CAC per market
```

### Global metrics
```typescript
- Total prompts: 100K (target)
- Languages covered: 5
- Translation coverage: 95%+
- Markets active: 10+
- International revenue: 50% of total
```

## 10. Risker & Mitigering

### Kulturella skillnader
**Risk**: Prompts fungerar inte i alla kulturer
**Mitigering**: Lokala ambassadörer per marknad, anpassning av exempel

### Översättningskvalitet
**Risk**: Dåliga översättningar skadar varumärket
**Mitigering**: Community review, professional verification för premium

### Juridiska skillnader
**Risk**: Olika regler per land (arbetsrätt, dataskydd)
**Mitigering**: Juridisk review per marknad, ansvarsfriskrivning

### Konkurrens
**Risk**: Lokala konkurrenter med bättre marknadskunskap
**Mitigering**: Snabb expansion, partnerships, överlägsen produkt

## 11. Finansiell projektion

### År 1 (2025)
- **Marknader**: 5 länder (SE, NO, DK, DE, UK)
- **Användare**: 50,000
- **ARR**: 10 MSEK
- **Översättningskostnad**: 50K SEK

### År 2 (2026)
- **Marknader**: 10 länder
- **Användare**: 200,000
- **ARR**: 50 MSEK
- **Översättningskostnad**: 200K SEK

### År 3 (2027)
- **Marknader**: 15+ länder
- **Användare**: 500,000
- **ARR**: 150 MSEK
- **Översättningskostnad**: 500K SEK

**ROI på översättning**: 300:1 (150M revenue / 500K cost)

## 12. Sammanfattning

**Vi bygger inte bara en svensk tjänst.**

Vi bygger Europas ledande AI-prompt plattform. Genom intelligent översättning och delning av kunskap över språkgränser skapar vi ett nätverk där varje ny användare ökar värdet för alla andra - oavsett vilket språk de talar.

**Mendio = AI för alla europeiska yrkesverksamma** 🇪🇺
