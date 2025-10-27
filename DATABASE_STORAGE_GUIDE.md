# 💾 MENDIO Database Storage Guide

## ✅ Ja! All information sparas i databasen

### 📊 Databas Schema

```
User
  ├─ id: cuid
  ├─ email: string @unique
  ├─ name: string?
  ├─ password: string?
  └─ Relation: Bot[] ← owns bots

Bot
  ├─ id: cuid
  ├─ userId: string (FK → User)
  ├─ name: string
  ├─ companyUrl: string?
  ├─ type: string (knowledge|lead|support|workflow)
  ├─ spec: Json (configuration)
  ├─ isActive: boolean
  ├─ createdAt: DateTime
  ├─ updatedAt: DateTime
  └─ Relations:
      ├─ BotKnowledge[] ← documents
      ├─ BotIntegrationConnection[] ← connections
      └─ BotSession[] ← chat history

Integration
  ├─ id: cuid
  ├─ userId: string (FK → User)
  ├─ type: string (webhook|email|slack|etc)
  ├─ name: string
  ├─ settings: Json
  ├─ isActive: boolean
  └─ Relation: BotIntegrationConnection[]

BotIntegrationConnection (Many-to-Many)
  ├─ id: cuid
  ├─ botId: string (FK → Bot)
  ├─ integrationId: string (FK → Integration)
  ├─ config: Json? (bot-specific configuration)
  ├─ createdAt: DateTime
  └─ @unique([botId, integrationId])

BotKnowledge (RAG Documents)
  ├─ id: cuid
  ├─ botId: string (FK → Bot)
  ├─ title: string
  ├─ content: Text
  ├─ sourceUrl: string?
  ├─ embedding: Json? (vector embeddings for semantic search)
  ├─ metadata: Json
  │   ├─ fileSize: int?
  │   ├─ fileType: string? (pdf|docx|xlsx|csv|etc)
  │   ├─ mimeType: string?
  │   └─ uploadedAt: DateTime?
  ├─ createdAt: DateTime
  ├─ updatedAt: DateTime
  └─ @index([botId])

BotSession (Chat History)
  ├─ id: cuid
  ├─ botId: string (FK → Bot)
  ├─ userId: string? (if logged in)
  ├─ ip: string?
  ├─ userAgent: string?
  ├─ messages: Json (array of {role, content, timestamp})
  ├─ metadata: Json
  └─ createdAt: DateTime
```

---

## 🔄 Data Flow - Vad sparas när

### 1️⃣ Integration Connection
**Vad händer**: Du drar en integration till bot-noden

**Request**:
```http
POST /api/bots/[botId]/integrations/connect
{
  "integrationId": "int_123"
}
```

**Vad sparas i DB**:
```sql
-- BotIntegrationConnection tabell
INSERT INTO "BotIntegrationConnection" 
(id, botId, integrationId, config, createdAt)
VALUES
('conn_abc', 'bot_123', 'int_123', '{}', now());
```

**Tabeller som uppdateras**: 
- ✅ `BotIntegrationConnection` - Ny post med connection info
- ✅ Kan hämtas senare med `GET /api/bots/[botId]/integrations`

---

### 2️⃣ Knowledge Document Upload
**Vad händer**: Du laddar upp en fil (PDF, Excel, Word, etc)

**Request**:
```http
POST /api/bots/[botId]/knowledge/upload
FormData: { files: [file1.pdf, file2.xlsx] }
```

**Vad sparas i DB**:

För varje fil:
```sql
INSERT INTO "BotKnowledge"
(id, botId, title, content, sourceUrl, metadata, createdAt, updatedAt)
VALUES
(
  'know_xyz',
  'bot_123',
  'file.pdf',
  'EXTRACTED_TEXT_CONTENT...',
  NULL,
  {
    "fileSize": 102400,
    "fileType": "pdf",
    "mimeType": "application/pdf",
    "uploadedAt": "2025-10-27T10:30:00Z"
  },
  now(),
  now()
);
```

**Tabeller som uppdateras**:
- ✅ `BotKnowledge` - Ny post per dokument
- ✅ Content extraheras automatiskt (text från PDF, Excel cells, Word, etc)
- ✅ Metadata sparas med filtyp

---

### 3️⃣ Chat Messages (Session)
**Vad händer**: Användare chattchatar med bot

**Vad sparas i DB**:

```sql
INSERT INTO "BotSession"
(id, botId, userId, ip, userAgent, messages, metadata, createdAt, updatedAt)
VALUES
(
  'sess_123',
  'bot_123',
  'user_456',
  '192.168.1.1',
  'Mozilla/5.0...',
  [
    {
      "role": "user",
      "content": "Vad är en bot?",
      "timestamp": 1730000000000
    },
    {
      "role": "assistant",
      "content": "En bot är en AI...",
      "timestamp": 1730000005000
    }
  ],
  {},
  now(),
  now()
);
```

**Tabeller som uppdateras**:
- ✅ `BotSession` - Ny post per session
- ✅ Alla messages sparas i JSON array
- ✅ Timestamps för varje meddelande

---

## 📝 Exempell - Fullständig Bot Lifecycle

### Scenario: User skapar bot och laddar upp dokument

```
1. Användare skapar bot via /bot/create
   └─ Bot tabell: ny post
   └─ BotSource tabell: website + document sources
   └─ BotKnowledge: initial knowledge från formulär

2. Klickar på boten från dashboard
   └─ Navigerar till /bots/[botId]
   └─ Frontend anropar:
      GET /api/bots/[botId] ✓ sparas redan
      GET /api/bots/[botId]/integrations ✓ hämtar connections

3. Drar Webhook integration till bot
   └─ POST /api/bots/[botId]/integrations/connect
   └─ BotIntegrationConnection: ny post
   └─ Edges visas på canvas

4. Laddar upp PDF i Knowledge tab
   └─ POST /api/bots/[botId]/knowledge/upload
   └─ BotKnowledge: ny post med:
      - title: "documento.pdf"
      - content: "EXTRACTED TEXT..."
      - metadata: {fileType: "pdf", fileSize: 102400}

5. Chatter med bot
   └─ POST /api/bots/chat
   └─ BotSession: sparar messages array
   └─ Alla messages persistent i DB

6. Användaren går tillbaka till dashboard
   └─ GET /dashboard
   └─ Visar boten med stats:
      - Antal chats: COUNT(BotSession WHERE botId = ?)
      - Dokument: COUNT(BotKnowledge WHERE botId = ?)
      - Integrationer: COUNT(BotIntegrationConnection WHERE botId = ?)
```

---

## 🔍 Query Examples - Så hämtar vi data

### Hämta alla integrations för en bot
```sql
SELECT i.* 
FROM "Integration" i
JOIN "BotIntegrationConnection" bic ON i.id = bic.integrationId
WHERE bic.botId = 'bot_123';
```

### Hämta alla dokument
```sql
SELECT * FROM "BotKnowledge"
WHERE botId = 'bot_123'
ORDER BY createdAt DESC;
```

### Hämta chat history
```sql
SELECT messages FROM "BotSession"
WHERE botId = 'bot_123'
ORDER BY createdAt DESC
LIMIT 10;
```

### Beräkna statistik
```sql
SELECT 
  COUNT(*) as total_chats,
  COUNT(DISTINCT "userId") as unique_users,
  COUNT(DISTINCT "BotIntegrationConnection".id) as connected_integrations
FROM "BotSession" bs
LEFT JOIN "BotIntegrationConnection" ON bs.botId = "BotIntegrationConnection".botId
WHERE bs.botId = 'bot_123';
```

---

## 💾 Storage Summary

| Data Type | Tabell | Lagring | Persistence |
|-----------|--------|---------|-------------|
| **Integrations** | `BotIntegrationConnection` | ✅ DB | ✅ Permanent |
| **Connections** | `BotIntegrationConnection` | ✅ DB | ✅ Permanent |
| **Knowledge** | `BotKnowledge` | ✅ DB | ✅ Permanent |
| **Files** | `BotKnowledge.content` | ✅ DB (Text) | ✅ Permanent |
| **Chat Messages** | `BotSession.messages` | ✅ DB (JSON) | ✅ Permanent |
| **Embeddings** | `BotKnowledge.embedding` | ✅ DB (JSON array) | ✅ Permanent |
| **Metadata** | `BotKnowledge.metadata` | ✅ DB (JSON) | ✅ Permanent |

---

## 🔐 Data Security

✅ Alla data sparas i PostgreSQL
✅ User ownership verification på alla endpoints
✅ Cascade delete när bot raderas
✅ Sensitive data (tokens) encrypted when stored
✅ Backups included in Railway database

---

## 📈 Performance

- 🚀 Indexes på `botId` för snabba queries
- 🚀 JSONB för flexible metadata
- 🚀 Text field för large content (docs, chat history)
- 🚀 Composite unique constraint på BotIntegrationConnection

---

## ✨ Slutsats

**JA! All information sparas persistent i databasen:**
- ✅ Bot-konfiguration
- ✅ Integrationer och connections
- ✅ Dokument content (extraherad text)
- ✅ Chat-historik
- ✅ Embeddings för semantic search
- ✅ Alla metadata

**Ingenting är ephemeral/temp!** Allt är persistent och kan hämtas senare. 🎉
