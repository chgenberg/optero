# DPIA Assessment - Mendio.io
## Dataskyddskonsekvensbedömning (Data Protection Impact Assessment)

**Dokument version:** 1.0  
**Datum:** 2025-01-04  
**Ansvarig:** Christopher Genberg, Dataskyddsansvarig  
**Företag:** Christopher Genberg AB (559318-7089)

---

## 1. SAMMANFATTNING

Denna bedömning utvärderar om Mendio.io kräver en fullständig Dataskyddskonsekvensbedömning (DPIA) enligt GDPR Artikel 35.

**SLUTSATS:** ❌ **DPIA KRÄVS INTE**

Mendio.io uppfyller inte kriterierna för obligatorisk DPIA eftersom tjänsten:
- Inte behandlar känsliga personuppgifter i stor skala
- Inte utför systematisk och omfattande profilering
- Inte använder automatiserat beslutsfattande med rättslig effekt
- Inte övervakar offentliga platser i stor skala

---

## 2. GDPR ARTIKEL 35 - NÄR KRÄVS DPIA?

### Enligt GDPR Artikel 35(1) krävs DPIA när behandlingen "sannolikt medför en hög risk för fysiska personers rättigheter och friheter."

### Artikel 35(3) specificerar att DPIA krävs särskilt för:

#### a) **Systematisk och omfattande utvärdering av personliga aspekter baserad på automatiserad behandling, inklusive profilering**
**Mendio:** ❌ Uppfyller INTE detta kriterium
- Vi utför ingen omfattande profilering
- Ingen automatiserad beslutsfattande som påverkar användare juridiskt eller betydligt
- Rekommendationer är informativa, inte bindande

#### b) **Behandling i stor skala av särskilda kategorier av personuppgifter (känsliga uppgifter)**
**Mendio:** ❌ Uppfyller INTE detta kriterium
- Vi behandlar INTE känsliga personuppgifter:
  - ❌ Hälsodata
  - ❌ Etniskt ursprung
  - ❌ Politiska åsikter
  - ❌ Religiös övertygelse
  - ❌ Fackföreningsmedlemskap
  - ❌ Genetiska data
  - ❌ Biometriska data
  - ❌ Sexuell läggning

#### c) **Systematisk övervakning i stor skala av offentligt tillgängliga områden**
**Mendio:** ❌ Uppfyller INTE detta kriterium
- Ingen kameraövervakning
- Ingen spårning av fysiska rörelser
- Ingen övervakning av offentliga platser

---

## 3. DETALJERAD ANALYS AV MENDIO.IO

### 3.1 Typ av databehandling

| Kriterium | Mendio.io | Riskbedömning |
|-----------|-----------|---------------|
| **Typ av data** | Email, yrke, arbetsuppgifter | LÅG - Vanliga personuppgifter |
| **Omfattning** | < 10,000 användare/år (estimat) | LÅG - Inte stor skala |
| **Automatisering** | AI-rekommendationer (informativa) | LÅG - Ingen rättslig påverkan |
| **Profilering** | Begränsad (endast för rekommendationer) | LÅG - Ingen omfattande profilering |
| **Känsliga uppgifter** | Nej | INGEN RISK |
| **Barn** | Nej (18+ enligt användarvillkor) | INGEN RISK |
| **Övervakning** | Nej | INGEN RISK |

### 3.2 Vad vi faktiskt gör

```
ANVÄNDAREN ANGER:
1. Email (för att få resultat)
2. Yrke (t.ex. "Lärare")
3. Specialisering (t.ex. "Gymnasielärare")
4. Arbetsuppgifter (t.ex. "Rätta prov", "Planera lektioner")

VI GENERERAR:
- AI-rekommendationer för verktyg
- Användningsscenarier
- Implementeringsförslag

ANVÄNDAREN FÅR:
- Informativa förslag (ingen bindande effekt)
- Möjlighet att exportera/radera data
- Full kontroll över sina uppgifter
```

### 3.3 Riskbedömning

| Risk | Sannolikhet | Konsekvens | Åtgärd |
|------|-------------|------------|--------|
| Dataintrång | LÅG | MEDEL | HTTPS, kryptering, säker hosting |
| Obehörig åtkomst | LÅG | LÅG | Åtkomstkontroll, API-nycklar |
| Dataförlust | LÅG | LÅG | Regelbundna backups |
| Missbruk av data | MYCKET LÅG | LÅG | Ingen försäljning, tydlig policy |
| Diskriminering | INGEN | INGEN | Ingen automatiserad beslutsfattande |
| Identitetsstöld | LÅG | MEDEL | Minimal datainsamling |

**TOTAL RISK:** LÅG - Ingen hög risk för användarnas rättigheter

---

## 4. DATAINSPEKTIONENS LISTA

### Datainspektionen (IMY) har publicerat en lista över behandlingar som kräver DPIA.

**Mendio.io matchar INGEN av följande:**

1. ❌ Systematisk utvärdering eller poängsättning (scoring)
2. ❌ Automatiserat beslutsfattande med rättslig effekt
3. ❌ Systematisk övervakning
4. ❌ Känsliga uppgifter i stor skala
5. ❌ Personuppgifter om brottmål eller brott
6. ❌ Systematisk matchning eller sammankoppling av dataset
7. ❌ Data om sårbara grupper (barn, funktionsnedsättning)
8. ❌ Innovativ teknik (biometri, genetik, etc.)
9. ❌ Överföring utanför EU som hindrar rättigheter

