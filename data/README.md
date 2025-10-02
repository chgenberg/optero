# Yrkesdata

Denna mapp innehåller strukturerad data för yrkeskategorier som används i MyAIGuy-applikationen.

## Struktur

### professions.json

JSON-fil med alla yrken som finns i systemet. Varje yrke har följande struktur:

\`\`\`json
{
  "name": "Yrkesnamn",
  "description": "Kort beskrivning av yrket",
  "category": "Yrkeskategori"
}
\`\`\`

**Fält:**
- `name`: Namnet på yrket (används i auto-complete)
- `description`: En kort beskrivning av vad yrket innebär
- `category`: Kategorisering för gruppering av liknande yrken

**Kategorier:**
- Vård och omsorg
- IT och teknik
- Pedagogik och utbildning
- Bygg och anläggning
- Ekonomi och finans
- Juridik
- Hotell och restaurang
- Transport och logistik
- Försäljning
- Administration
- Och många fler...

## Användning

Datan importeras och används i frontend-komponenter för att ge användare en komplett lista över svenska yrken med auto-complete funktionalitet.

\`\`\`typescript
import professionsData from "@/data/professions.json";

const professionNames = professionsData.professions.map(p => p.name);
\`\`\`

## Uppdatera data

För att lägga till nya yrken eller uppdatera befintliga, redigera `professions.json` direkt. Strukturen måste bibehållas för att systemet ska fungera korrekt.

