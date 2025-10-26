import prisma from "@/lib/prisma";

async function seedDemoAccount() {
  try {
    console.log("🌱 Seeding demo account...");

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@mendio.com" }
    });

    if (existingUser) {
      console.log("✅ Demo account already exists");
      
      // Check if they have a demo bot
      const existingBot = await prisma.bot.findFirst({
        where: { 
          userId: existingUser.id,
          name: { contains: "Demo" }
        }
      });

      if (existingBot) {
        console.log("✅ Demo bot already exists");
        process.exit(0);
      }
    }

    // Create demo user if doesn't exist
    const demoUser = existingUser || await prisma.user.create({
      data: {
        email: "demo@mendio.com",
        name: "Demo User",
        isInternal: true,
        role: "USER"
      }
    });

    console.log(`✅ Demo user created/found: ${demoUser.email}`);

    // Create a demo bot
    const demoBot = await prisma.bot.create({
      data: {
        userId: demoUser.id,
        name: "Demo Bot - MENDIO",
        type: "knowledge",
        companyUrl: "https://mendio.se",
        isActive: true,
        isPublic: false,
        spec: {
          purpose: "customer",
          brand: {
            name: "Demo Bot - MENDIO",
            tone: "Professional",
            color: "#000000",
            language: "en"
          },
          integrations: {}
        }
      }
    });

    console.log(`✅ Demo bot created: ${demoBot.name} (ID: ${demoBot.id})`);

    // Add some demo knowledge
    const demoKnowledge = await prisma.botKnowledge.create({
      data: {
        botId: demoBot.id,
        title: "Welcome to MENDIO Demo",
        content: `MENDIO is an AI chatbot platform that helps businesses create intelligent assistants.

Key Features:
- Custom-trained AI bots
- Multi-purpose capabilities (support, lead generation, etc.)
- 24/7 availability
- Easy integration with existing tools
- Document-based learning

This is a demo bot to showcase the capabilities of MENDIO's platform.
Feel free to ask any questions about how MENDIO works!`,
        source: "demo",
        metadata: {
          type: "introduction",
          language: "en"
        }
      }
    });

    console.log(`✅ Demo knowledge created`);

    console.log("\n🎉 Demo account setup complete!");
    console.log(`\nDemo Credentials:`);
    console.log(`Email: demo@mendio.com`);
    console.log(`Bot ID: ${demoBot.id}`);
    console.log(`\nYou can now log in with this email using the magic link!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding demo account:", error);
    process.exit(1);
  }
}

seedDemoAccount();
