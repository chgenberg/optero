-- Add language column to ProfessionSpecialization
ALTER TABLE "ProfessionSpecialization" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'sv';

-- Drop old unique constraint and add new one with language
ALTER TABLE "ProfessionSpecialization" DROP CONSTRAINT "ProfessionSpecialization_profession_key";
ALTER TABLE "ProfessionSpecialization" ADD CONSTRAINT "ProfessionSpecialization_profession_language_key" UNIQUE("profession", "language");

-- Add index on language
CREATE INDEX "ProfessionSpecialization_language_idx" ON "ProfessionSpecialization"("language");

-- Add language column to CommonTasks
ALTER TABLE "CommonTasks" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'sv';

-- Drop old unique constraint and add new one with language
ALTER TABLE "CommonTasks" DROP CONSTRAINT "CommonTasks_profession_specialization_key";
ALTER TABLE "CommonTasks" ADD CONSTRAINT "CommonTasks_profession_specialization_language_key" UNIQUE("profession", "specialization", "language");

-- Add index on language
CREATE INDEX "CommonTasks_language_idx" ON "CommonTasks"("language");
