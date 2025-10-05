// Helper functions for multi-language prompt support

export const SUPPORTED_LANGUAGES = {
  sv: { name: "Svenska", nativeName: "Svenska", flag: "🇸🇪" },
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  fr: { name: "French", nativeName: "Français", flag: "🇫🇷" },
  de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

interface PromptTranslations {
  name: string;
  description: string;
  challenge: string;
  solution: string;
  bestPractice: string;
  expectedOutcome: string;
  prompt: string;
}

interface PromptWithTranslations {
  id: string;
  language: string;
  name: string;
  description: string;
  challenge: string;
  solution: string;
  bestPractice: string;
  expectedOutcome: string;
  prompt: string;
  translations?: Record<string, PromptTranslations>;
  [key: string]: any;
}

/**
 * Get prompt content in the requested language
 * Falls back to original language if translation not available
 */
export function getPromptInLanguage(
  prompt: PromptWithTranslations,
  requestedLanguage: SupportedLanguage
): PromptWithTranslations {
  // If requesting the original language, return as is
  if (prompt.language === requestedLanguage) {
    return prompt;
  }

  // Check if translation exists
  const translation = prompt.translations?.[requestedLanguage];
  
  if (translation) {
    return {
      ...prompt,
      name: translation.name,
      description: translation.description,
      challenge: translation.challenge,
      solution: translation.solution,
      bestPractice: translation.bestPractice,
      expectedOutcome: translation.expectedOutcome,
      prompt: translation.prompt,
      _translatedFrom: prompt.language,
      _currentLanguage: requestedLanguage,
    };
  }

  // No translation available, return original with flag
  return {
    ...prompt,
    _noTranslation: true,
    _originalLanguage: prompt.language,
  };
}

/**
 * Get all prompts in the requested language
 */
export function getPromptsInLanguage(
  prompts: PromptWithTranslations[],
  requestedLanguage: SupportedLanguage
): PromptWithTranslations[] {
  return prompts.map(prompt => getPromptInLanguage(prompt, requestedLanguage));
}

/**
 * Check if a prompt needs translation
 */
export function needsTranslation(
  prompt: PromptWithTranslations,
  targetLanguage: SupportedLanguage
): boolean {
  if (prompt.language === targetLanguage) return false;
  return !prompt.translations?.[targetLanguage];
}

/**
 * Get list of languages a prompt is available in
 */
export function getAvailableLanguages(prompt: PromptWithTranslations): SupportedLanguage[] {
  const languages: SupportedLanguage[] = [prompt.language as SupportedLanguage];
  
  if (prompt.translations) {
    Object.keys(prompt.translations).forEach(lang => {
      if (!languages.includes(lang as SupportedLanguage)) {
        languages.push(lang as SupportedLanguage);
      }
    });
  }
  
  return languages;
}

/**
 * Calculate translation coverage for a set of prompts
 */
export function getTranslationCoverage(
  prompts: PromptWithTranslations[],
  targetLanguage: SupportedLanguage
): {
  total: number;
  translated: number;
  percentage: number;
  needsTranslation: string[];
} {
  const needsTranslationIds: string[] = [];
  let translated = 0;

  prompts.forEach(prompt => {
    if (prompt.language === targetLanguage || prompt.translations?.[targetLanguage]) {
      translated++;
    } else {
      needsTranslationIds.push(prompt.id);
    }
  });

  return {
    total: prompts.length,
    translated,
    percentage: Math.round((translated / prompts.length) * 100),
    needsTranslation: needsTranslationIds,
  };
}

/**
 * Profession name translations
 */
export const PROFESSION_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  "Lärare": {
    sv: "Lärare",
    en: "Teacher",
    es: "Profesor",
    fr: "Enseignant",
    de: "Lehrer",
  },
  "Ekonom": {
    sv: "Ekonom",
    en: "Economist",
    es: "Economista",
    fr: "Économiste",
    de: "Ökonom",
  },
  "Utvecklare": {
    sv: "Utvecklare",
    en: "Developer",
    es: "Desarrollador",
    fr: "Développeur",
    de: "Entwickler",
  },
  "Marknadsförare": {
    sv: "Marknadsförare",
    en: "Marketer",
    es: "Comercializador",
    fr: "Marketeur",
    de: "Vermarkter",
  },
  "Säljare": {
    sv: "Säljare",
    en: "Salesperson",
    es: "Vendedor",
    fr: "Vendeur",
    de: "Verkäufer",
  },
  "HR-specialist": {
    sv: "HR-specialist",
    en: "HR Specialist",
    es: "Especialista en RRHH",
    fr: "Spécialiste RH",
    de: "HR-Spezialist",
  },
  "Projektledare": {
    sv: "Projektledare",
    en: "Project Manager",
    es: "Gerente de Proyecto",
    fr: "Chef de Projet",
    de: "Projektleiter",
  },
  "Advokat": {
    sv: "Advokat",
    en: "Lawyer",
    es: "Abogado",
    fr: "Avocat",
    de: "Anwalt",
  },
  "Läkare": {
    sv: "Läkare",
    en: "Doctor",
    es: "Médico",
    fr: "Médecin",
    de: "Arzt",
  },
};

/**
 * Translate profession name
 */
export function translateProfession(
  profession: string,
  targetLanguage: SupportedLanguage
): string {
  return PROFESSION_TRANSLATIONS[profession]?.[targetLanguage] || profession;
}
