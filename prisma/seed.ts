import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AGENT_TYPES_DATA = [
  {
    slug: "customer_service",
    name: "Mr. Black - Customer Service",
    mascot: "mr_black.png",
    description: "Hjälper dina kunder 24/7",
    color: "#000000",
    onboardingPrompt:
      "Hej! Jag är Mr. Black, din kundtjänst-assistent. Vad är ditt största behov när det gäller kundstöd?",
    categories: [
      {
        slug: "support",
        name: "Kundstöd",
        description: "Hantera kundsupport effektivt",
        order: 1,
        contextQuestions: [
          "Vilka är dina 5 vanligaste kundfrågor?",
          "Vilka problem löser du oftast?",
          "Hur många support-tickets per dag får du ungefär?",
        ],
        children: [
          {
            slug: "faq_based",
            name: "FAQ & Knowledge Base",
            description: "Svar på vanliga frågor",
            order: 1,
            contextQuestions: ["Vilka FAQ-kategorier behöver du?"],
            useCases: [
              {
                slug: "faq_generation",
                name: "FAQ Generation",
                description: "Skapa FAQ från support-tickets",
                systemPromptTemplate:
                  "Du är en FAQ-expert. Ditt jobb är att omvandla support-tickets till strukturerade FAQ.",
                exampleTasks: [
                  "Analysera support-mönster",
                  "Skapa FAQ-struktur",
                  "Automatisera svar",
                ],
              },
              {
                slug: "knowledge_base",
                name: "Knowledge Base",
                description: "Bygg och underhåll knowledge base",
                systemPromptTemplate:
                  "Du är kunskapsbas-specialist. Ditt uppdrag är att organisera och presentera information.",
                exampleTasks: [
                  "Organisera information",
                  "Skapa sökmöjligheter",
                  "Uppdatera innehål",
                ],
              },
            ],
          },
          {
            slug: "technical_support",
            name: "Teknisk support",
            description: "Förbättra tekniska problem",
            order: 2,
            contextQuestions: ["Vilka är de vanligaste tekniska problemen?"],
            useCases: [
              {
                slug: "troubleshooting",
                name: "Troubleshooting Guide",
                description: "Skapa steg-för-steg problemlösning",
                systemPromptTemplate:
                  "Du är en teknisk supportspecialist. Din roll är att skapa tydliga troubleshooting-guider.",
                exampleTasks: [
                  "Diagnostisera problem",
                  "Steg-för-steg guide",
                  "Escalation-kriterier",
                ],
              },
            ],
          },
          {
            slug: "billing_support",
            name: "Fakturering & Betalning",
            description: "Hantera billing-frågor",
            order: 3,
            contextQuestions: [
              "Vilka betalningsmetoder använder du?",
              "Vilka billing-frågor dyker upp oftast?",
            ],
            useCases: [
              {
                slug: "billing_automation",
                name: "Billing Automation",
                description: "Automatisera billing-svar",
                systemPromptTemplate:
                  "Du är billing-specialist. Du hjälper kunder med fakturaer, betalningar och prenumerationer.",
                exampleTasks: [
                  "Besvara fakturafrågor",
                  "Hantera betalningsutmaningar",
                  "Refundprocesser",
                ],
              },
            ],
          },
          {
            slug: "complaint_handling",
            name: "Klagomål & Returer",
            description: "Hantera missnöjda kunder",
            order: 4,
            contextQuestions: [
              "Hur många klagomål får du per månad?",
              "Vilka är de vanligaste orsakerna?",
            ],
            useCases: [
              {
                slug: "complaint_resolution",
                name: "Complaint Resolution",
                description: "Lös klagomål systematiskt",
                systemPromptTemplate:
                  "Du är expert på kundnöjdhet. Din roll är att lösa klagomål och vända negativa erfarenheter till positiva.",
                exampleTasks: [
                  "Analysera klagomål",
                  "Definiera lösning",
                  "Follow-up process",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sales_engagement",
        name: "Sales & Lead Management",
        description: "Hantera försäljning och leads",
        order: 2,
        contextQuestions: [
          "Vill du att agenten ska boka möten?",
          "Vilken är din genomsnittliga deal size?",
          "Hur många leads får du per vecka?",
        ],
        children: [
          {
            slug: "lead_qualification",
            name: "Lead Qualification",
            description: "Kvalificera och bedöm leads",
            order: 1,
            contextQuestions: ["Vilka är dina BANT-kriterier?"],
            useCases: [
              {
                slug: "lead_scoring",
                name: "Lead Scoring",
                description: "Automatisk lead-poängsättning",
                systemPromptTemplate:
                  "Du är lead-qualification expert. Din roll är att bedöma och poängsätta leads baserat på relevans.",
                exampleTasks: [
                  "Analysera lead-information",
                  "Poängsätt lead",
                  "Rekommendera åtgärd",
                ],
              },
            ],
          },
          {
            slug: "meeting_booking",
            name: "Mötesbokningar",
            description: "Automatisera mötesbokningar",
            order: 2,
            contextQuestions: ["Vilka är dina lediga tider?"],
            useCases: [
              {
                slug: "calendar_integration",
                name: "Calendar Integration",
                description: "Integrera bokningssystem",
                systemPromptTemplate:
                  "Du är mötescoordinator. Du bokar möten och säkerställer effektiv schemaläggning.",
                exampleTasks: [
                  "Visa lediga tider",
                  "Bekräfta bokningar",
                  "Påminnelser",
                ],
              },
            ],
          },
          {
            slug: "product_recommendation",
            name: "Produktrekommendationer",
            description: "Rekommendera rätt produkter",
            order: 3,
            contextQuestions: [
                "Vilka produkter/tjänster erbjuder du?",
                "Vad är dina package-strukturer?"
              ],
            useCases: [
              {
                slug: "smart_recommendations",
                name: "Smart Recommendations",
                description: "AI-baserade produktrekommendationer",
                systemPromptTemplate:
                  "Du är sales-specialist. Du analyserar kundbehov och rekommenderar rätt produkt.",
                exampleTasks: [
                  "Identifiera behov",
                  "Rekommendera paket",
                  "Upsell-möjligheter",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "finance",
    name: "Mrs. Pink - Finance Agent",
    mascot: "mrs_pink.png",
    description: "Din personliga ekonomi-assistent",
    color: "#FF69B4",
    onboardingPrompt:
      "Hej! Jag är Mrs. Pink, din finansiella rådgivare. Vad behöver du hjälp med ekonomiskt?",
    categories: [
      {
        slug: "accounting",
        name: "Bokföring & Redovisning",
        description: "Hantera bokföring och redovisning",
        order: 1,
        contextQuestions: [
          "Hur många utgiftskategorier har du?",
          "Vilka är dina återkommande kostnader?",
          "Behöver du månatlig rapportering?",
        ],
        children: [
          {
            slug: "invoicing",
            name: "Fakturering",
            description: "Hantera fakturor och betalningar",
            order: 1,
            contextQuestions: ["Vilken faktureringsfrekvens använder du?"],
            useCases: [
              {
                slug: "invoice_generation",
                name: "Invoice Generation",
                description: "Skapa och skicka fakturor",
                systemPromptTemplate:
                  "Du är fakturerings-expert. Du skapar, skickar och hanterar fakturor.",
                exampleTasks: [
                  "Skapa faktura",
                  "Skicka påminnelser",
                  "Hantera betalningar",
                ],
              },
            ],
          },
          {
            slug: "expense_tracking",
            name: "Utgiftsspårning",
            description: "Spåra och kategorisera utgifter",
            order: 2,
            contextQuestions: [
              "Vilka utgiftskategorier är viktigast?",
              "Hur ofta uppdaterar du utgifter?",
            ],
            useCases: [
              {
                slug: "expense_automation",
                name: "Expense Automation",
                description: "Automatisera utgiftsspårning",
                systemPromptTemplate:
                  "Du är utgifts-specialist. Du kategoriserar, analyserar och rapporterar utgifter.",
                exampleTasks: [
                  "Kategorisera utgifter",
                  "Identifiera sparingsmöjligheter",
                  "Månadsrapporter",
                ],
              },
            ],
          },
          {
            slug: "payroll",
            name: "Lönhantering",
            description: "Hantera lönprocesser",
            order: 3,
            contextQuestions: [
              "Hur många anställda har du?",
              "Vilken lönfrekvens använder du?",
            ],
            useCases: [
              {
                slug: "payroll_automation",
                name: "Payroll Automation",
                description: "Automatisera lönhantering",
                systemPromptTemplate:
                  "Du är HR-ekonomist. Du hanterar löner, skatter och personalöversikter.",
                exampleTasks: [
                  "Beräkna löner",
                  "Hantera skatter",
                  "Generera rapporter",
                ],
              },
            ],
          },
          {
            slug: "reporting",
            name: "Finansiell rapportering",
            description: "Skapa finansiella rapporter",
            order: 4,
            contextQuestions: [
              "Vilka rapporter behöver du?",
              "Vem är din målgrupp?",
            ],
            useCases: [
              {
                slug: "financial_reports",
                name: "Financial Reports",
                description: "Generera finansiella rapporter",
                systemPromptTemplate:
                  "Du är finans-analytiker. Du skapar insiktsfulla finansiella rapporter.",
                exampleTasks: [
                  "Analysera data",
                  "Skapa rapporter",
                  "Presentera insights",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "forecasting",
        name: "Budget & Prognoser",
        description: "Planering och prognoser",
        order: 2,
        contextQuestions: [
          "Vill du prognostisera intäkter?",
          "Behöver du scenario-planering?",
          "Vilken planingshorizon använder du?",
        ],
        children: [
          {
            slug: "budgeting",
            name: "Budgetplanering",
            description: "Skapa och hantera budgetar",
            order: 1,
            contextQuestions: ["Vilka kostnadsslag är viktigast?"],
            useCases: [
              {
                slug: "budget_planning",
                name: "Budget Planning",
                description: "AI-assisterad budgetplanering",
                systemPromptTemplate:
                  "Du är budget-planerare. Du skapar realistiska och flexibla budgetar.",
                exampleTasks: [
                  "Analysera historik",
                  "Skapa budget",
                  "Scenario-planering",
                ],
              },
            ],
          },
          {
            slug: "sales_forecast",
            name: "Försäljningsprognos",
            description: "Prognostisera försäljning",
            order: 2,
            contextQuestions: [
              "Hur variabel är din försäljning?",
              "Vilka är säsongsvariationer?",
            ],
            useCases: [
              {
                slug: "forecast_modeling",
                name: "Forecast Modeling",
                description: "Machine learning-baserad prognos",
                systemPromptTemplate:
                  "Du är prognosanalytiker. Du skapar korrekta försäljningsprognoser.",
                exampleTasks: [
                  "Analysera trender",
                  "Prognostisera försäljning",
                  "Identifiera risker",
                ],
              },
            ],
          },
          {
            slug: "cash_flow",
            name: "Kassaflödesplanering",
            description: "Planera kassaflöde",
            order: 3,
            contextQuestions: [
              "Vilka är dina största kassaflöde-utmaningar?",
              "Vilken är din normal likviditet?",
            ],
            useCases: [
              {
                slug: "cash_flow_modeling",
                name: "Cash Flow Modeling",
                description: "Detaljerad kassaflödesplanering",
                systemPromptTemplate:
                  "Du är kassaflöde-specialist. Du säkerställer solvent och optimerar likviditet.",
                exampleTasks: [
                  "Modellera kassaflöde",
                  "Identifiera flaskhalsar",
                  "Optimeringsförslag",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "analysis",
        name: "Finansiell analys",
        description: "Djup finansiell analys",
        order: 3,
        contextQuestions: [
          "Vilka KPI:er är viktigast för dig?",
          "Vad är dina benchmarks?",
        ],
        children: [
          {
            slug: "kpi_analysis",
            name: "KPI & Nyckeltal",
            description: "Analysera nyckeltål",
            order: 1,
            contextQuestions: ["Vilka KPI:er mäter du idag?"],
            useCases: [
              {
                slug: "kpi_tracking",
                name: "KPI Tracking",
                description: "Automatisk KPI-spårning",
                systemPromptTemplate:
                  "Du är KPI-specialist. Du definierar, mäter och rapporterar nyckeltål.",
                exampleTasks: [
                  "Definiera KPI:er",
                  "Beräkna automatiskt",
                  "Trend-analys",
                ],
              },
            ],
          },
          {
            slug: "trend_analysis",
            name: "Trendanalys",
            description: "Analysera finansiella trender",
            order: 2,
            contextQuestions: ["Vilka är dina största finansiella trender?"],
            useCases: [
              {
                slug: "trend_detection",
                name: "Trend Detection",
                description: "Identifiera trender och anomalier",
                systemPromptTemplate:
                  "Du är trend-analytiker. Du identifierar mönster och anomalier i data.",
                exampleTasks: [
                  "Identifiera trender",
                  "Uppmärksamma anomalier",
                  "Ge rekommendationer",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "creative",
    name: "Mr. Green - Creative Agent",
    mascot: "mr_green.png",
    description: "Din kreativa brainstorming-partner",
    color: "#00AA00",
    onboardingPrompt:
      "Hej! Jag är Mr. Green, din kreativa partner. Vad vill du skapa eller utveckla?",
    categories: [
      {
        slug: "content_creation",
        name: "Innehål & Copywriting",
        description: "Skapa engagerande innehål",
        order: 1,
        contextQuestions: [
          "Vilka sociala kanaler är viktigast för dig?",
          "Vad är ditt varumärkes tone of voice?",
          "Hur ofta publicerar du innehål?",
        ],
        children: [
          {
            slug: "social_media_content",
            name: "Social Media Content",
            description: "Innehål för sociala medier",
            order: 1,
            contextQuestions: [
              "Vilka plattformar är prioritet? (Instagram, LinkedIn, TikTok, etc)",
            ],
            useCases: [
              {
                slug: "social_posting",
                name: "Social Media Posting",
                description: "Skapa och publicera inlägg",
                systemPromptTemplate:
                  "Du är social media-expert. Du skapar engagerande inlägg anpassat för varje plattform.",
                exampleTasks: [
                  "Skapa idéer",
                  "Skriva inlägg",
                  "Optimera hashtags",
                  "Planera publicering",
                ],
              },
              {
                slug: "content_calendar",
                name: "Content Calendar",
                description: "Planera innehålls-strategi",
                systemPromptTemplate:
                  "Du är innehålls-planerare. Du skapar konsistent och strategisk innehålls-kalender.",
                exampleTasks: [
                  "Planera teman",
                  "Balansera innehål",
                  "Identifiera möjligheter",
                ],
              },
            ],
          },
          {
            slug: "blog_writing",
            name: "Blogginlägg",
            description: "Blogginlägg och artiklar",
            order: 2,
            contextQuestions: [
              "Vilka är dina blogg-ämnen?",
              "Vad är din målgrupp?",
            ],
            useCases: [
              {
                slug: "blog_creation",
                name: "Blog Creation",
                description: "Skriva långformats-innehål",
                systemPromptTemplate:
                  "Du är innehålls-skribent. Du skriver informativt, SEO-optimerat bloginnehål.",
                exampleTasks: [
                  "Skriva inlägg",
                  "Optimera SEO",
                  "Struktur och format",
                ],
              },
              {
                slug: "seo_optimization",
                name: "SEO Optimization",
                description: "Optimera för sökmotorer",
                systemPromptTemplate:
                  "Du är SEO-specialist. Du optimerar innehål för bättre rankning.",
                exampleTasks: [
                  "Keyword-forskning",
                  "On-page SEO",
                  "Link-strategi",
                ],
              },
            ],
          },
          {
            slug: "email_marketing",
            name: "Email Marketing",
            description: "Email-kampanjer och automation",
            order: 3,
            contextQuestions: [
              "Vilken är din email-list storlek?",
              "Vad är dina mål med email?",
            ],
            useCases: [
              {
                slug: "email_campaigns",
                name: "Email Campaigns",
                description: "Planera och skriva email-kampanjer",
                systemPromptTemplate:
                  "Du är email-marketer. Du skapar konverterande email-kampanjer.",
                exampleTasks: [
                  "Skriva subject lines",
                  "Skriva body-kopior",
                  "CTA-optimering",
                ],
              },
              {
                slug: "email_automation",
                name: "Email Automation",
                description: "Automatiserad email-sekvens",
                systemPromptTemplate:
                  "Du är automation-specialist. Du designar effektiva email-flöden.",
                exampleTasks: [
                  "Definiera triggers",
                  "Designa flows",
                  "Testa och optimera",
                ],
              },
            ],
          },
          {
            slug: "ad_copy",
            name: "Annonser & Copy",
            description: "Annonstext och copywriting",
            order: 4,
            contextQuestions: [
              "Vilka annonserplattformar använder du? (Google, Facebook, etc)",
              "Vad är din budget?",
            ],
            useCases: [
              {
                slug: "ad_copywriting",
                name: "Ad Copywriting",
                description: "Skriva konverterande annonser",
                systemPromptTemplate:
                  "Du är copywriter. Du skriver annonstext som konverterar.",
                exampleTasks: [
                  "Testa variationer",
                  "Optimera headlines",
                  "A/B-test",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "strategic_planning",
        name: "Strategi & Planering",
        description: "Strategisk planering och ideation",
        order: 2,
        contextQuestions: [
          "Vilken industri är du i?",
          "Vilka är dina primära målgrupper?",
          "Vad är dina affärsmål?",
        ],
        children: [
          {
            slug: "campaign_planning",
            name: "Kampanjidéer",
            description: "Planera och brainstorma kampanjer",
            order: 1,
            contextQuestions: ["Vilka är dina kampanj-mål?"],
            useCases: [
              {
                slug: "campaign_ideation",
                name: "Campaign Ideation",
                description: "Brainstorma kampanjidéer",
                systemPromptTemplate:
                  "Du är kreativ strateg. Du genererar innovativa kampanjidéer.",
                exampleTasks: [
                  "Brainstorma idéer",
                  "Testa koncept",
                  "Pitch material",
                ],
              },
              {
                slug: "campaign_execution",
                name: "Campaign Execution",
                description: "Genomför kampanj",
                systemPromptTemplate:
                  "Du är kampanj-manager. Du planerar genomförande i detalj.",
                exampleTasks: [
                  "Skapa timeline",
                  "Definiera resurser",
                  "Risk-planering",
                ],
              },
            ],
          },
          {
            slug: "product_innovation",
            name: "Produktinnovation",
            description: "Innovera nya produkter/features",
            order: 2,
            contextQuestions: [
              "Vilka problem löser dina produkter?",
              "Vad är feedback från kunder?",
            ],
            useCases: [
              {
                slug: "product_brainstorm",
                name: "Product Brainstorm",
                description: "Brainstorma nya produktidéer",
                systemPromptTemplate:
                  "Du är produktansvarig. Du skapar innovativa produktkoncept.",
                exampleTasks: [
                  "Identifiera möjligheter",
                  "Skissa på idéer",
                  "Prioritera koncept",
                ],
              },
            ],
          },
          {
            slug: "market_research",
            name: "Marknadsanalys",
            description: "Marknads- och konkurrensanalys",
            order: 3,
            contextQuestions: [
              "Vilka är dina huvudkonkurrenter?",
              "Vilka är marknads-trenderna?",
            ],
            useCases: [
              {
                slug: "market_analysis",
                name: "Market Analysis",
                description: "Analysera marknads-möjligheter",
                systemPromptTemplate:
                  "Du är marknad-analytiker. Du identifierar opportunities och hot.",
                exampleTasks: [
                  "Konkurrens-analys",
                  "Trend-forskning",
                  "Gap-analys",
                ],
              },
            ],
          },
          {
            slug: "brand_strategy",
            name: "Varumärkesstrategi",
            description: "Utveckla varumärkesstrategi",
            order: 4,
            contextQuestions: [
              "Vad är din varumärkes-positioning?",
              "Vilka är dina varumärkes-värden?",
            ],
            useCases: [
              {
                slug: "brand_development",
                name: "Brand Development",
                description: "Utveckla varumärkes-identitet",
                systemPromptTemplate:
                  "Du är brand-strateg. Du utvecklar starka varumärkes-identiteter.",
                exampleTasks: [
                  "Definiera positioning",
                  "Messaging",
                  "Visual identity",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting agent system seed...");

  // Clear existing data (be careful in production!)
  await prisma.agentType.deleteMany();

  for (const agentData of AGENT_TYPES_DATA) {
    console.log(`📝 Creating agent: ${agentData.name}`);

    const agent = await prisma.agentType.create({
      data: {
        slug: agentData.slug,
        name: agentData.name,
        mascot: agentData.mascot,
        description: agentData.description,
        color: agentData.color,
        onboardingPrompt: agentData.onboardingPrompt,
        isActive: true,
      },
    });

    // Create categories
    for (const categoryData of agentData.categories) {
      console.log(`  📂 Creating category: ${categoryData.name}`);

      const category = await prisma.agentCategory.create({
        data: {
          agentTypeId: agent.id,
          parentId: null,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          order: categoryData.order,
          contextQuestions: categoryData.contextQuestions,
          tags: [],
          isActive: true,
        },
      });

      // Create subcategories and use cases
      if (categoryData.children) {
        for (const childData of categoryData.children) {
          console.log(`    📂 Creating subcategory: ${childData.name}`);

          const subCategory = await prisma.agentCategory.create({
            data: {
              agentTypeId: agent.id,
              parentId: category.id,
              name: childData.name,
              slug: childData.slug,
              description: childData.description,
              order: childData.order,
              contextQuestions: childData.contextQuestions,
              tags: [],
              isActive: true,
            },
          });

          // Create use cases for this subcategory
          if (childData.useCases) {
            for (const useCaseData of childData.useCases) {
              console.log(`      ✅ Creating use case: ${useCaseData.name}`);

              await prisma.useCaseTemplate.create({
                data: {
                  categoryId: subCategory.id,
                  name: useCaseData.name,
                  description: useCaseData.description,
                  icon: null,
                  systemPromptTemplate: useCaseData.systemPromptTemplate,
                  contextTemplate: undefined,
                  exampleTasks: useCaseData.exampleTasks,
                  order: 1,
                },
              });
            }
          }
        }
      }
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
