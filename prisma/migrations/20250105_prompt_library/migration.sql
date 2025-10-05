-- CreateTable
CREATE TABLE IF NOT EXISTS "PromptLibrary" (
    "id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "timeSaved" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "example" TEXT,
    "howToUse" TEXT,
    "tools" JSONB NOT NULL,
    "tags" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PromptLibrary_profession_specialization_idx" ON "PromptLibrary"("profession", "specialization");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PromptLibrary_category_idx" ON "PromptLibrary"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PromptLibrary_usageCount_idx" ON "PromptLibrary"("usageCount");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PromptLibrary_profession_category_idx" ON "PromptLibrary"("profession", "category");
