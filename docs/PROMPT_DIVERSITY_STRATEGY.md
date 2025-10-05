# Mendio Prompt Diversity Strategy

## Vision: Maximal variation och värde för varje användare

### Problem vi löser
Två högstadielärare kan ha HELT olika vardag:
- **Lärare A**: Fokuserar på "Rätta prov", "Planera lektioner", "Föräldrakontakt"
- **Lärare B**: Fokuserar på "Elevstöd", "Grupparbeten", "Digitala verktyg"

→ De behöver OLIKA prompts!

## Hur systemet fungerar

### Exempel: 3 Högstadielärare

#### Lärare 1: Anna
**Uppgifter**: Rätta prov, Planera lektioner, Föräldrakontakt

**Genererade prompts (10 st):**
1. "Automatisera provbedömning med AI"
2. "Skapa lektionsplaneringar på 5 minuter"
3. "Generera föräldramejl automatiskt"
4. "Analysera elevprestationer med AI"
5. "Skapa bedömningsmatriser snabbt"
6. "Differentiera uppgifter automatiskt"
7. "Generera återkoppling till elever"
8. "Planera terminsöversikt med AI"
9. "Skapa föräldramötesagenda"
10. "Analysera provresultat visuellt"

**Sparas i DB**: ✅ 10 nya prompts för "Högstadielärare"

---

#### Lärare 2: Bengt (samma dag)
**Uppgifter**: Elevstöd, Grupparbeten, Digitala verktyg

**Systemet:**
1. Ser att det finns 10 prompts för "Högstadielärare"
2. Men Bengts uppgifter är OLIKA från Annas
3. → Genererar 10 NYA prompts fokuserade på HAN uppgifter

**Genererade prompts (10 st):**
1. "Skapa individuella utvecklingsplaner med AI"
2. "Generera gruppindelningar automatiskt"
3. "Designa digitala övningar med AI"
4. "Skapa stödmaterial för elever i svårigheter"
5. "Generera grupparbetsuppgifter"
6. "Analysera elevengagemang i digitala verktyg"
7. "Skapa anpassade läromedel"
8. "Generera mentorsamtal-guider"
9. "Designa interaktiva presentationer"
10. "Skapa elevportfölj-mallar"

**Sparas i DB**: ✅ 10 nya prompts (totalt 20 för "Högstadielärare")

---

#### Lärare 3: Clara (vecka senare)
**Uppgifter**: Rätta prov, Elevstöd, Planera lektioner

**Systemet:**
1. Ser att det finns 20 prompts för "Högstadielärare"
2. Claras uppgifter överlappar delvis med Anna och Bengt
3. → Genererar 10 NYA prompts som täcker HENNES specifika mix

**Genererade prompts (10 st):**
1. "Kombinera provbedömning med elevstöd"
2. "Skapa adaptiva lektioner baserat på provresultat"
3. "Generera individualiserade läxor"
4. "Analysera elevbehov från provdata"
5. "Skapa differentierade provuppgifter"
6. "Generera stödmaterial baserat på provresultat"
7. "Planera stödlektioner automatiskt"
8. "Skapa formativ bedömning med AI"
9. "Generera elevsamtal-underlag"
10. "Analysera lärandemönster"

**Sparas i DB**: ✅ 10 nya prompts (totalt 30 för "Högstadielärare")

---

## Resultat efter 3 användare:

**Databasen innehåller nu:**
- 30 unika prompts för "Högstadielärare"
- Täcker 9 olika arbetsuppgifter
- Olika perspektiv och kombinationer

**Lärare 4 (David) kommer in:**
- Ser ALLA 30 befintliga prompts
- 3 mest relevanta visas under varje scenario
- 10 NYA prompts genereras baserat på HANS uppgifter
- → Totalt 40 prompts i databasen

## Exponentiell tillväxt

```
Dag 1:  10 högstadielärare → 100 prompts
Dag 30: 300 högstadielärare → 3,000 prompts
År 1:   10,000 högstadielärare → 100,000 prompts

Alla dessa prompts är UNIKA och fokuserade på olika kombinationer av uppgifter!
```

## Smart matchning

När en användare får sina resultat:
```typescript
// Scenario: "Automatisera provbedömning"
// Systemet visar de 3 MEST RELEVANTA promptsen från alla 100,000

Matchning baserat på:
1. Tags som matchar scenario-titel
2. Kategori som matchar användningsfall
3. Användningsstatistik (populära prompts)
4. Rating (högst betyg)
```

## Varför detta är genialt

### 1. Ingen duplicering
- Varje sökning genererar UNIKA prompts
- GPT-5 får lista på befintliga prompts och måste skapa nya

### 2. Maximal täckning
- Täcker alla möjliga kombinationer av uppgifter
- Bygger en komplett "prompt-atlas" för varje yrke

### 3. Kvalitet över tid
- Populära prompts rankas högre
- Dåliga prompts används aldrig
- Community-rating förbättrar kvalitet

### 4. Nätverkseffekt
- Ju fler användare → fler prompts → mer värde för alla
- Även om du har ovanliga uppgifter → får du relevanta prompts

## Exempel på tillväxt

### Högstadielärare efter 1 år:

**1,000 unika sökningar** med olika uppgiftskombinationer:
- 10,000 prompts i databasen
- Täcker 50+ olika arbetsuppgifter
- Alla möjliga kombinationer
- På 5 språk = 50,000 översatta prompts

**Värde för användare:**
- Lärare #1: Får 10 prompts
- Lärare #1000: Får välja bland 10,000 prompts (visar 3 bästa per scenario)

## Sammanfattning

✅ **Ja, systemet skapar ALLTID 10 nya prompts** baserat på specifika uppgifter
✅ **Undviker duplicering** genom att berätta för GPT-5 vilka som redan finns
✅ **Bygger diversitet** - varje användare bidrar med unika perspektiv
✅ **Maximerar värde** - databasen blir mer värdefull för varje sökning

**Mendio = En självförstärkande prompt-maskin** 🚀
