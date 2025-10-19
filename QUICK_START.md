# 🚀 Quick Start - 5 minuter till RBAC

## Välj din setup-metod

### 🐳 Alternativ 1: Docker (ENKLAST - Rekommenderat)

```bash
# 1. Starta databasen
docker-compose up -d

# 2. Uppdatera .env
# Ändra denna rad:
# DATABASE_URL="postgresql://user:password@localhost:5432/myaiguy?schema=public"
# Till:
DATABASE_URL="postgresql://myaiguy:myaiguy@localhost:5432/myaiguy?schema=public"

# 3. Kör migrations
npx prisma migrate dev --name init

# 4. Seed demo-data
npx ts-node scripts/seed-demo-company.ts

# 5. Starta appen
npm run dev
```

✅ **Klart!** Gå till http://localhost:3000/internal/login

---

### 💻 Alternativ 2: Lokal PostgreSQL

```bash
# 1. Installera PostgreSQL
brew install postgresql@14  # macOS
# eller
sudo apt-get install postgresql  # Linux

# 2. Starta PostgreSQL
brew services start postgresql@14

# 3. Skapa databas
createdb myaiguy

# 4. Uppdatera .env
DATABASE_URL="postgresql://localhost:5432/myaiguy?schema=public"

# 5. Kör migrations
npx prisma migrate dev --name init

# 6. Seed demo-data
npx ts-node scripts/seed-demo-company.ts

# 7. Starta appen
npm run dev
```

---

### ☁️ Alternativ 3: Cloud Database (Production-ready)

#### Railway.app (Gratis tier)
1. Gå till https://railway.app
2. Skapa nytt projekt → PostgreSQL
3. Kopiera DATABASE_URL från dashboard
4. Klistra in i `.env`
5. Kör migrations: `npx prisma migrate deploy`
6. Seed data: `npx ts-node scripts/seed-demo-company.ts`

#### Supabase (Gratis tier)
1. Gå till https://supabase.com
2. Skapa nytt projekt
3. Gå till Settings → Database → Connection string
4. Kopiera "URI" och klistra in i `.env`
5. Kör migrations: `npx prisma migrate deploy`
6. Seed data: `npx ts-node scripts/seed-demo-company.ts`

---

## Demo Accounts

Efter seeding har du dessa konton:

| Roll | Email | Password | Behörigheter |
|------|-------|----------|--------------|
| 👑 **Admin** | admin@company.com | demo123 | Full access |
| 👤 **User** | user@company.com | demo123 | Standard access |
| 👁️ **Viewer** | viewer@company.com | demo123 | Read-only |

**Company Code**: `DEMO2024`

---

## Verifiera att allt fungerar

```bash
# 1. Testa databas-anslutning
npx prisma db pull

# 2. Kontrollera tabeller
npx prisma studio  # Öppnar grafiskt gränssnitt

# 3. Starta dev-server
npm run dev

# 4. Öppna browser
open http://localhost:3000/internal/login
```

---

## Om något går fel

### Error: "DATABASE_URL not found"
```bash
# Kontrollera att .env finns
ls -la .env

# Om den saknas:
cp .env.example .env
# Eller skapa manuellt
```

### Error: "Cannot connect to database"
```bash
# För Docker:
docker-compose ps  # Kontrollera att postgres körs
docker-compose logs postgres  # Se loggar

# För lokal PostgreSQL:
psql -U postgres -l  # Lista databaser
```

### Error: "Property does not exist on Prisma Client"
```bash
# Regenerera Prisma Client
npx prisma generate
```

---

## Nästa steg

✅ Logga in som Admin: http://localhost:3000/internal/login  
✅ Testa admin-panelen: http://localhost:3000/internal/admin  
✅ Skapa din första customer bot  
✅ Läs RBAC-guiden: `docs/RBAC_GUIDE.md`  
✅ Läs full setup: `SETUP_GUIDE.md`  

---

## Tips

💡 **För utveckling**: Använd Docker (enklast)  
💡 **För production**: Använd Railway eller Supabase  
💡 **OpenAI API-nyckel**: Lägg till i `.env` för att bots ska fungera  
💡 **JWT Secret**: Generera säker key: `openssl rand -base64 32`  

---

## Support

📖 **Dokumentation**: Se `/docs/` mappen  
🐛 **Problem?**: Kolla `SETUP_GUIDE.md` för felsökning  
🎓 **RBAC Guide**: Se `docs/RBAC_GUIDE.md`
