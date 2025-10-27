# 🎯 Vad Behövs För Att Allt Ska Fungera

## 📊 SNABB OVERVIEW

Din bot-builder har en **solid grund** men behöver **5 API endpoints** och **liten frontend fix** för att fungera fullständigt.

---

## 🔧 MÅSTE-GÖR (5 API endpoints)

### 1️⃣ GET `/api/bots/[botId]/integrations`
**Vad det gör**: Laddar alla integrationer för botten
```
Request: GET /api/bots/abc123/integrations
Response: {
  integrations: [
    {
      id: "int1",
      type: "webhook",
      name: "Webhook",
      isConnected: true
    },
    {
      id: "int2", 
      type: "email",
      name: "Email",
      isConnected: false
    }
  ]
}
```
**Varför**: Bot detail canvas behöver veta vilka integrations att visa

---

### 2️⃣ POST `/api/bots/[botId]/integrations/connect`
**Vad det gör**: Kopplar en integration till en bot
```
Request: POST /api/bots/abc123/integrations/connect
Body: {
  integrationId: "int1"
}
Response: {
  success: true,
  connectionId: "conn123"
}
```
**Varför**: När användare drar en integration till bot-noden

---

### 3️⃣ DELETE `/api/bots/[botId]/integrations/[integrationId]`
**Vad det gör**: Kopplar loss en integration från bot
```
Request: DELETE /api/bots/abc123/integrations/int1
Response: { success: true }
```
**Varför**: Användare vill ta bort en koppling

---

### 4️⃣ GET `/api/bots/[botId]/knowledge`
**Vad det gör**: Laddar alla dokument som botten lärt sig från
```
Request: GET /api/bots/abc123/knowledge
Response: {
  documents: [
    {
      id: "doc1",
      title: "Manual.pdf",
      fileType: "pdf",
      createdAt: "2025-10-27",
      size: 2048
    }
  ]
}
```
**Varför**: Knowledge tab behöver visa vilka dokument som uppladats

---

### 5️⃣ POST `/api/bots/[botId]/knowledge/upload`
**Vad det gör**: Laddar upp nya dokument till botten
```
Request: POST /api/bots/abc123/knowledge/upload
Body: FormData with file
Response: {
  success: true,
  documentId: "doc2"
}
```
**Varför**: Användare ska kunna ladda upp från settings-panelen

---

## 🎨 FRONTEND FIXES (3 ändringar)

### 1. Bot Detail - Ladda integrations
```typescript
// I /app/bots/[botId]/page.tsx, i loadBotData():
const res = await fetch(`/api/bots/${botId}/integrations`);
const { integrations } = await res.json();
// Sedan visar du dessa på canvas
```

### 2. Drag-drop - Spara connection
```typescript
// I onConnect callback:
const res = await fetch(`/api/bots/${botId}/integrations/connect`, {
  method: 'POST',
  body: JSON.stringify({ integrationId: newIntegrationId })
});
```

### 3. Knowledge Tab - Visa dokument
```typescript
// I Settings panel, Knowledge tab:
const res = await fetch(`/api/bots/${botId}/knowledge`);
const { documents } = await res.json();
// Visa lista av dokument
```

---

## 📁 FILE CHANGES SUMMARY

### New Files (2)
- ✅ `/app/api/bots/[botId]/integrations/route.ts` - GET
- ✅ `/app/api/bots/[botId]/integrations/connect/route.ts` - POST
- ✅ `/app/api/bots/[botId]/integrations/[integrationId]/route.ts` - DELETE
- ✅ `/app/api/bots/[botId]/knowledge/route.ts` - GET
- ✅ `/app/api/bots/[botId]/knowledge/upload/route.ts` - POST

### Modified Files (1)
- 📝 `/app/bots/[botId]/page.tsx` - Lägg till data-loading

### Database (1 migration)
- 📝 `/prisma/migrations/[new]/add_filetype_to_knowledge.sql`

---

## ✅ SUMMARY - DETAILED

| Område | Status | Vad som fungerar | Vad som saknas |
|--------|--------|-----------------|-----------------|
| **Dashboard** | ✅ 100% | Lista bots, stats, delete | - |
| **Bot Detail** | 🟡 50% | Canvas, UI layout, chat | Integrations, knowledge |
| **Chat** | ✅ 100% | Messages, history, feedback | - |
| **Integrations** | 🔴 0% | UI design | Backend, connectivity |
| **Knowledge** | 🟡 50% | File upload, UI | Display, fetching |
| **Auth** | ✅ 100% | Magic link, demo account | - |

---

## 💻 IMPLEMENTATION STEPS

### Step 1: Create API Endpoints (20-30 min)
```bash
# Create these 5 files:
app/api/bots/[botId]/integrations/route.ts
app/api/bots/[botId]/integrations/connect/route.ts  
app/api/bots/[botId]/integrations/[integrationId]/route.ts
app/api/bots/[botId]/knowledge/route.ts
app/api/bots/[botId]/knowledge/upload/route.ts
```

### Step 2: Update Frontend (20-30 min)
```bash
# Modify these files:
app/bots/[botId]/page.tsx - Add data loading & connections
```

### Step 3: Database Migration (5 min)
```bash
# Add fileType field to BotKnowledge
npx prisma migrate dev --name add_filetype_to_botknowledge
```

### Step 4: Test Everything (15-20 min)
- Dashboard → Click bot → See integrations loaded
- Drag integration to bot → Connection saved
- Upload document → Appears in Knowledge tab
- Go back to dashboard → Still works

---

## 🎁 BONUS FEATURES (Optional)

These would make it even better but not required:

1. **Loading skeletons** - Show spinners while loading
2. **Error messages** - Better error handling
3. **Confirmation dialogs** - Before deleting connections
4. **Real-time updates** - WebSocket for live sync
5. **Bot cloning** - Duplicate a bot
6. **Version history** - Undo/redo
7. **Analytics** - Track bot usage
8. **Bulk operations** - Delete multiple files

---

## 🚀 TOTAL TIME ESTIMATE

- API endpoints: **1 hour**
- Frontend changes: **30 minutes**
- Database: **5 minutes**
- Testing: **30 minutes**

**TOTAL: ~2 hours for 100% functionality** ⚡

---

## ❓ QUESTIONS BEFORE STARTING

1. **Do you want me to implement all 5 API endpoints now?**
2. **Should integrations auto-sync or need manual config?**
3. **Any specific error messages you want?**
4. **Should there be a "save" button or auto-save?**

