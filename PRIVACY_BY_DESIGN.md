# Privacy by Design - Mendio.io

**Dokument version:** 1.0  
**Senast uppdaterad:** 2025-01-04  
**Ansvarig:** Christopher Genberg, Dataskyddsansvarig

---

## 1. ÖVERSIKT

Detta dokument beskriver hur Mendio.io har implementerat "Privacy by Design" enligt GDPR Artikel 25. Vi har byggt in dataskydd från grunden i vår tjänst.

---

## 2. DATAMINIMERING

### Princip
Vi samlar endast in data som är absolut nödvändig för att tillhandahålla tjänsten.

### Implementation

#### **VÅD VI SAMLAR IN:**
- ✅ E-postadress (för att skicka resultat)
- ✅ Yrkesinformation (profession, specialisering)
- ✅ Arbetsuppgifter (för att generera relevanta rekommendationer)
- ✅ Användarfeedback (frivilligt, för att förbättra tjänsten)

#### **VAD VI INTE SAMLAR IN:**
- ❌ Personnummer
- ❌ Hemadress (utom för företagsfakturering vid Premium)
- ❌ Telefonnummer (utom frivilligt vid kontakt)
- ❌ Känsliga personuppgifter (hälsa, etnicitet, religion, etc.)
- ❌ Biometrisk data
- ❌ Finansiell information (hanteras av Stripe)

### Teknisk implementation
```typescript
// Exempel från EmailCapture.tsx
interface EmailCaptureData {
  email: string;          // Endast email
  consent: boolean;       // Explicit samtycke
  // Ingen onödig data samlas in
}
```

---

## 3. SÄKERHET

### Princip
Alla personuppgifter skyddas med branschstandard säkerhetsåtgärder.

### Implementation

#### **KRYPTERING:**
- ✅ HTTPS överallt (TLS 1.3)
- ✅ Database krypterad at-rest
- ✅ Säker dataöverföring mellan klient och server

#### **ÅTKOMSTKONTROLL:**
- ✅ API-nycklar lagras i miljövariabler (aldrig i kod)
- ✅ Database credentials i säkra miljövariabler
- ✅ Begränsad åtkomst till produktionsdatabas
- ✅ Ingen admin-panel exponerad publikt

#### **INFRASTRUKTUR:**
- ✅ Hosting i EU (Railway - Frankfurt/Amsterdam)
- ✅ PostgreSQL database i EU
- ✅ Automatiska säkerhetsuppdateringar
- ✅ Regelbundna backups

### Teknisk implementation
```typescript
// Prisma client - säker databasåtkomst
import prisma from "@/lib/prisma";

// API routes - force-dynamic för säkerhet
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

---

## 4. ANVÄNDARRÄTTIGHETER

### Princip
Användare har full kontroll över sina data enligt GDPR.

### Implementation

#### **RÄTT TILL TILLGÅNG:**
- ✅ Användare kan se sin data via exportfunktion
- ✅ `/gdpr/exportera-data` - ladda ner all data som JSON

#### **RÄTT ATT BLI GLÖMD:**
- ✅ Användare kan radera all sin data
- ✅ `/gdpr/radera-data` - permanent radering
- ✅ API endpoint: `/api/gdpr/delete-data`

#### **DATAPORTABILITET:**
- ✅ Export i maskinläsbart format (JSON)
- ✅ API endpoint: `/api/gdpr/export-data`

#### **RÄTT ATT ÅTERKALLA SAMTYCKE:**
- ✅ Cookie banner med möjlighet att neka
- ✅ Tydlig information om vad samtycke innebär
- ✅ Enkelt att återkalla via kontakt

### Teknisk implementation
```typescript
// GDPR delete endpoint
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  // Delete all user data
  await prisma.userSession.deleteMany({ where: { email } });
  await prisma.feedback.deleteMany({ where: { email } });
  
  // Log for compliance
  console.log(`GDPR: Deleted data for ${email}`);
}
```

---

## 5. TRANSPARENS

### Princip
Användare ska alltid veta vad som händer med deras data.

### Implementation

#### **TYDLIG INFORMATION:**
- ✅ Integritetspolicy på `/integritetspolicy`
- ✅ Användarvillkor på `/anvandarvillkor`
- ✅ Cookie banner vid första besök
- ✅ Tydlig information vid email-insamling

#### **SAMTYCKE:**
- ✅ Explicit checkbox för email-samtycke
- ✅ "Jag godkänner att mina uppgifter sparas..."
- ✅ Länk till integritetspolicy vid samtycke
- ✅ Ingen pre-checked checkboxes

#### **KOMMUNIKATION:**
- ✅ Dataskyddsansvarig tydligt angiven
- ✅ Kontaktinformation lättillgänglig
- ✅ Svar på GDPR-förfrågningar inom 30 dagar

### Teknisk implementation
```typescript
// EmailCapture.tsx - tydligt samtycke
<label className="flex items-start gap-3">
  <input
    type="checkbox"
    checked={consent}
    onChange={(e) => setConsent(e.target.checked)}
    required
  />
  <span>
    Jag godkänner att mina uppgifter sparas enligt{" "}
    <a href="/integritetspolicy">integritetspolicyn</a>
  </span>
