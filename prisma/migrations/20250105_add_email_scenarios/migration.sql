-- AlterTable
ALTER TABLE "SharedResult" ADD COLUMN IF NOT EXISTS "scenarios" JSONB;
ALTER TABLE "SharedResult" ADD COLUMN IF NOT EXISTS "email" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SharedResult_email_idx" ON "SharedResult"("email");
