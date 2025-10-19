# 🚄 Setup med Railway (Enklast - Ingen Docker behövs)

## Steg 1: Skapa gratis databas på Railway

1. Gå till https://railway.app
2. Klicka "Start a New Project"
3. Välj "Deploy PostgreSQL"
4. Vänta 30 sekunder medan databasen skapas

## Steg 2: Kopiera DATABASE_URL

1. Klicka på PostgreSQL-projektet
2. Gå till "Connect" fliken
3. Kopiera **"Postgres Connection URL"**
   - Det ser ut typ så: `postgresql://postgres:password@containers-us-west-xxx.railway.app:6543/railway`

## Steg 3: Uppdatera .env

Öppna `.env` i din editor och ersätt DATABASE_URL:

```bash
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:6543/railway"
```

Klistra in DIN URL från Railway.

## Steg 4: Kör migrations och seed

```bash
# Kör migrations
npx prisma migrate deploy

# Seed demo-data
npx ts-node scripts/seed-demo-company.ts

# Starta app
npm run dev
```

## ✅ Klart!

Öppna http://localhost:3000/internal/login

Logga in med:
- **Admin**: admin@company.com / demo123
- **User**: user@company.com / demo123
- **Viewer**: viewer@company.com / demo123

---

## Alternativ: Supabase (Också gratis)

1. Gå till https://supabase.com
2. Skapa nytt projekt
3. Settings → Database → Connection String (URI mode)
4. Kopiera URL och klistra in i .env
5. Kör migrations: `npx prisma migrate deploy`
6. Seed: `npx ts-node scripts/seed-demo-company.ts`

---

## För lokal utveckling utan Docker

Om du vill köra PostgreSQL lokalt:

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14
createdb myaiguy

# .env
DATABASE_URL="postgresql://localhost:5432/myaiguy?schema=public"

# Linux
sudo apt-get install postgresql
sudo service postgresql start
sudo -u postgres createdb myaiguy

# .env  
DATABASE_URL="postgresql://postgres:password@localhost:5432/myaiguy?schema=public"
```

---

## 💡 Tips

Railway och Supabase har båda:
- ✅ Gratis tier (perfekt för utveckling)
- ✅ Automatiska backups
- ✅ Ingen installation behövs
- ✅ Fungerar direkt
- ✅ Bra för production senare

Railway är enklast för snabb setup!
