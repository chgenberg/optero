export const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Gratis',
    price: 0,
    features: {
      promptsPerMonth: 10,
      promptAccess: 'limited',
      scenarios: 3,
      tools: 5,
      aiCoach: false,
      pdfReports: false,
      support: 'community',
    },
    description: 'Perfekt för att testa tjänsten',
    highlights: [
      '10 AI-prompts per månad',
      'Grundläggande yrkesanalys',
      '3 praktiska scenarion',
      '5 AI-verktygsrekommendationer',
    ],
  },
  
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 197,
    priceYearly: 1970, // 2 månader gratis
    features: {
      promptsPerMonth: null, // Unlimited for profession
      promptAccess: 'profession',
      scenarios: 'unlimited',
      tools: 'unlimited',
      aiCoach: true,
      pdfReports: true,
      support: 'priority',
    },
    description: 'För yrkesverksamma som vill maximera sin produktivitet',
    highlights: [
      'Obegränsade prompts för ditt yrke',
      'AI-coach anpassad för din roll',
      'Månatliga PDF-rapporter',
      'Prioriterad support',
      'Nya prompts varje vecka',
      'Avancerade automationsguider',
    ],
    popular: true,
  },
  
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 697,
    priceYearly: 6970, // 2 månader gratis
    features: {
      promptsPerMonth: null, // Unlimited
      promptAccess: 'unlimited',
      scenarios: 'unlimited',
      tools: 'unlimited',
      aiCoach: true,
      pdfReports: true,
      apiAccess: true,
      support: 'dedicated',
      teamSeats: 5,
    },
    description: 'För team och företag som vill transformera hela organisationen',
    highlights: [
      'Obegränsade prompts för alla yrken',
      'AI-coach för hela teamet (5 platser)',
      'Anpassade företagsrapporter',
      'API-tillgång för integrationer',
      'Dedikerad kundansvarig',
      'Branschspecifika workshops',
      'Custom prompt-utveckling',
    ],
  },
  
  ONETIME: {
    PREMIUM_ANALYSIS: {
      id: 'premium_analysis',
      name: 'Premium Djupanalys',
      price: 297,
      description: 'Engångsköp för en komplett AI-transformation',
      features: {
        deepAnalysis: true,
        personalizedPlan: true,
        pdfReport: '20+ sidor',
        aiCoachAccess: '30 dagar',
        followUp: '2 sessioner',
        moneyBack: '30 dagar',
      },
      highlights: [
        '20+ sidor personlig AI-guide',
        '30 dagars tillgång till AI-coach',
        '2 uppföljningssamtal ingår',
        'Steg-för-steg implementeringsplan',
        'ROI-kalkyl för din roll',
        '30 dagars nöjd-kund-garanti',
      ],
    },
  },
};

export const getSubscriptionLimits = (tier: string) => {
  const tierData = Object.values(PRICING_TIERS).find(t => t.id === tier);
  return tierData?.features || PRICING_TIERS.FREE.features;
};

export const canAccessPrompt = (
  subscription: { tier: string; promptAccess: string; usedPrompts: number; monthlyPromptLimit: number | null },
  prompt: { isPremium: boolean; profession: string },
  userProfession: string
) => {
  // Free users get limited prompts
  if (subscription.tier === 'free') {
    if (subscription.monthlyPromptLimit && subscription.usedPrompts >= subscription.monthlyPromptLimit) {
      return { allowed: false, reason: 'monthly_limit' };
    }
    if (prompt.isPremium) {
      return { allowed: false, reason: 'premium_only' };
    }
    return { allowed: true };
  }
  
  // Professional users get unlimited for their profession
  if (subscription.promptAccess === 'profession') {
    if (prompt.profession !== userProfession) {
      return { allowed: false, reason: 'wrong_profession' };
    }
    return { allowed: true };
  }
  
  // Business users get everything
  if (subscription.promptAccess === 'unlimited') {
    return { allowed: true };
  }
  
  return { allowed: false, reason: 'unknown' };
};

export const PROMPT_VALUE_METRICS = {
  // Faktorer som ökar värdet på en prompt
  VALUE_MULTIPLIERS: {
    verified: 1.5,
    highRating: 1.3,
    frequentlyUsed: 1.2,
    recentlyUpdated: 1.1,
    hasExample: 1.2,
    hasVideo: 1.5,
    multiLanguage: 1.3,
  },
  
  // Kategorier med högre värde
  PREMIUM_CATEGORIES: [
    'Avancerad automation',
    'AI-integrationer',
    'Dataanalys',
    'Strategisk planering',
    'Ledarskap',
  ],
  
  // Yrken med högre betalningsvilja
  HIGH_VALUE_PROFESSIONS: [
    'VD', 'CEO', 'CFO', 'CTO',
    'Advokat', 'Läkare', 'Konsult',
    'Investerare', 'Företagsledare',
  ],
};
