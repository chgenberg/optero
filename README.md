# MyAIGuy - AI-verktygsrekommendationer för yrkesverksamma

En AI-driven tjänst som hjälper yrkesverksamma att hitta AI-verktyg anpassade för deras specifika arbetsuppgifter.

## Funktioner

- **Enkel och ren design** - Vit bakgrund med pulserande, mjuk ruta i centrum
- **Auto-complete för yrken** - Intelligent sökning som föreslår yrken medan du skriver
- **Stegvis guide** - Yrke → Specialisering → Arbetsuppgifter → AI-rekommendationer
- **AI-driven analys** - Använder GPT-4 för att ge skräddarsydda rekommendationer
- **5 konkreta verktyg** - Med beskrivningar, användningsområden och direktlänkar

## Teknisk stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS med custom animationer
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4
- **Hosting**: Vercel (rekommenderat)

## Installation

1. Klona projektet:
\`\`\`bash
cd MyAIGuy
\`\`\`

2. Installera dependencies:
\`\`\`bash
npm install
\`\`\`

3. Skapa en \`.env.local\` fil och lägg till din OpenAI API-nyckel:
\`\`\`
OPENAI_API_KEY=din-api-nyckel-här
\`\`\`

4. Kör utvecklingsservern:
\`\`\`bash
npm run dev
\`\`\`

5. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare

## Miljövariabler

Skapa en \`.env.local\` fil i root-mappen:

\`\`\`
OPENAI_API_KEY=sk-...
\`\`\`

Få din API-nyckel från [OpenAI Platform](https://platform.openai.com/api-keys)

## Användning

1. Ange ditt yrke (med auto-complete stöd)
2. Välj din specialisering/inriktning
3. Markera dina huvudsakliga arbetsuppgifter
4. Få 5 AI-verktygsrekommendationer skräddarsydda för dig

## Deployment

Enklast att deploya till Vercel:

\`\`\`bash
npm run build
\`\`\`

Eller använd Vercel CLI:

\`\`\`bash
vercel
\`\`\`

Glöm inte att lägga till \`OPENAI_API_KEY\` i dina environment variables på Vercel.

## Struktur

\`\`\`
app/
  ├── api/
  │   └── recommendations/
  │       └── route.ts          # Backend API för AI-rekommendationer
  ├── globals.css
  ├── layout.tsx
  └── page.tsx                  # Huvudsida med flödeshantering
components/
  ├── AIRecommendations.tsx     # Visar resultat från AI
  ├── InfoPopup.tsx             # Information om tjänsten
  ├── ProfessionInput.tsx       # Yrkesinmatning med auto-complete
  ├── SpecializationInput.tsx   # Välj specialisering
  └── TaskSelection.tsx         # Välj arbetsuppgifter
\`\`\`

## Anpassning

### Lägg till fler yrken

Redigera \`PROFESSIONS\` array i \`components/ProfessionInput.tsx\`

### Lägg till fler specialiseringar

Redigera \`SPECIALIZATIONS\` object i \`components/SpecializationInput.tsx\`

### Lägg till fler arbetsuppgifter

Redigera \`TASKS\` object i \`components/TaskSelection.tsx\`

### Ändra AI-modell

Redigera \`model\` parameter i \`app/api/recommendations/route.ts\`

## Licens

MIT

