# 🔍 Web Scraping & RAG Strategy

## Nuvarande Approach (Bra men kan förbättras)

### Vad vi gör nu:

1. **Basic scraping** med Cheerio
   - Extraherar title, description, headings
   - Main content text
   - Links, emails, phone numbers

2. **Simple chunking**
   - Delar text i 2000-char chunks
   - Skapar embeddings med OpenAI
   - Sparar i BotKnowledge-tabellen

3. **Cosine similarity search**
   - In-memory search i JavaScript
   - Top 3 mest relevanta chunks

### Problem med detta:

❌ Saknar struktur - bara råtext  
❌ Ingen kontextuell metadata  
❌ Missar viktiga relationer  
❌ Svårt att uppdatera specifika delar  
❌ Ingen FAQ-detection  
❌ Saknar entity extraction  

---

## ✅ BÄSTA PRAXIS - Hybrid Approach

### Strategi 1: Structured Knowledge Extraction ⭐ Rekommenderat

Extrahera specifika fält istället för bara råtext:

```typescript
interface StructuredKnowledge {
  // Company info
  companyInfo: {
    name: string;
    description: string;
    industry: string;
    foundedYear?: number;
  };
  
  // Products & Services
  products: Array<{
    name: string;
    description: string;
    price?: string;
    features: string[];
    category: string;
  }>;
  
  // FAQ (viktigt!)
  faqs: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
  
  // Policies
  policies: {
    shipping?: string;
    returns?: string;
    privacy?: string;
    warranty?: string;
  };
  
  // Team & Contact
  team: Array<{
    name: string;
    role: string;
    bio?: string;
  }>;
  
  contacts: {
    email: string[];
    phone: string[];
    address?: string;
    hours?: string;
  };
  
  // Brand
  brand: {
    colors: string[];
    fonts: string[];
    tone: string;
    values: string[];
  };
}
```

### Strategi 2: Intelligent Chunking

Istället för 2000-char chunks, dela baserat på SEMANTIK:

```typescript
interface SemanticChunk {
  id: string;
  type: 'faq' | 'product' | 'policy' | 'about' | 'general';
  title: string;
  content: string;
  metadata: {
    pageUrl: string;
    section: string; // h1/h2/h3 context
    lastUpdated?: Date;
    author?: string;
    importance: number; // 1-10
  };
  embedding: number[];
  keywords: string[];
  relatedChunks: string[]; // IDs to other chunks
}
```

### Strategi 3: Question-Driven Extraction ⭐ Mest effektivt

**Skapa en standardiserad lista med frågor som systemet ALLTID försöker svara på:**

```typescript
const knowledgeQuestions = [
  // Company
  "What does the company do?",
  "Who are their target customers?",
  "What makes them unique?",
  
  // Products
  "What products/services do they offer?",
  "What are the pricing plans?",
  "What features are included?",
  
  // Support
  "What is the return policy?",
  "What is the shipping policy?",
  "How long is the warranty?",
  "What are the business hours?",
  
  // Contact
  "How can customers get in touch?",
  "Where is the company located?",
  
  // Process
  "How does onboarding work?",
  "What is the typical timeline?",
  "What are the requirements?",
  
  // Common questions
  "Is there a free trial?",
  "What payment methods are accepted?",
  "Can I cancel anytime?",
  
  // Internal (för internal bots)
  "What are the brand colors?",
  "What fonts should we use?",
  "What is our expense policy?",
  "How do I request time off?"
];
```

**Använd GPT för att:**
1. Gå igenom scraped content
2. Försök svara på VARJE fråga
3. Spara som structured Q&A

---

## 🚀 Föreslagen Ny Implementation

### 1. Enhanced Scraping med Structured Extraction

```typescript
// app/api/bots/scrape-structured/route.ts

async function extractStructuredKnowledge(url: string): Promise<StructuredKnowledge> {
  // 1. Scrape website (existing logic)
  const pages = await deepScrape(url);
  
  // 2. Extract using GPT-5 with structured output
  const extraction = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{
      role: "system",
      content: "Extract structured information from this website."
    }, {
      role: "user",
      content: `Website content:\n${pages.map(p => p.text).join('\n\n')}`
    }],
    response_format: { 
      type: "json_schema",
      json_schema: {
        name: "knowledge_extraction",
        schema: {
          type: "object",
          properties: {
            companyInfo: { ... },
            products: { ... },
            faqs: { ... },
            policies: { ... }
          }
        }
      }
    }
  });
  
  return JSON.parse(extraction.choices[0].message.content);
}
```

### 2. Question-Answer Database

