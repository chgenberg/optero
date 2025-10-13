"use client";

import { useState } from "react";

interface InstallationGuideProps {
  platform: "wordpress" | "wix" | "squarespace" | "other";
  snippet: string;
  onClose: () => void;
}

export function InstallationGuide({ platform, snippet, onClose }: InstallationGuideProps) {
  const guides = {
    wordpress: {
      title: "WordPress Installation",
      steps: [
        {
          title: "Logga in på WordPress admin",
          description: "Gå till din WordPress-admin (vanligtvis dinwebbplats.se/wp-admin)"
        },
        {
          title: "Öppna Appearance → Theme File Editor",
          description: "Navigera till Appearance (Utseende) → Theme File Editor i vänstermenyn"
        },
        {
          title: "Välj header.php",
          description: "I högra panelen, klicka på 'Theme Header (header.php)'"
        },
        {
          title: "Hitta </head>",
          description: "Scrolla ner och hitta den stängande </head> taggen (vanligtvis nära slutet av filen)"
        },
        {
          title: "Klistra in koden",
          description: "Klistra in snippet-koden direkt FÖRE </head>"
        },
        {
          title: "Spara",
          description: "Klicka på 'Update File' längst ner"
        },
        {
          title: "Klart!",
          description: "Besök din webbplats och du ska se bot-ikonen i nedre högra hörnet"
        }
      ],
      tip: "Om Theme File Editor inte syns: gå till Plugins → Add New → sök 'Insert Headers and Footers' → installera och använd den för att klistra in koden."
    },
    wix: {
      title: "Wix Installation",
      steps: [
        {
          title: "Logga in på Wix Editor",
          description: "Öppna din Wix-sida i editorn"
        },
        {
          title: "Öppna Settings",
          description: "Klicka på Settings (kugghjul) i vänstermenyn"
        },
        {
          title: "Custom Code",
          description: "Navigera till 'Custom Code' i Settings-menyn"
        },
        {
          title: "Add Custom Code",
          description: "Klicka på '+ Add Custom Code' högst upp"
        },
        {
          title: "Klistra in snippet",
          description: "Klistra in koden, välj 'Head' som placering och 'All pages'"
        },
        {
          title: "Namnge och spara",
          description: "Ge den ett namn (t.ex. 'Mendio Bot') och klicka 'Apply'"
        },
        {
          title: "Publicera",
          description: "Klicka 'Publish' i övre högra hörnet för att aktivera ändringarna"
        }
      ],
      tip: "Custom Code är endast tillgängligt på Premium-planer. Om du har en gratis plan, uppgradera först."
    },
    squarespace: {
      title: "Squarespace Installation",
      steps: [
        {
          title: "Logga in",
          description: "Gå till din Squarespace-admin"
        },
        {
          title: "Settings → Advanced",
          description: "Klicka på Settings i vänstermenyn, sedan Advanced"
        },
        {
          title: "Code Injection",
          description: "Välj 'Code Injection' i Advanced-menyn"
        },
        {
          title: "Header-sektion",
          description: "Scrolla till 'HEADER' sektionen"
        },
        {
          title: "Klistra in",
          description: "Klistra in snippet-koden i Header-fältet"
        },
        {
          title: "Spara",
          description: "Klicka 'Save' högst upp"
        },
        {
          title: "Klart!",
          description: "Boten är nu live på alla sidor"
        }
      ],
      tip: "Code Injection är tillgängligt på Business-planer och uppåt."
    },
    other: {
      title: "Manuell Installation",
      steps: [
        {
          title: "Kopiera snippet",
          description: "Kopiera installationskoden ovan"
        },
        {
          title: "Öppna din HTML-fil",
          description: "Öppna HTML-filen för din webbplats (t.ex. index.html)"
        },
        {
          title: "Hitta </head>",
          description: "Leta upp den stängande </head> taggen"
        },
        {
          title: "Klistra in före </head>",
          description: "Placera koden direkt ovanför </head>"
        },
        {
          title: "Spara och ladda upp",
          description: "Spara filen och ladda upp till din server via FTP/hosting-panel"
        },
        {
          title: "Verifiera",
          description: "Besök din webbplats och kontrollera att bot-ikonen visas"
        }
      ],
      tip: "Behöver du hjälp? Kontakta support på support@mendio.se eller chatta med oss."
    }
  };

  const guide = guides[platform];
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-light text-gray-900">{guide.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-8">
            {guide.steps.map((_, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx <= currentStep
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < guide.steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${idx < currentStep ? "bg-black" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Current step */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Steg {currentStep + 1}: {guide.steps[currentStep].title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {guide.steps[currentStep].description}
            </p>

            {/* Show snippet on step where they paste */}
            {currentStep === guide.steps.findIndex(s => s.title.toLowerCase().includes("klistra")) && (
              <div className="mt-4">
                <pre className="bg-gray-50 rounded-xl p-4 text-sm font-mono text-gray-700 overflow-x-auto">
{snippet}
                </pre>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Föregående
            </button>

            {currentStep < guide.steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-minimal"
              >
                Nästa →
              </button>
            ) : (
              <button onClick={onClose} className="btn-minimal">
                Stäng
              </button>
            )}
          </div>

          {/* Tip at bottom */}
          {guide.tip && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Tips:</strong> {guide.tip}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InstallationGuideButton({ 
  platform, 
  snippet 
}: { 
  platform: "wordpress" | "wix" | "squarespace" | "other"; 
  snippet: string;
}) {
  const [showGuide, setShowGuide] = useState(false);

  const labels = {
    wordpress: { name: "WordPress", desc: "Steg-för-steg guide" },
    wix: { name: "Wix", desc: "Steg-för-steg guide" },
    squarespace: { name: "Squarespace", desc: "Steg-för-steg guide" },
    other: { name: "Annat", desc: "Kontakta support" }
  };

  const label = labels[platform];

  return (
    <>
      <button 
        onClick={() => setShowGuide(true)}
        className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="font-medium mb-1">{label.name}</div>
        <div className="text-gray-600 text-sm">{label.desc}</div>
      </button>

      {showGuide && (
        <InstallationGuide
          platform={platform}
          snippet={snippet}
          onClose={() => setShowGuide(false)}
        />
      )}
    </>
  );
}
