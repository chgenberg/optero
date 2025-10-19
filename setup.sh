#!/bin/bash

# MyAIGuy Setup Script
# This script sets up the database and demo data for development

set -e

echo "🚀 MyAIGuy Setup Script"
echo "======================="
echo ""

# Check if Docker is running
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "✅ Docker is running"
    
    # Start PostgreSQL
    echo "📦 Starting PostgreSQL with Docker..."
    docker-compose up -d
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 5
    
    # Update .env with correct DATABASE_URL
    if [ -f .env ]; then
        sed -i '' 's|DATABASE_URL="postgresql://user:password@localhost:5432/myaiguy?schema=public"|DATABASE_URL="postgresql://myaiguy:myaiguy@localhost:5432/myaiguy?schema=public"|' .env
        echo "✅ DATABASE_URL updated"
    fi
else
    echo "⚠️  Docker not found or not running"
    echo "Please install Docker or use local PostgreSQL"
    echo "See QUICK_START.md for alternatives"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init 2>/dev/null || npx prisma migrate deploy

# Seed demo data
echo ""
echo "🌱 Seeding demo data..."
npx ts-node scripts/seed-demo-company.ts

echo ""
echo "✅ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Demo Accounts:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👑 Admin:  admin@company.com   / demo123"
echo "👤 User:   user@company.com    / demo123"
echo "👁️  Viewer: viewer@company.com / demo123"
echo ""
echo "🏢 Company Code: DEMO2024"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next steps:"
echo "   1. Start dev server: npm run dev"
echo "   2. Open: http://localhost:3000/internal/login"
echo "   3. Login with any account above"
echo "   4. Admins: Visit /internal/admin for user management"
echo ""
echo "📚 Documentation:"
echo "   - QUICK_START.md - Quick setup guide"
echo "   - SETUP_GUIDE.md - Detailed setup"
echo "   - docs/RBAC_GUIDE.md - RBAC documentation"
echo ""
