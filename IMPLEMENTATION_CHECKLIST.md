# MENDIO Bot Builder - Implementation Checklist

## 📋 Status Overview
Vi har en solid grundstruktur, men behöver fylla på några GAPs för att göra allt funktionellt.

---

## 🔴 KRITISKA FÖRBÄTTRINGAR BEHÖVS

### API & Backend

#### 1. **GET `/api/bots/[botId]/integrations`** ⚠️
**Status**: SAKNAS
**Behövs för**: Bot detail view ska ladda integration status
```typescript
// Ska hämta:
- Alla integrations för användaren
- Vilka som är kopplade till denna bot
- Koppling status (connected/not connected)
```

#### 2. **POST `/api/bots/[botId]/integrations/connect`** ⚠️
**Status**: SAKNAS
**Behövs för**: När användare drar integration till bot
```typescript
// Ska:
- Skapa BotIntegrationConnection i dB
- Spara bot-specifik konfiguration
- Uppdatera edges/connections i UI
```

#### 3. **DELETE `/api/bots/[botId]/integrations/[integrationId]`** ⚠️
**Status**: SAKNAS
**Behövs för**: Koppla loss integration från bot
```typescript
// Ska:
- Ta bort BotIntegrationConnection
- Uppdatera UI-state
```

#### 4. **GET `/api/bots/[botId]/knowledge`** ⚠️
**Status**: SAKNAS
**Behövs för**: Visa uploadade dokument i Knowledge tab
```typescript
// Ska hämta:
- Alla BotKnowledge records för botten
- Filnamn, typ, datum, storlek
```

#### 5. **POST `/api/bots/[botId]/knowledge/upload`** ⚠️
**Status**: DELVIS - `/api/business/upload-documents` existerar
**Behövs för**: Ladda upp dokument från settings panel
```typescript
// Uppdatering behövs:
- Koppla direkt till botId (inte bara company)
- Spara i BotKnowledge tabell
- Returnera success/error
```

### Database Improvements

#### 1. **BotKnowledge - lägg till fileType** ⚠️
**Status**: Delvis - fileName finns men filetype behövs
```prisma
// Lägg till:
fileType String?  // pdf, docx, xlsx, pptx, etc
fileSize Int?     // bytes
```

---

## 🟡 FRONTEND ISSUES

#### 1. **Bot Detail View - Data laddar inte** ⚠️
```
- Anropa /api/bots/[botId] för bot-data ✓
- Anropa /api/bots/[botId]/integrations ✗
- Rita nodes på canvas ✓
- Visa live connections ✗
```

#### 2. **Integration Connect Drag-and-Drop** ⚠️
```
- onConnect callback ✓
- POST till /api/bots/[botId]/integrations/connect ✗
- Uppdatera UI-state ✗
```

#### 3. **Knowledge Tab** ⚠️
```
- Hämta /api/bots/[botId]/knowledge ✗
- Visa dokument ✗
- Upload funka ✗
```

---

## ✅ VAD SOM REDAN FUNGERAR

- ✅ Dashboard & bot listing
- ✅ Chat interface
- ✅ Magic link login
- ✅ Bot deletion
- ✅ File upload backend
- ✅ Navigation
- ✅ Error handling

---

## 🚀 QUICK IMPLEMENTATION PLAN

1. **API endpoints** (1 hour)
2. **Frontend integration** (1.5 hours)
3. **Testing** (1 hour)
**Total: 3-4 hours**
