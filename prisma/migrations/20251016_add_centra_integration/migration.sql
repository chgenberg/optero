-- Add Centra integration columns to BotIntegration

ALTER TABLE "BotIntegration"
  ADD COLUMN IF NOT EXISTS "centraApiBaseUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "centraStoreId" TEXT,
  ADD COLUMN IF NOT EXISTS "centraAccessTokenEnc" TEXT;


