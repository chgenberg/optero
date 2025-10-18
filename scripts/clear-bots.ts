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
  // Handle potentially missing tables gracefully
  try { await prisma.botKnowledge.deleteMany({}); } catch (e) { console.log("Skipping BotKnowledge"); }
  try { await prisma.botSession.deleteMany({}); } catch (e) { console.log("Skipping BotSession"); }
  try { await prisma.botUsage.deleteMany({}); } catch (e) { console.log("Skipping BotUsage"); }
  try { await prisma.approvalRequest.deleteMany({}); } catch (e) { console.log("Skipping ApprovalRequest"); }
  try { await prisma.botAction.deleteMany({}); } catch (e) { console.log("Skipping BotAction"); }
  try { await prisma.botVersion.deleteMany({}); } catch (e) { console.log("Skipping BotVersion"); }
  try { await prisma.botEval.deleteMany({}); } catch (e) { console.log("Skipping BotEval"); }
  try { await prisma.botIntegration.deleteMany({}); } catch (e) { console.log("Skipping BotIntegration"); }
  try { await prisma.botRating.deleteMany({}); } catch (e) { console.log("Skipping BotRating"); }
  try { await prisma.botSource.deleteMany({}); } catch (e) { console.log("Skipping BotSource"); }

  const result = await prisma.bot.deleteMany({});
  console.log(`Deleted ${result.count} bots.`);
}

main()
  .then(() => { console.log("Done"); process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });


