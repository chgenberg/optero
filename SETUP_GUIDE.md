# Setup Guide - MyAIGuy with RBAC

## Snabbstart

Följ dessa steg för att komma igång med systemet:

### 1. Installera dependencies

```bash
npm install
```

### 2. Sätt upp databas

Du har tre alternativ:

#### Alternativ A: Lokal PostgreSQL (Rekommenderat för utveckling)

```bash
# Installera PostgreSQL om du inte har det
brew install postgresql@14  # macOS
# eller
sudo apt-get install postgresql  # Linux

# Starta PostgreSQL
brew services start postgresql@14  # macOS
# eller
sudo service postgresql start  # Linux

# Skapa databas
createdb myaiguy

# Uppdatera DATABASE_URL i .env
# DATABASE_URL="postgresql://localhost:5432/myaiguy?schema=public"
```

#### Alternativ B: Docker (Snabbast)

```bash
# Skapa docker-compose.yml om den inte finns
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: myaiguy
      POSTGRES_PASSWORD: myaiguy
      POSTGRES_DB: myaiguy
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Starta databasen
docker-compose up -d

# DATABASE_URL är redan korrekt i .env
# DATABASE_URL="postgresql://myaiguy:myaiguy@localhost:5432/myaiguy?schema=public"
```

#### Alternativ C: Railway/Supabase (Production)

1. Skapa ett gratis PostgreSQL-konto på [Railway](https://railway.app) eller [Supabase](https://supabase.com)
2. Kopiera DATABASE_URL från din dashboard
3. Uppdatera .env med din DATABASE_URL

### 3. Uppdatera .env

Redigera `.env` och uppdatera följande:

```bash
# Din databas-URL (från steg 2)
DATABASE_URL="postgresql://..."

# Din OpenAI API-nyckel (från https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-..."

# JWT secret (generera en säker random string)
JWT_SECRET="$(openssl rand -base64 32)"
```

### 4. Kör migrations

```bash
# Skapa databas-tabeller
npx prisma migrate dev --name init

# Om du redan har migrations, kör detta istället:
npx prisma migrate deploy
```

### 5. Seed demo-data

```bash
# Skapa demo-användare och företag
npx ts-node scripts/seed-demo-company.ts
```

Detta skapar:
- **Company**: Demo Company AB (kod: DEMO2024)
- **Admin**: admin@company.com / demo123
- **User**: user@company.com / demo123  
- **Viewer**: viewer@company.com / demo123
- **Internal Bot**: En demo internal assistant

### 6. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

## Testa RBAC

### 1. Logga in som Admin
- Gå till [http://localhost:3000/internal/login](http://localhost:3000/internal/login)
- Email: `admin@company.com`
- Password: `demo123`
- Du kommer se admin-panelen med Settings-ikon

### 2. Testa Admin-panelen
- Klicka på Settings-ikonen (eller gå till `/internal/admin`)
- Se alla användare
- Ändra roller
- Bjud in nya användare

### 3. Logga in som User
- Logga ut och logga in med `user@company.com / demo123`
- Kan chatta och ladda upp filer
- Kan INTE se admin-panelen

### 4. Logga in som Viewer
- Logga ut och logga in med `viewer@company.com / demo123`
- Kan endast läsa och chatta
- Kan INTE ladda upp filer eller exportera

## Felsökning

### Problem: "Environment variable not found: DATABASE_URL"

**Lösning**: Kontrollera att `.env` finns i root-mappen:
```bash
ls -la .env
cat .env  # Verifiera innehållet
```

### Problem: "Cannot connect to database"

**Lösning**: 
1. Kontrollera att PostgreSQL körs: `psql -U postgres -l`
2. Verifiera DATABASE_URL i .env
3. Testa anslutningen: `npx prisma db pull`

### Problem: "bcryptjs not found"

**Lösning**: 
```bash
npm install bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken
```

### Problem: "Property 'company' does not exist"

**Lösning**: Regenerera Prisma Client:
```bash
npx prisma generate
```

### Problem: "Cannot find module '../lib/prisma'"

**Lösning**: Bygg projektet:
```bash
npm run build
```

## Nästa steg

Efter setup:

1. **Konfigurera OpenAI API-nyckel** i .env
2. **Skapa din första customer bot** via bot builder
3. **Bjud in team members** via admin-panelen
4. **Anpassa roller** efter behov
5. **Läs dokumentation** i `/docs/RBAC_GUIDE.md`

## Production Deployment

För produktion:

```bash
# 1. Sätt environment variables
DATABASE_URL="postgresql://..."  # Production database
JWT_SECRET="..."  # Strong random secret
OPENAI_API_KEY="sk-..."
NODE_ENV="production"

# 2. Kör migrations
npx prisma migrate deploy

# 3. Bygg projektet
npm run build

# 4. Starta
npm start
```

## Support

- RBAC Guide: `/docs/RBAC_GUIDE.md`
- Issues: Kontakta admin@company.com
- Dokumentation: Se `/docs/` mappen
