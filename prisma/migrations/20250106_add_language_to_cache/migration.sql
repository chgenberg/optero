-- Add language column to ProfessionSpecialization (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ProfessionSpecialization' AND column_name = 'language'
  ) THEN
    ALTER TABLE "ProfessionSpecialization" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'sv';
  END IF;
END $$;

-- Drop old unique constraint (if exists) and add new one with language
DO $$ 
BEGIN
  -- Try to drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ProfessionSpecialization_profession_key' 
    AND table_name = 'ProfessionSpecialization'
  ) THEN
    ALTER TABLE "ProfessionSpecialization" DROP CONSTRAINT "ProfessionSpecialization_profession_key";
  END IF;
  
  -- Add new constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ProfessionSpecialization_profession_language_key'
    AND table_name = 'ProfessionSpecialization'
  ) THEN
    ALTER TABLE "ProfessionSpecialization" ADD CONSTRAINT "ProfessionSpecialization_profession_language_key" UNIQUE("profession", "language");
  END IF;
END $$;

-- Add index on language (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'ProfessionSpecialization_language_idx'
  ) THEN
    CREATE INDEX "ProfessionSpecialization_language_idx" ON "ProfessionSpecialization"("language");
  END IF;
END $$;

-- Add language column to CommonTasks (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'CommonTasks' AND column_name = 'language'
  ) THEN
    ALTER TABLE "CommonTasks" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'sv';
  END IF;
END $$;

-- Drop old unique constraint (if exists) and add new one with language
DO $$ 
BEGIN
  -- Try to drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'CommonTasks_profession_specialization_key'
    AND table_name = 'CommonTasks'
  ) THEN
    ALTER TABLE "CommonTasks" DROP CONSTRAINT "CommonTasks_profession_specialization_key";
  END IF;
  
  -- Add new constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'CommonTasks_profession_specialization_language_key'
    AND table_name = 'CommonTasks'
  ) THEN
    ALTER TABLE "CommonTasks" ADD CONSTRAINT "CommonTasks_profession_specialization_language_key" UNIQUE("profession", "specialization", "language");
  END IF;
END $$;

-- Add index on language (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'CommonTasks_language_idx'
  ) THEN
    CREATE INDEX "CommonTasks_language_idx" ON "CommonTasks"("language");
  END IF;
END $$;
