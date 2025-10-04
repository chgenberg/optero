-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT,
    "experience" TEXT,
    "selectedTasks" JSONB DEFAULT '[]',
    "challenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "viewedTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "copiedPrompts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timeSpent" INTEGER,
    "completedSteps" INTEGER NOT NULL DEFAULT 1,
    "clickedPremium" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecializationCache" (
    "id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specializations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecializationCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "tasks" JSONB NOT NULL,
    "experience" TEXT,
    "challenges" TEXT[],
    "recommendations" JSONB NOT NULL,
    "scenarios" JSONB DEFAULT '[]',
    "inferredTasks" JSONB DEFAULT '[]',
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedResult" (
    "id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT,
    "tasks" JSONB,
    "recommendations" JSONB NOT NULL,
    "scenarios" JSONB,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "profession" TEXT,
    "department" TEXT,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSession_profession_idx" ON "UserSession"("profession");

-- CreateIndex
CREATE INDEX "UserSession_createdAt_idx" ON "UserSession"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpecializationCache_profession_key" ON "SpecializationCache"("profession");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationCache_cacheKey_key" ON "RecommendationCache"("cacheKey");

-- CreateIndex
CREATE INDEX "RecommendationCache_profession_specialization_idx" ON "RecommendationCache"("profession", "specialization");

-- CreateIndex
CREATE INDEX "RecommendationCache_lastUsed_idx" ON "RecommendationCache"("lastUsed");

-- CreateIndex
CREATE INDEX "SharedResult_createdAt_idx" ON "SharedResult"("createdAt");

-- CreateIndex
CREATE INDEX "ChatHistory_userType_idx" ON "ChatHistory"("userType");

-- CreateIndex
CREATE INDEX "ChatHistory_sessionId_idx" ON "ChatHistory"("sessionId");

-- CreateIndex
CREATE INDEX "ChatHistory_createdAt_idx" ON "ChatHistory"("createdAt");
