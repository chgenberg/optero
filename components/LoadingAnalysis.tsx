"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Headphones, BookOpen, Clock, Zap, TrendingUp, Sparkles, Award } from "lucide-react";

interface LoadingFact {
  sv: string;
  en: string;
  es: string;
  fr: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LOADING_FACTS: LoadingFact[] = [
  {
    sv: "GPT-5 kan skriva en 10-sidig rapport på 30 sekunder som annars tar 3 timmar manuellt.",
    en: "GPT-5 can write a 10-page report in 30 seconds that would take 3 hours manually.",
    es: "GPT-5 puede escribir un informe de 10 páginas en 30 segundos que tardaría 3 horas manualmente.",
    fr: "GPT-5 peut rédiger un rapport de 10 pages en 30 secondes qui prendrait 3 heures manuellement.",
    icon: FileText
  },
  {
    sv: "AI-assistenter kan svara på kundfrågor 24/7 och löser 80% av ärenden utan mänsklig hjälp.",
    en: "AI assistants can answer customer queries 24/7 and resolve 80% of cases without human help.",
    es: "Los asistentes de IA pueden responder consultas 24/7 y resolver el 80% de los casos sin ayuda humana.",
    fr: "Les assistants IA peuvent répondre aux demandes 24/7 et résoudre 80% des cas sans aide humaine.",
    icon: Headphones
  },
  {
    sv: "Claude kan analysera 100,000 ord text (en hel bok!) på bara några sekunder.",
    en: "Claude can analyze 100,000 words of text (an entire book!) in just seconds.",
    es: "Claude puede analizar 100,000 palabras de texto (¡un libro entero!) en solo segundos.",
    fr: "Claude peut analyser 100 000 mots de texte (un livre entier!) en quelques secondes.",
    icon: BookOpen
  },
  {
    sv: "Företag som använder AI för dokumenthantering sparar i snitt 8 timmar per anställd varje vecka.",
    en: "Companies using AI for document processing save an average of 8 hours per employee each week.",
    es: "Las empresas que usan IA para procesar documentos ahorran un promedio de 8 horas por empleado cada semana.",
    fr: "Les entreprises utilisant l'IA pour le traitement des documents économisent en moyenne 8 heures par employé chaque semaine.",
    icon: Clock
  },
  {
    sv: "AI kan lära sig din skrivstil och skapa texter som låter exakt som du på sekunder.",
    en: "AI can learn your writing style and create texts that sound exactly like you in seconds.",
    es: "La IA puede aprender tu estilo de escritura y crear textos que suenan exactamente como tú en segundos.",
    fr: "L'IA peut apprendre votre style d'écriture et créer des textes qui vous ressemblent en quelques secondes.",
    icon: Zap
  },
  {
    sv: "Rätt AI-prompts kan öka kvaliteten på output med upp till 300% jämfört med enkla frågor.",
    en: "The right AI prompts can increase output quality by up to 300% compared to simple queries.",
    es: "Los prompts de IA correctos pueden aumentar la calidad del output hasta un 300% comparado con consultas simples.",
    fr: "Les bons prompts IA peuvent augmenter la qualité de sortie jusqu'à 300% par rapport aux requêtes simples.",
    icon: TrendingUp
  },
  {
    sv: "GPT-5 tränas på data motsvarande 10 miljoner böcker och blir smartare varje dag.",
    en: "GPT-5 is trained on data equivalent to 10 million books and gets smarter every day.",
    es: "GPT-5 se entrena con datos equivalentes a 10 millones de libros y se vuelve más inteligente cada día.",
    fr: "GPT-5 est entraîné sur des données équivalentes à 10 millions de livres et devient plus intelligent chaque jour.",
    icon: Sparkles
  },
  {
    sv: "90% av framtidens jobb kommer kräva AI-kompetens - du ligger steget före!",
    en: "90% of future jobs will require AI skills - you're staying ahead!",
    es: "El 90% de los trabajos futuros requerirán habilidades de IA - ¡estás un paso adelante!",
    fr: "90% des emplois futurs nécessiteront des compétences en IA - vous gardez une longueur d'avance!",
    icon: Award
  }
];

export default function LoadingAnalysis() {
  const { t, locale } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    // Slower progress animation over ~2.5 minutes (150 seconds)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Stop at 95% and wait for actual data
        if (prev >= 95) {
          return prev;
        }
        // Very slow linear progression: 95% over 150 seconds = ~0.633% per second
        // With 100ms intervals = ~0.0633% per interval
        return prev + 0.0633;
      });
    }, 100);

    // Change fact every 10 seconds for better reading time
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % LOADING_FACTS.length);
    }, 10000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(factInterval);
    };
  }, []);

  const currentFact = LOADING_FACTS[currentFactIndex];

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full">
        {/* Animated border container - same as hero */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-1000 group-hover:duration-200 animate-gradient-x overflow-hidden"></div>
          
          {/* Content */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 space-y-8">
        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Genererar makalösa AI-lösningar...
          </h3>
          <p className="text-gray-600">
            {progress < 30 && "Analyserar dina arbetsuppgifter med GPT-5..."}
            {progress >= 30 && progress < 60 && "Skapar skräddarsydda prompts för ditt yrke..."}
            {progress >= 60 && progress < 90 && "Optimerar lösningar för maximal tidsbesparing..."}
            {progress >= 90 && "Slutför din personliga AI-guide..."}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Detta kan ta upp till 2,5 minuter för bästa resultat
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-900 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {/* Pulsing effect */}
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-6 left-0 text-sm text-gray-500">
            {Math.round(Math.min(progress, 100))}%
          </div>
        </div>

        {/* Interesting fact */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in">
          <div className="flex items-start gap-3">
            {(() => {
              const Icon = currentFact.icon;
              return <Icon className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />;
            })()}
            <p className="text-gray-700 leading-relaxed">
              {currentFact[locale as keyof Omit<LoadingFact, 'icon'>]}
            </p>
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gray-900 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}