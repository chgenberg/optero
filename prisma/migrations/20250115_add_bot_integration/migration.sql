-- CreateTable
CREATE TABLE "BotIntegration" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "zendeskDomain" TEXT,
    "zendeskEmail" TEXT,
    "zendeskApiTokenEnc" TEXT,
    "hubspotTokenEnc" TEXT,
    "shopifyDomain" TEXT,
    "shopifyAccessTokenEnc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotIntegration_botId_key" ON "BotIntegration"("botId");

-- AddForeignKey
ALTER TABLE "BotIntegration" ADD CONSTRAINT "BotIntegration_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
