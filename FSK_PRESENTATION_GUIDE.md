# 🎯 FSK GROUP PRESENTATION - Demo Guide

## 🚀 AI Hackathon Demo Tool

**URL:** `http://localhost:3000/hackathon-demo` (eller din production URL)

---

## 📋 HUR DU ANVÄNDER DEMON I PRESENTATIONEN

### **SCENARIO 1: Under "Pitch & Live-Demo" (14:45-15:30)**

#### Steg 1: Gruppen presenterar sin idé (5 min)
Låt gruppen pitcha sin utmaning, exempel:
> "Vi är ett rekryteringsföretag och spenderar 15h/vecka på att skriva jobbannons​er och screena CV:n. Vi vill bli snabbare utan att minska kvaliteten."

#### Steg 2: DU kör live-demo (2 min)
1. Öppna `http://localhost:3000/hackathon-demo` (helskärm!)
2. Välj "Rekrytering & Talent Acquisition" från dropdown
3. Klistra in/skriv deras utmaning i textfältet
4. Klicka "⚡ GENERERA AI-LÖSNING"
5. Vänta 20-30 sekunder...

#### Steg 3: WOW-MOMENT! 🤯
Verktyget genererar INSTANT:
- ✅ **3 konkreta AI-lösningar** med verktyg, tidsbesparing, kostnad
- ✅ **30-dagars implementeringsplan** (vecka-för-vecka)
- ✅ **ROI-kalkyl** (tidsbesparing + värde i kr)
- ✅ **Färdiga prompts** att testa DIREKT
- ✅ **Nästa steg** för organisationen

#### Steg 4: Diskussion (3 min)
Peka på konkreta detaljer:
- "Se här - ni kan börja med ChatGPT för X, kostar 200kr/månad"
- "Vecka 1: testa på 5 kandidater, utvärdera"
- "Estimerad tidsbesparing: 12h/vecka = 48h/månad = 144 000kr/år i värde!"

---

## 🎨 DESIGNEN

- **Färger:** Minimalistisk design med vit bakgrund, svart text och mörkgrå accenter (matchar er sajt!)
- **Branding:** Optero × FSK Group samarbete tydligt synligt
- **Proffsig:** Enterprise-kvalitet med custom dropdown och proffsig finish
- **Responsiv:** Funkar på projektor, laptop, mobil
- **Custom elements:** Anpassad dropdown-meny, subtila hover-effekter, mjuka animationer

---

## 💡 ALTERNATIVA ANVÄNDNINGSFALL

### **SCENARIO 2: Under Brainstorm (10:45-12:00)**
Grupper som är fast kan använda verktyget för inspiration:
- "Vi vet inte vad som är möjligt med AI..."
- → Skriv in ett problem → Få 3 förslag → Välj en att utveckla vidare

### **SCENARIO 3: Som "Magi-moment" i början**
Under "AI-spaning" (08:30-09:15):
- Berätta om en generisk utmaning
- Kör live-demo
- Visa hur snabbt AI kan gå från problem → lösning
- **"Detta är vad vi ska lära oss att göra idag!"**

---

## 🎯 VAD VERKTYGET DEMONSTRERAR

1. **SNABBHET:** Från idé till plan på 30 sekunder
2. **KONKRETHET:** Inte vaga förslag, utan exakta verktyg, kostnader, steg
3. **VÄRDE:** Tydlig ROI-kalkyl som ledningsgrupper förstår
4. **ACTIONABLE:** Färdiga prompts att testa samma dag

---

## 📊 EXEMPEL-OUTPUT (för att förbereda dig)

### Input:
```
Bransch: Rekrytering & Talent Acquisition
Utmaning: Vi spenderar 15h/vecka på att skriva annonser och screena CV:n. 
          Tar tid från strategiskt arbete. Missar kandidater med ovanliga bakgrunder.
```