```prisma
model KnowledgeQA {
  id          String   @id @default(cuid())
  botId       String
  question    String   // Standardized question
  answer      String   @db.Text
  confidence  Float    // 0-1, how confident is the answer
  sourceUrl   String?
  category    String   // "product" | "policy" | "support" etc
  embedding   Json     // For semantic search
  verified    Boolean  @default(false) // Human verified
  
  bot         Bot      @relation(fields: [botId], references: [id])
  
  @@index([botId, category])
  @@index([question])
}
```

### 3. Entity-Based Knowledge

```prisma
model KnowledgeEntity {
  id          String   @id @default(cuid())
  botId       String
  entityType  String   // "product" | "person" | "policy" | "location"
  name        String
  description String   @db.Text
  attributes  Json     // Flexible attributes per entity type
  embedding   Json
  
  bot         Bot      @relation(fields: [botId], references: [id])
  
  @@index([botId, entityType])
}
```

---

## 💡 Hybrid Strategy (Bästa av allt)

Kombinera alla approaches:

```
1. STRUCTURED EXTRACTION
   ↓
   Extract: Products, FAQs, Policies, Team
   Store in: Specific fields/tables
   
2. QUESTION-DRIVEN EXTRACTION
   ↓
   Answer 50+ standard questions
   Store in: KnowledgeQA table
   
3. SEMANTIC CHUNKING
   ↓
   Chunk remaining content semantically
   Store in: BotKnowledge (existing)
   
4. ENTITY EXTRACTION
   ↓
   Extract: People, Products, Locations
   Store in: KnowledgeEntity table
```

### När bot får en fråga:

```typescript
async function answerQuestion(question: string, botId: string) {
  // 1. Check exact Q&A matches (snabbast)
  const qaMatch = await prisma.knowledgeQA.findFirst({
    where: {
      botId,
      OR: [
        { question: { contains: question, mode: 'insensitive' } },
        { answer: { contains: question, mode: 'insensitive' } }
      ]
    }
  });
  if (qaMatch && qaMatch.confidence > 0.8) {
    return qaMatch.answer;
  }
  
  // 2. Check entities (för produktfrågor etc)
  const entities = await searchEntities(question, botId);
  if (entities.length > 0) {
    return formatEntityAnswer(entities);
  }
  
  // 3. Semantic search i chunks (fallback)
  const chunks = await semanticSearch(question, botId);
  return generateAnswer(question, chunks);
}
```

---

## 🎯 Rekommendation: Implementera i Steg

### Steg 1: Question-Driven (Snabbast, största impact)

Implementera 50 standardfrågor som systemet ALLTID försöker besvara vid scraping.

**Benefits:**
- ✅ Högre träffsäkerhet
- ✅ Konsistenta svar
- ✅ Lätt att uppdatera
- ✅ Mänsklig review möjlig

### Steg 2: FAQ Detection

Automatiskt hitta och extrahera FAQs från hemsidan.

**Benefits:**
- ✅ Exakta svar på vanliga frågor
- ✅ Ingen hallucination
- ✅ Citerbar källa

### Steg 3: Entity Extraction

Extrahera produkter, personer, policies som separata entiteter.

**Benefits:**
- ✅ Strukturerad data
- ✅ Bättre för e-commerce
- ✅ Uppdateringsbar

### Steg 4: Vector Database (För scale)

Byt till dedicated vector DB när du växer.

**Options:**
- Pinecone (managed)
- Weaviate (open source)
- pgvector (PostgreSQL extension)

---

## 🔬 Comparison

| Approach | Accuracy | Speed | Cost | Maintenance |
|----------|----------|-------|------|-------------|
| **Raw text chunks** | 60% | Fast | Low | Easy |
| **Structured extraction** | 85% | Medium | Medium | Medium |
| **Question-driven** | 90% | Fast | Medium | Easy |
| **Hybrid (alla 3)** | 95%+ | Fast | Higher | Complex |

---

## 💻 Ska jag implementera detta?

Jag kan bygga:

1. **Question-driven extraction** (2-3 timmar)
   - 50+ standardfrågor
   - Automated Q&A generation
   - Ny KnowledgeQA-tabell

2. **FAQ auto-detection** (1 timme)
   - Hitta FAQ-sektioner automatiskt
   - Extrahera Q&A pairs
   - Structur

erad lagring

3. **Entity extraction** (2-3 timmar)
   - Product/service extraction
   - People/team extraction
   - Policy extraction
   - Nya tabeller och endpoints

4. **Enhanced RAG** (4-5 timmar)
   - Semantic chunking
   - Better similarity search
   - Multi-source ranking
   - Citation system

**Vad vill du att jag fokuserar på först?**

Jag rekommenderar starkt **Question-driven extraction** - det ger störst förbättring snabbast!
