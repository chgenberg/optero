// Resolve prisma with relative path for Node execution
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prisma = require("../lib/prisma").default;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  // Optional guard: require CLEAR_BOTS=1
  if (process.env.CLEAR_BOTS !== "1") {
    throw new Error("Refusing to clear bots: set CLEAR_BOTS=1 to proceed");
  }

  console.log("Clearing all bots and related data…");

  // Delete in safe order (children -> parent)
  await prisma.botKnowledge.deleteMany({});
  await prisma.botSession.deleteMany({});
  await prisma.botUsage.deleteMany({});
  await prisma.approvalRequest.deleteMany({});
  await prisma.botAction.deleteMany({});
  await prisma.botVersion.deleteMany({});
  await prisma.botEval.deleteMany({});
  await prisma.botIntegration.deleteMany({});
  await prisma.botRating.deleteMany({});
  await prisma.botSource.deleteMany({});

  const result = await prisma.bot.deleteMany({});
  console.log(`Deleted ${result.count} bots.`);
}

main()
  .then(() => { console.log("Done"); process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });


