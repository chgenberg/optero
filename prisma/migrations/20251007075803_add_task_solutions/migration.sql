-- CreateTable
CREATE TABLE IF NOT EXISTS "TaskSolution" (
    "id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'sv',
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "usedInAnalyses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskSolution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TaskSolution_profession_specialization_task_language_key" ON "TaskSolution"("profession", "specialization", "task", "language");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TaskSolution_profession_specialization_idx" ON "TaskSolution"("profession", "specialization");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TaskSolution_hitCount_idx" ON "TaskSolution"("hitCount");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TaskSolution_language_idx" ON "TaskSolution"("language");
