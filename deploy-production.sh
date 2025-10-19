#!/bin/bash

# Production Deployment Script
# This automates the critical pre-launch steps

set -e

echo "🚀 MyAIGuy Production Deployment"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're ready
echo -e "${YELLOW}📋 Pre-flight checks...${NC}"

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi
echo -e "${GREEN}✅ Vercel CLI installed${NC}"

# Check for required env vars
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Create .env with DATABASE_URL, JWT_SECRET, and OPENAI_API_KEY"
    exit 1
fi
echo -e "${GREEN}✅ .env file exists${NC}"

# Generate new JWT secret for production
echo ""
echo -e "${YELLOW}🔐 Generating production secrets...${NC}"
NEW_JWT_SECRET=$(openssl rand -base64 64)
echo -e "${GREEN}✅ New JWT_SECRET generated${NC}"
echo "   Save this: ${NEW_JWT_SECRET:0:40}..."
echo ""

# Check database connection
echo -e "${YELLOW}🗄️  Testing database connection...${NC}"
if npx prisma db pull --force > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connected${NC}"
else
    echo -e "${RED}❌ Cannot connect to database${NC}"
    echo "Check your DATABASE_URL in .env"
    exit 1
fi

# Run type check
echo ""
echo -e "${YELLOW}🔍 Type checking...${NC}"
if npm run type-check > /dev/null 2>&1 || npx tsc --noEmit; then
    echo -e "${GREEN}✅ No type errors${NC}"
else
    echo -e "${RED}❌ Type errors found${NC}"
    echo "Fix TypeScript errors before deploying"
    exit 1
fi

# Build test
echo ""
echo -e "${YELLOW}🏗️  Testing production build...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Fix build errors before deploying"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All pre-flight checks passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Prompt for confirmation
read -p "🚀 Ready to deploy to production? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}📦 Deploying to Vercel...${NC}"
vercel --prod

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 IMPORTANT: Set these in Vercel dashboard:"
echo ""
echo "1. JWT_SECRET (Environment Variables):"
echo "   ${NEW_JWT_SECRET:0:40}..."
echo ""
echo "2. DATABASE_URL (should already be set)"
echo ""
echo "3. OPENAI_API_KEY (production key)"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "   - Enable automated backups in Railway"
echo "   - Set up Sentry error tracking"
echo "   - Configure uptime monitoring"
echo "   - Test all critical flows"
echo ""
echo "📚 See PRODUCTION_CHECKLIST.md for full guide"
echo ""
