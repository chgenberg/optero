-- CreateTable BotKnowledge (utan vector för nu)
CREATE TABLE IF NOT EXISTS "BotKnowledge" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable BotSession
CREATE TABLE IF NOT EXISTS "BotSession" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "messages" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BotKnowledge_botId_idx" ON "BotKnowledge"("botId");
CREATE INDEX IF NOT EXISTS "BotKnowledge_sourceUrl_idx" ON "BotKnowledge"("sourceUrl");
CREATE INDEX IF NOT EXISTS "BotSession_botId_idx" ON "BotSession"("botId");
CREATE INDEX IF NOT EXISTS "BotSession_userId_idx" ON "BotSession"("userId");
CREATE INDEX IF NOT EXISTS "BotSession_createdAt_idx" ON "BotSession"("createdAt");

-- AddForeignKey (without IF NOT EXISTS syntax)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BotKnowledge_botId_fkey'
    ) THEN
        ALTER TABLE "BotKnowledge" ADD CONSTRAINT "BotKnowledge_botId_fkey" 
        FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BotSession_botId_fkey'
    ) THEN
        ALTER TABLE "BotSession" ADD CONSTRAINT "BotSession_botId_fkey" 
        FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