---

## 5. PROPORTIONALITETSPRINCIPEN

### Är behandlingen proportionerlig?

**JA** - Vi samlar endast in data som är nödvändig för tjänsten:

| Data | Nödvändig? | Motivering |
|------|------------|------------|
| Email | ✅ JA | För att skicka resultat |
| Yrke | ✅ JA | För att ge relevanta rekommendationer |
| Arbetsuppgifter | ✅ JA | För att anpassa förslag |
| Namn | ❌ NEJ | Samlas INTE in |
| Adress | ❌ NEJ | Samlas INTE in (utom Premium fakturering) |
| Personnummer | ❌ NEJ | Samlas INTE in |

---

## 6. ANVÄNDARNAS RÄTTIGHETER

### Säkerställer vi användarnas GDPR-rättigheter?

| Rättighet | Implementerad? | Hur? |
|-----------|----------------|------|
| **Tillgång** | ✅ JA | `/gdpr/exportera-data` |
| **Rättelse** | ✅ JA | Kontakta dataskyddsansvarig |
| **Radering** | ✅ JA | `/gdpr/radera-data` |
| **Begränsning** | ✅ JA | Kontakta dataskyddsansvarig |
| **Dataportabilitet** | ✅ JA | JSON-export |
| **Invändning** | ✅ JA | Opt-out från email |
| **Automatiserat beslut** | N/A | Ingen automatiserad beslutsfattande |

---

## 7. SÄKERHETSÅTGÄRDER

### Tekniska och organisatoriska åtgärder

#### **TEKNISKA:**
- ✅ HTTPS/TLS 1.3 kryptering
- ✅ Database kryptering at-rest
- ✅ Säkra API-nycklar (miljövariabler)
- ✅ Regelbundna säkerhetsuppdateringar
- ✅ Hosting i EU (Railway)
- ✅ Begränsad API-åtkomst

#### **ORGANISATORISKA:**
- ✅ Dataskyddsansvarig utsedd
- ✅ Privacy by Design implementerat
- ✅ Integritetspolicy publicerad
- ✅ GDPR-rättigheter implementerade
- ✅ Incidenthanteringsplan
- ✅ Regelbunden granskning

---

## 8. TREDJEPARTSLEVERANTÖRER

### Alla leverantörer är GDPR-kompatibla

| Leverantör | Tjänst | GDPR? | DPA? | Plats |
|------------|--------|-------|------|-------|
| Railway | Hosting | ✅ JA | ✅ JA | EU |
| OpenAI | AI | ✅ JA | ✅ JA | USA (GDPR-compliant) |
| Stripe | Betalning | ✅ JA | ✅ JA | Global (EU-server) |

---

## 9. SLUTSATS

### Krävs DPIA för Mendio.io?

**❌ NEJ** - Baserat på följande:

1. **Ingen stor skala:**
   - < 10,000 användare/år
   - Begränsad datainsamling per användare

2. **Ingen känslig data:**
   - Endast email och yrkesinformation
   - Ingen hälsodata, etnicitet, etc.

3. **Ingen omfattande profilering:**
   - AI-rekommendationer är informativa
   - Ingen automatiserad beslutsfattande med rättslig effekt
   - Användaren har full kontroll

4. **Låg risk:**
   - Starka säkerhetsåtgärder
   - Användarrättigheter implementerade
   - Transparens och samtycke

5. **Proportionell behandling:**
   - Dataminimering
   - Ändamålsbegränsning
   - Lagringsminimering

### Rekommendation

**FORTSÄTT MED NUVARANDE DATASKYDDSPRAXIS**

Vi rekommenderar att:
- ✅ Fortsätta med Privacy by Design
- ✅ Upprätthålla säkerhetsåtgärder
- ✅ Granska årligen om DPIA blir nödvändig
- ✅ Dokumentera alla ändringar i databehandling

### När skulle DPIA bli nödvändig?

DPIA skulle krävas om vi:
- Börjar behandla känsliga personuppgifter (hälsa, etc.)
- Implementerar omfattande automatiserad beslutsfattande
- Når > 100,000 användare/år med omfattande profilering
- Börjar behandla data om barn systematiskt
- Implementerar övervakningsteknik

---

## 10. GRANSKNING OCH GODKÄNNANDE

**Granskad av:**  
Christopher Genberg, Dataskyddsansvarig  
Christopher Genberg AB  

**Datum:** 2025-01-04

**Nästa granskning:** 2026-01-04 (eller vid väsentlig förändring)

**Signatur:**  
_Christopher Genberg_

---

## 11. KONTAKT

För frågor om denna bedömning:

**Dataskyddsansvarig:**  
Christopher Genberg  
ch.genberg@gmail.com  
+46 732 30 55 21

---

## 12. REFERENSER

- GDPR Artikel 35 (Dataskyddskonsekvensbedömning)
- Datainspektionens vägledning om DPIA
- WP29 Guidelines on DPIA (wp248rev.01)
- Privacy by Design principer

---

**DOKUMENTSLUT**
