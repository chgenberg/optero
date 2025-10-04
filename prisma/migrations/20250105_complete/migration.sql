-- Drop existing tables if they exist (to recreate with correct schema)
DROP TABLE IF EXISTS "UserSession" CASCADE;
DROP TABLE IF EXISTS "RecommendationCache" CASCADE;
DROP TABLE IF EXISTS "SpecializationCache" CASCADE;
DROP TABLE IF EXISTS "SharedResult" CASCADE;
DROP TABLE IF EXISTS "ChatHistory" CASCADE;

-- CreateTable
CREATE TABLE "ProfessionSpecialization" (
    "id" SERIAL NOT NULL,
    "profession" TEXT NOT NULL,
    "specializations" JSONB NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionSpecialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommonTasks" (
    "id" SERIAL NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "tasks" JSONB NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommonTasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationCache" (
    "id" SERIAL NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "tasks" JSONB NOT NULL,
    "experience" TEXT,
    "challenges" JSONB,
    "recommendations" JSONB NOT NULL,
    "scenarios" JSONB NOT NULL,
    "inferredTasks" JSONB,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT,
    "experience" TEXT,
    "selectedTasks" JSONB,
    "challenges" JSONB,
    "viewedTools" JSONB,
    "copiedPrompts" JSONB,
    "timeSpent" INTEGER,
    "completedSteps" INTEGER NOT NULL DEFAULT 0,
    "clickedPremium" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT,
    "profession" TEXT NOT NULL,
    "specialization" TEXT,
    "recommendationName" TEXT,
    "rating" INTEGER,
    "helpful" BOOLEAN,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopularCombinations" (
    "id" SERIAL NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "taskCombination" JSONB NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PopularCombinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedResult" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT,
    "tasks" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

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
CREATE UNIQUE INDEX "ProfessionSpecialization_profession_key" ON "ProfessionSpecialization"("profession");

-- CreateIndex
CREATE INDEX "ProfessionSpecialization_profession_idx" ON "ProfessionSpecialization"("profession");

-- CreateIndex
CREATE INDEX "CommonTasks_profession_idx" ON "CommonTasks"("profession");

-- CreateIndex
CREATE INDEX "CommonTasks_specialization_idx" ON "CommonTasks"("specialization");

-- CreateIndex
CREATE UNIQUE INDEX "CommonTasks_profession_specialization_key" ON "CommonTasks"("profession", "specialization");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationCache_cacheKey_key" ON "RecommendationCache"("cacheKey");

-- CreateIndex
CREATE INDEX "RecommendationCache_profession_specialization_idx" ON "RecommendationCache"("profession", "specialization");

-- CreateIndex
CREATE INDEX "RecommendationCache_lastUsed_idx" ON "RecommendationCache"("lastUsed");

-- CreateIndex
CREATE INDEX "RecommendationCache_hitCount_idx" ON "RecommendationCache"("hitCount");

-- CreateIndex
CREATE INDEX "UserSession_profession_idx" ON "UserSession"("profession");

-- CreateIndex
CREATE INDEX "UserSession_createdAt_idx" ON "UserSession"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_profession_idx" ON "Feedback"("profession");

-- CreateIndex
CREATE INDEX "Feedback_recommendationName_idx" ON "Feedback"("recommendationName");

-- CreateIndex
CREATE INDEX "Feedback_rating_idx" ON "Feedback"("rating");

-- CreateIndex
CREATE INDEX "PopularCombinations_frequency_idx" ON "PopularCombinations"("frequency");

-- CreateIndex
CREATE UNIQUE INDEX "PopularCombinations_profession_specialization_key" ON "PopularCombinations"("profession", "specialization");

-- CreateIndex
CREATE UNIQUE INDEX "SharedResult_shareId_key" ON "SharedResult"("shareId");

-- CreateIndex
CREATE INDEX "ChatHistory_userType_idx" ON "ChatHistory"("userType");

-- CreateIndex
CREATE INDEX "ChatHistory_sessionId_idx" ON "ChatHistory"("sessionId");

-- CreateIndex
CREATE INDEX "ChatHistory_createdAt_idx" ON "ChatHistory"("createdAt");