### Output (ungefär):
```
SAMMANFATTNING:
- Tidsbesparing: 12-15h/vecka
- Värde: 45 000 kr/månad
- Implementation: 2 veckor

LÖSNINGAR:
1. ChatGPT för Annonstext
   • Generera 5 varianter av annons på 5 min
   • Tidsbesparing: 6h/vecka
   • Kostnad: 200kr/mån
   • Testa: "Skriv en jobbannons för [roll] som fokuserar på..."

2. Claude för CV-Screening
   • Analysera 50 CV:n på 10 min
   • Tidsbesparing: 5h/vecka
   • Kostnad: 200kr/mån
   • Testa: "Analysera dessa CV:n mot..."

3. Make.com för Automation
   • Automatisk sortering av ansökningar
   • Tidsbesparing: 2h/vecka
   • Kostnad: 0-300kr/mån
   • Testa: Skapa workflow för email → CRM

IMPLEMENTERINGSPLAN:
Vecka 1: Pilot - Testa ChatGPT på 3 annonser
Vecka 2: Scale - Använd för alla annonser
Vecka 3: Lägg till CV-screening
Vecka 4: Automation + utvärdering

NÄSTA STEG:
1. Boka 2h workshop med rekryteringsteamet
2. Skapa ChatGPT Plus-konto (200kr/mån)
3. Testa på 5 annonser denna vecka
4. Mät tidsbesparing vs. kvalitet
5. Beslut: Scale eller justera
```

---

## 🎤 PRESENTATIONSTIPS

### **Före demon:**
"Nu ska jag visa er något magiskt. Den idé ni just presenterade - 
 låt oss se vad AI kan göra med den på 30 sekunder."

### **Under demon:**
- Läs upp utmaningen högt medans du skriver
- Bygg spänning: "Nu trycker jag..."
- Under loading (30 sek): "AI analyserar nu tusentals liknande case, 
  matchar verktyg, beräknar ROI, skapar implementeringsplan..."

### **Efter demon:**
"Boom! På 30 sekunder fick vi:
 - 3 konkreta lösningar ni kan testa IDAG
 - Exakta verktyg och kostnader
 - 30-dagars plan
 - ROI-kalkyl som visar 45 000kr i värde per månad
 
 Detta är kraften i AI - från idé till handling, INSTANT."

---

## 🔧 TEKNISKA DETALJER

### Starta development server:
```bash
cd /Users/christophergenberg/Desktop/MyAIGuy
npm run dev
```

### Öppna demon:
```
http://localhost:3000/hackathon-demo
```

### Om något går fel:
1. Kolla att servern körs (`npm run dev`)
2. Kolla att OpenAI API-key finns i `.env.local`
3. Kolla konsolen för errors
4. Backup: Förbered en screenshot av tidigare results

---

## 📱 MOBILVERSION

Verktyget fungerar även på mobil!
- Dela länken till deltagare
- De kan testa sina egna idéer
- "Take-home"-uppgift efter workshopen

---

## 🎁 BONUS: Efter presentationen

**1. Erbjud tillgång till verktyget:**
"Vill ni testa egna scenarion? Kontakta mig så får ni tillgång!"

**2. Lead generation:**
Samla in emails från intresserade
→ Följ upp med:
- Premium-analys för deras specifika verksamhet
- Workshop-erbjudande
- Konsulttjänster

**3. Case study:**
"Kan vi dokumentera FSK:s AI-resa och använda som case?"

---

## 💰 VÄRDEPROPOSITION för FSK

Efter demon, pitcha samarbete:

**"Detta verktyg kan vi white-labela för FSK:"**
- FSK-branding
- Specialanpassat för era branscher (rekrytering, HR, leadership)
- Integrera i TalentHub/Career Cruise
- Använd i alla era workshops och utbildningar
- Lead-gen verktyg för nya kunder

**Pris:** [Diskutera]
**Värde för FSK:**
- Differentiera er från konkurrenter
- "AI-powered" positioning
- Lead generation
- Högre priser för workshops ("inkl. AI-verktyg")

---

## ✅ CHECKLISTA FÖR PRESENTATIONEN

Dagen före:
- [ ] Testa demon end-to-end
- [ ] Förbered 2-3 exempel-scenarion
- [ ] Screenshot av bra results (backup)
- [ ] Kolla att servern startar korrekt
- [ ] Testa på mobiltelefon också

På morgonen:
- [ ] Starta development server
- [ ] Öppna demon i browser (helskärm)
- [ ] Testa en gång till
- [ ] Ladda laptop (!)
- [ ] Ha backup: mobil hotspot om wifi suger

Under presentationen:
- [ ] Projicera tydligt
- [ ] Låt deltagare diktera utmaningen
- [ ] Bygg spänning under loading
- [ ] Skrolla igenom alla results
- [ ] Poängtera konkreta detaljer

---

## 🚀 LYCKA TILL!

Detta kommer bli **MAGISKT**! 

Frågor? Testa nu så du känner dig bekväm.

**Du kommer äga rummet med denna demo!** 💪