</label>
```

---

## 6. TREDJEPARTSLEVERANTÖRER

### Princip
Vi använder endast betrodda leverantörer som följer GDPR.

### Leverantörer och deras roll

#### **RAILWAY (Hosting)**
- **Vad:** Server hosting och databas
- **Plats:** EU (Frankfurt/Amsterdam)
- **GDPR:** Ja, GDPR-kompatibel
- **Data:** Teknisk data, användarsessioner
- **DPA:** Finns tillgänglig

#### **OPENAI (AI-generering)**
- **Vad:** Genererar AI-rekommendationer
- **Plats:** USA (men GDPR-kompatibel)
- **GDPR:** Ja, följer GDPR
- **Data:** Anonymiserad yrkesinformation (ingen PII)
- **DPA:** Finns tillgänglig

#### **STRIPE (Betalningar)**
- **Vad:** Betalningshantering för Premium
- **Plats:** Global (EU-server för EU-kunder)
- **GDPR:** Ja, GDPR-kompatibel
- **Data:** Betalningsinformation (hanteras av Stripe, inte oss)
- **DPA:** Finns tillgänglig

### Datadelning
```typescript
// Vi anonymiserar data till OpenAI
const prompt = `
  Profession: ${profession}
  Specialization: ${specialization}
  Tasks: ${tasks}
  // Ingen email, namn eller PII skickas
`;
```

---

## 7. DATALAGRING

### Princip
Data lagras endast så länge som nödvändigt.

### Lagringstider

| Data typ | Lagringstid | Motivering |
|----------|-------------|------------|
| Email | Till radering begärs | För att skicka resultat och uppdateringar |
| Yrkesinformation | Till radering begärs | För att förbättra rekommendationer |
| Användarsessioner | 90 dagar | För analytics och förbättringar |
| Feedback | 1 år | För produktutveckling |
| Premium-data | Till prenumeration avslutas | För att tillhandahålla tjänsten |
| Logs | 30 dagar | För felsökning och säkerhet |

### Automatisk rensning
```typescript
// Planerad: Cron job för att rensa gammal data
// Körs varje natt kl 02:00
async function cleanupOldData() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  await prisma.userSession.deleteMany({
    where: { createdAt: { lt: ninetyDaysAgo } }
  });
}
```

---

## 8. INCIDENTHANTERING

### Princip
Vi har rutiner för att hantera eventuella dataintrång.

### Process

#### **VID DATAINTRÅNG:**
1. **Upptäckt** - Identifiera omfattning
2. **Innehåll** - Stoppa intrånget omedelbart
3. **Bedömning** - Utvärdera risk för användare
4. **Anmälan** - Till Datainspektionen inom 72h (om risk)
5. **Information** - Till berörda användare utan onödigt dröjsmål
6. **Åtgärd** - Förhindra framtida intrång

#### **KONTAKT VID INCIDENT:**
- Dataskyddsansvarig: Christopher Genberg
- Email: ch.genberg@gmail.com
- Telefon: +46 732 30 55 21

### Loggning
```typescript
// All GDPR-aktivitet loggas
console.log(`GDPR: Data exported for ${email} at ${new Date()}`);
console.log(`GDPR: Data deleted for ${email} at ${new Date()}`);
```

---

## 9. PRIVACY BY DEFAULT

### Princip
Standardinställningar ska alltid vara mest privata.

### Implementation

#### **COOKIES:**
- ✅ Endast nödvändiga cookies aktiverade by default
- ✅ Analytics cookies kräver samtycke
- ✅ Inga tredjepartscookies

#### **DATA:**
- ✅ Ingen automatisk profilskapande
- ✅ Ingen automatisk delning med tredje part
- ✅ Ingen försäljning av data (aldrig!)

#### **SYNLIGHET:**
- ✅ Användarprofiler är privata
- ✅ Ingen publik visning av användardata
- ✅ Resultat delas endast om användaren väljer det

---

## 10. REGELBUNDEN GRANSKNING

### Princip
Vi granskar och uppdaterar våra dataskyddsrutiner regelbundet.

### Schema

| Aktivitet | Frekvens | Ansvarig |
|-----------|----------|----------|
| Granska integritetspolicy | Kvartalsvis | Dataskyddsansvarig |
| Säkerhetsuppdateringar | Löpande | Tech Lead |
| Leverantörsgranskning | Årligen | Dataskyddsansvarig |
| GDPR-utbildning | Årligen | Alla medarbetare |
| Incident response test | Halvårsvis | Tech Lead |

### Dokumentation
- Detta dokument uppdateras vid varje större förändring
- Versionshistorik sparas
- Alla ändringar loggas

---

## 11. KONTAKT

För frågor om detta dokument eller våra dataskyddsrutiner:

**Dataskyddsansvarig:**  
Christopher Genberg  
Christopher Genberg AB  
ch.genberg@gmail.com  
+46 732 30 55 21

---

## 12. VERSIONSHISTORIK

| Version | Datum | Ändringar | Ansvarig |
|---------|-------|-----------|----------|
| 1.0 | 2025-01-04 | Första versionen | Christopher Genberg |

---

**Signatur:**  
Christopher Genberg  
Dataskyddsansvarig  
2025-01-04
