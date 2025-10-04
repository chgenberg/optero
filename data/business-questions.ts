// Intelligent, department-specific questions for B2B analysis

export interface Question {
  question: string;
  type: "text" | "number" | "select" | "scale";
  options?: string[];
  placeholder?: string;
  tip?: string;
}

export const DEPARTMENT_QUESTIONS: Record<string, Question[]> = {
  "sales": [
    { 
      question: "Hur många säljare har ni i teamet?", 
      type: "number",
      tip: "Detta hjälper oss beräkna total tidsbesparing och ROI för hela teamet"
    },
    { 
      question: "Vad är er genomsnittliga deal-size? (SEK)", 
      type: "number",
      placeholder: "50000",
      tip: "Större deals = större värde av AI-optimering"
    },
    { 
      question: "Hur lång är er genomsnittliga säljcykel?", 
      type: "select",
      options: ["< 1 månad", "1-3 månader", "3-6 månader", "6-12 månader", "> 1 år"]
    },
    { 
      question: "Vilket CRM-system använder ni?", 
      type: "select", 
      options: ["Salesforce", "HubSpot", "Pipedrive", "Microsoft Dynamics", "Lime CRM", "Annat", "Inget CRM"],
      tip: "Vi anpassar AI-lösningar till ert specifika CRM"
    },
    { 
      question: "Hur många timmar per vecka spenderar varje säljare på administration (CRM-uppdatering, rapporter, etc.)?", 
      type: "scale",
      tip: "Detta är ofta den största tidsbesparingen med AI"
    },
    { 
      question: "Hur genererar ni leads idag?", 
      type: "select",
      options: ["Inbound (hemsida, SEO)", "Outbound (cold calling, email)", "Nätverk & events", "Partners & referenser", "Blandning av allt"]
    },
    { 
      question: "Hur kvalificerar ni leads innan första kontakt?", 
      type: "text",
      placeholder: "T.ex. manuell research, LinkedIn-koll, företagsstorlek...",
      tip: "AI kan automatisera 90% av denna process"
    },
    { 
      question: "Hur många cold outreach-kontakter gör ni per vecka (email + calls)?", 
      type: "number",
      placeholder: "100"
    },
    { 
      question: "Vad är er genomsnittliga konverteringsgrad från lead till kund? (%)", 
      type: "number",
      placeholder: "15",
      tip: "AI kan ofta öka detta med 20-40%"
    },
    { 
      question: "Hur skapar ni offerter/proposals idag?", 
      type: "select",
      options: ["Från scratch varje gång", "Mallar som anpassas manuellt", "Delvis automatiserat", "Helt automatiserat"]
    },
    { 
      question: "Hur lång tid tar det att skapa en anpassad offert?", 
      type: "scale",
      tip: "AI kan reducera detta från timmar till minuter"
    },
    { 
      question: "Hur följer ni upp leads som inte svarat?", 
      type: "select",
      options: ["Manuellt i CRM", "Automatiska påminnelser", "Email-sequences", "Ingen systematisk uppföljning"]
    },
    { 
      question: "Hur många deals förlorar ni per månad pga. glömda uppföljningar eller långsam respons?", 
      type: "number",
      placeholder: "5",
      tip: "Varje förlorad deal är en direkt kostnad som AI kan förhindra"
    },
    { 
      question: "Spelar ni in och analyserar säljsamtal?", 
      type: "select",
      options: ["Ja, systematiskt", "Ibland", "Aldrig"]
    },
    { 
      question: "Hur onboardar ni nya säljare?", 
      type: "text",
      placeholder: "T.ex. shadowing, manualer, mentorskap...",
      tip: "AI kan förkorta onboarding-tid med 50%"
    },
    { 
      question: "Vilken är er största flaskhals i säljprocessen?", 
      type: "select",
      options: [
        "Leadgenerering", 
        "Leadkvalificering", 
        "Första kontakt/bokning", 
        "Demo/presentation", 
        "Offerthantering", 
        "Förhandling & closing",
        "Administration & CRM"
      ]
    }
  ],

  "marketing": [
    { 
      question: "Hur många personer jobbar med marknadsföring?", 
      type: "number"
    },
    { 
      question: "Vad är er månatliga marknadsbudget? (SEK)", 
      type: "number", 
      placeholder: "50000",
      tip: "AI kan ofta öka ROI med 30-50% på samma budget"
    },
    { 
      question: "Vilka kanaler prioriterar ni?", 
      type: "select",
      options: ["Social media", "Email", "SEO/Content", "Paid ads", "Events", "Blandning"]
    },
    { 
      question: "Hur många innehållspublikationer skapar ni per vecka? (bloggar, posts, videos, etc.)", 
      type: "number",
      placeholder: "10"
    },
    { 
      question: "Hur lång tid tar det att skapa ett blogginlägg från idé till publicering?", 
      type: "scale",
      tip: "AI kan reducera detta med 60-80%"
    },
    { 
      question: "Hur skapar ni innehåll idag?", 
      type: "select",
      options: ["Allt manuellt", "Mallar + manuell anpassning", "Delvis AI-assisterat", "Fullt AI-drivet"]
    },
    { 
      question: "Hur mycket tid spenderar ni på att designa grafik och bilder?", 
      type: "scale"
    },
    { 
      question: "Använder ni AI-verktyg för innehållsskapande idag?", 
      type: "select",
      options: ["Ja, aktivt", "Testar lite", "Nej, inte än"]
    },
    { 
      question: "Hur personaliserar ni er marknadsföring för olika segment?", 
      type: "text",
      placeholder: "T.ex. olika emails, landing pages, budskap...",
      tip: "AI kan automatisera hyperpersonalisering"
    },
    { 
      question: "Hur mäter ni marknadsföringens ROI?", 
      type: "select",
      options: ["Detaljerad tracking", "Grundläggande metrics", "Magkänsla", "Mäter inte systematiskt"]
    },
    { 
      question: "Hur ofta kör ni A/B-tester på kampanjer?", 
      type: "select",
      options: ["Varje kampanj", "Ofta", "Ibland", "Sällan", "Aldrig"]
    },
    { 
      question: "Hur hanterar ni SEO och sökordsoptimering?", 
      type: "text",
      placeholder: "T.ex. manuell research, verktyg, byrå..."
    },
    { 
      question: "Hur många timmar per vecka spenderar teamet på rapportering och analys?", 
      type: "scale"
    },
    { 
      question: "Vilken är er största marknadsföringsutmaning just nu?", 
      type: "select",
      options: [
        "Skapa tillräckligt med innehåll",
        "Nå rätt målgrupp",
        "Mäta och bevisa ROI",
        "Personalisering i skala",
        "Kreativitet och idéer",
        "Resursbrist (tid/budget)"
      ]
    }
  ],

  "finance": [
    { 
      question: "Hur många personer jobbar med ekonomi/finans?", 
      type: "number"
    },
    { 
      question: "Hur många fakturor hanterar ni per månad?", 
      type: "number",
      placeholder: "200",
      tip: "AI kan automatisera 80-90% av fakturahanteringen"
    },
    { 
      question: "Hur lång tid tar det att stänga månaden (månadsavslut)?", 
      type: "select",
      options: ["< 1 dag", "1-2 dagar", "3-5 dagar", "1 vecka", "> 1 vecka"]
    },
    { 
      question: "Vilket ekonomisystem använder ni?", 
      type: "select",
      options: ["Fortnox", "Visma", "Bokio", "PE Accounting", "SAP", "Annat"]
    },
    { 
      question: "Hur mycket tid spenderar ni på manuell datainmatning per vecka?", 
      type: "scale",
      tip: "Detta är ofta den största tidsbesparingen med AI-OCR"
    },
    { 
      question: "Hur hanterar ni leverantörsfakturor?", 
      type: "select",
      options: ["Manuell inmatning", "OCR-scanning", "Automatisk inläsning", "Blandning"]
    },
    { 
      question: "Hur skapar ni ekonomiska rapporter till ledningen?", 
      type: "text",
      placeholder: "T.ex. manuellt i Excel, automatiska dashboards...",
      tip: "AI kan generera rapporter automatiskt med insikter"
    },
    { 
      question: "Hur ofta gör ni prognoser och budgetuppföljning?", 
      type: "select",
      options: ["Varje vecka", "Månadsvis", "Kvartalsvis", "Årligen", "Sällan"]
    },
    { 
      question: "Hur mycket tid spenderar ni på kontostämningar per månad?", 
      type: "scale"
    },
    { 
      question: "Hur hanterar ni momsdeklarationer?", 
      type: "select",
      options: ["Helt manuellt", "Delvis automatiserat", "Helt automatiserat"]
    },
    { 
      question: "Hur analyserar ni avvikelser i budget vs faktiskt utfall?", 
      type: "text",
      placeholder: "T.ex. manuell genomgång, Excel-analys, automatiska varningar..."
    },
    { 
      question: "Vilken är er största ekonomiska utmaning?", 
      type: "select",
      options: [
        "Tidskrävande manuellt arbete",
        "Risk för fel i bokföring",
        "Långsam rapportering",
        "Svårt att få överblick",
        "Prognoser och planering",
        "Compliance och revision"
      ]
    }
  ],

  "hr": [
    { 
      question: "Hur många personer jobbar med HR?", 
      type: "number"
    },
    { 
      question: "Hur många rekryteringar gör ni per år?", 
      type: "number",
      placeholder: "20",
      tip: "AI kan spara 10-15 timmar per rekrytering"
    },
    { 
      question: "Hur lång tid tar en genomsnittlig rekrytering från start till anställning?", 
      type: "select",
      options: ["< 1 månad", "1-2 månader", "2-3 månader", "3-6 månader", "> 6 månader"]
    },
    { 
      question: "Hur många ansökningar får ni per tjänst i genomsnitt?", 
      type: "number",
      placeholder: "50"
    },
    { 
      question: "Hur screener ni CV:n och ansökningar idag?", 
      type: "select",
      options: ["Manuellt, alla läses", "Snabbkoll + djupdykning i topp", "ATS-system med filter", "AI-assisterad screening"]
    },
    { 
      question: "Hur mycket tid spenderar ni på CV-screening per rekrytering?", 
      type: "scale",
      tip: "AI kan reducera detta med 90%"
    },
    { 
      question: "Hur skapar ni jobbannons​er?", 
      type: "select",
      options: ["Från scratch", "Mallar som anpassas", "AI-genererade", "Extern hjälp"]
    },
    { 
      question: "Hur onboardar ni nya medarbetare?", 
      type: "text",
      placeholder: "T.ex. manualer, mentorskap, workshops...",
      tip: "AI kan skapa personliga onboarding-planer"
    },
    { 
      question: "Hur hanterar ni medarbetarsamtal och utvecklingsplaner?", 
      type: "select",
      options: ["Strukturerat med mallar", "Friare format", "Digitalt system", "Papper och penna"]
    },
    { 
      question: "Hur mycket tid spenderar ni på HR-administration per vecka? (löner, frånvaro, dokument)", 
      type: "scale"
    },
    { 
      question: "Hur mäter ni medarbetarnöjdhet och engagement?", 
      type: "select",
      options: ["Regelbundna enkäter", "Årlig undersökning", "Informella samtal", "Mäter inte systematiskt"]
    },
    { 
      question: "Vilken är er största HR-utmaning?", 
      type: "select",
      options: [
        "Hitta rätt kandidater",
        "Tidskrävande screening",
        "Långsamma processer",
        "Onboarding tar för lång tid",
        "Retention och engagement",
        "Administration och dokumentation"
      ]
    }
  ],

  "customer-service": [
    { 
      question: "Hur många personer jobbar i kundtjänst?", 
      type: "number"
    },
    { 
      question: "Hur många kundärenden hanterar ni per vecka?", 
      type: "number",
      placeholder: "200",
      tip: "AI kan hantera 40-60% av vanliga frågor automatiskt"
    },
    { 
      question: "Vilka kanaler använder kunder för att nå er?", 
      type: "select",
      options: ["Email", "Telefon", "Chat", "Social media", "Alla kanaler"]
    },
    { 
      question: "Vad är er genomsnittliga svarstid på kundärenden?", 
      type: "select",
      options: ["< 1 timme", "1-4 timmar", "4-24 timmar", "1-3 dagar", "> 3 dagar"]
    },
    { 
      question: "Hur stor andel av ärenden är repetitiva frågor? (%)", 
      type: "number",
      placeholder: "60",
      tip: "Dessa kan AI hantera automatiskt"
    },
    { 
      question: "Använder ni någon form av självbetjäning/FAQ idag?", 
      type: "select",
      options: ["Ja, omfattande", "Grundläggande FAQ", "Nej, inte än"]
    },
    { 
      question: "Hur dokumenterar ni lösningar på vanliga problem?", 
      type: "text",
      placeholder: "T.ex. kunskapsbas, Excel, inget system..."
    },
    { 
      question: "Hur mycket tid spenderar ni på att skriva samma svar om och om igen?", 
      type: "scale"
    },
    { 
      question: "Hur mäter ni kundnöjdhet?", 
      type: "select",
      options: ["NPS/CSAT efter varje ärende", "Periodiska enkäter", "Informell feedback", "Mäter inte"]
    },
    { 
      question: "Hur eskalerar ni komplexa ärenden?", 
      type: "text",
      placeholder: "T.ex. till specialist, manager, teknisk support..."
    },
    { 
      question: "Vilken är er största kundtjänst-utmaning?", 
      type: "select",
      options: [
        "För hög volym av ärenden",
        "Långsamma svarstider",
        "Repetitiva frågor tar tid",
        "Svårt att skala vid toppar",
        "Inkonsekvent kvalitet",
        "Kunskapsöverföring mellan team"
      ]
    }
  ],

  "operations": [
    { 
      question: "Hur många personer jobbar med operations/produktion?", 
      type: "number"
    },
    { 
      question: "Vilken typ av verksamhet driver ni?", 
      type: "select",
      options: ["Tillverkning", "Lager & logistik", "Tjänsteproduktion", "Blandning"]
    },
    { 
      question: "Hur planerar ni produktion/kapacitet idag?", 
      type: "select",
      options: ["Manuellt i Excel", "ERP-system", "Specialiserad mjukvara", "Erfarenhet och magkänsla"]
    },
    { 
      question: "Hur mycket tid spenderar ni på att skapa produktionsplaner per vecka?", 
      type: "scale"
    },
    { 
      question: "Hur ofta får ni ändra planer pga. oväntade händelser?", 
      type: "select",
      options: ["Dagligen", "Varje vecka", "Ibland", "Sällan"],
      tip: "AI kan förutse problem och föreslå alternativ"
    },
    { 
      question: "Hur hanterar ni kvalitetskontroll?", 
      type: "text",
      placeholder: "T.ex. stickprov, 100% kontroll, automatisk..."
    },
    { 
      question: "Hur spårar ni material och lager?", 
      type: "select",
      options: ["Manuellt", "Excel", "Lagersystem", "ERP", "Inget system"]
    },
    { 
      question: "Hur ofta får ni stopp pga. materialbrist?", 
      type: "select",
      options: ["Varje vecka", "Månadsvis", "Sällan", "Aldrig"]
    },
    { 
      question: "Hur mycket tid spenderar ni på rapportering och KPI-uppföljning?", 
      type: "scale"
    },
    { 
      question: "Hur identifierar ni flaskhalsar i produktionen?", 
      type: "text",
      placeholder: "T.ex. manuell analys, automatisk monitoring..."
    },
    { 
      question: "Vilken är er största operations-utmaning?", 
      type: "select",
      options: [
        "Ineffektiv planering",
        "Materialhantering",
        "Kvalitetsproblem",
        "Flaskhalsar i produktion",
        "Manuell rapportering",
        "Svårt att optimera"
      ]
    }
  ],

  "it": [
    { 
      question: "Hur många personer jobbar med IT/teknik?", 
      type: "number"
    },
    { 
      question: "Vilken typ av IT-arbete gör ni mest?", 
      type: "select",
      options: ["Utveckling/programmering", "IT-support", "Infrastruktur/DevOps", "Säkerhet", "Blandning"]
    },
    { 
      question: "Hur många support-ärenden får ni per vecka?", 
      type: "number",
      placeholder: "50",
      tip: "AI kan lösa 30-50% av vanliga IT-problem automatiskt"
    },
    { 
      question: "Hur dokumenterar ni kod och system?", 
      type: "select",
      options: ["Omfattande dokumentation", "Grundläggande docs", "Kod-kommentarer", "Minimal dokumentation"]
    },
    { 
      question: "Hur mycket tid spenderar utvecklare på att skriva kod vs. annat? (%)", 
      type: "number",
      placeholder: "40",
      tip: "AI kan öka faktisk kodtid med 30-50%"
    },
    { 
      question: "Använder ni AI-verktyg för kodning idag? (GitHub Copilot, etc.)", 
      type: "select",
      options: ["Ja, aktivt", "Testar", "Nej"]
    },
    { 
      question: "Hur hanterar ni code reviews?", 
      type: "text",
      placeholder: "T.ex. manuellt, automatiska verktyg, AI-assisterat..."
    },
    { 
      question: "Hur mycket tid spenderar ni på debugging per vecka?", 
      type: "scale"
    },
    { 
      question: "Hur hanterar ni IT-säkerhet och sårbarhetsscanning?", 
      type: "select",
      options: ["Automatiska verktyg", "Manuella reviews", "Extern pentesting", "Grundläggande"]
    },
    { 
      question: "Hur mycket tid spenderar ni på deployment och DevOps per vecka?", 
      type: "scale"
    },
    { 
      question: "Vilken är er största IT-utmaning?", 
      type: "select",
      options: [
        "För många support-ärenden",
        "Långsam utveckling",
        "Teknisk skuld",
        "Dokumentation",
        "Testing och kvalitet",
        "Säkerhet och compliance"
      ]
    }
  ],

  "management": [
    { 
      question: "Hur många personer är ni i ledningsgruppen?", 
      type: "number"
    },
    { 
      question: "Hur stor är organisationen totalt?", 
      type: "number",
      placeholder: "50"
    },
    { 
      question: "Hur ofta har ni ledningsgruppsmöten?", 
      type: "select",
      options: ["Varje vecka", "Varannan vecka", "Månadsvis", "Kvartalsvis"]
    },
    { 
      question: "Hur mycket tid spenderar ni på att samla data för beslutsunderlag per vecka?", 
      type: "scale",
      tip: "AI kan automatisera datainsamling och analys"
    },
    { 
      question: "Hur får ni insikter om verksamheten idag?", 
      type: "select",
      options: ["Realtids-dashboards", "Manuella rapporter", "Excel-analyser", "Möten och diskussioner"]
    },
    { 
      question: "Hur skapar ni strategiska planer och roadmaps?", 
      type: "text",
      placeholder: "T.ex. workshops, data-analys, extern konsult..."
    },
    { 
      question: "Hur analyserar ni marknads- och konkurrensinformation?", 
      type: "select",
      options: ["Systematiskt med verktyg", "Manuell research", "Extern analys", "Begränsat"]
    },
    { 
      question: "Hur mycket tid spenderar ni på intern kommunikation och uppdateringar?", 
      type: "scale"
    },
    { 
      question: "Hur följer ni upp mål och KPI:er?", 
      type: "select",
      options: ["Automatiska dashboards", "Manuella rapporter", "Kvartalsvisa reviews", "Informellt"]
    },
    { 
      question: "Hur fattar ni strategiska beslut?", 
      type: "text",
      placeholder: "T.ex. datadriven, erfarenhet, kombination..."
    },
    { 
      question: "Vilken är er största ledningsutmaning?", 
      type: "select",
      options: [
        "Få rätt data i rätt tid",
        "Analysera komplex information",
        "Kommunicera beslut effektivt",
        "Följa upp execution",
        "Identifiera risker tidigt",
        "Strategisk planering"
      ]
    }
  ]
};

// Add default questions for departments not yet defined
DEPARTMENT_QUESTIONS["customer-service"] = DEPARTMENT_QUESTIONS["customer-service"] || DEPARTMENT_QUESTIONS["sales"];
DEPARTMENT_QUESTIONS["operations"] = DEPARTMENT_QUESTIONS["operations"] || DEPARTMENT_QUESTIONS["sales"];
