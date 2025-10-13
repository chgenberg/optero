import React from 'react';

export default function BotBuilderPrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-light text-gray-900 mb-8">
          Integritetspolicy för Bot Builder
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Översikt</h2>
            <p>
              När du använder vår Bot Builder samlar vi in och lagrar information för att skapa din AI-bot 
              och förbättra tjänsten. Denna policy beskriver vilken data vi samlar in, hur vi använder den, 
              och dina rättigheter enligt GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Data vi samlar in</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>E-postadress:</strong> För att skapa ditt konto och skicka dig information om din bot</li>
              <li><strong>Webbplats-URL:</strong> För att analysera och scrapa innehåll från din webbplats</li>
              <li><strong>Webbplatsinnehåll:</strong> Text, struktur, färger och typsnitt från din webbplats</li>
              <li><strong>Bot-konfiguration:</strong> De val du gör (färg, typsnitt, ton, problemtyp)</li>
              <li><strong>Konversationsdata:</strong> Frågor och svar från intervjuprocessen och botens chattar</li>
              <li><strong>Användningsstatistik:</strong> Antal meddelanden, klick, och interaktioner med din bot</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Hur vi använder din data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Skapa och träna din AI-bot baserat på din webbplats och dina behov</li>
              <li>Förbättra bot-kvaliteten genom att analysera vanliga frågor och svar</li>
              <li>Skicka dig rapporter och insikter om hur din bot presterar</li>
              <li>Ge dig rekommendationer för att förbättra din bot över tid</li>
              <li>Tillhandahålla kundsupport och teknisk assistans</li>
              <li>Utveckla och förbättra vår tjänst generellt (anonymiserad data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Datalagring och säkerhet</h2>
            <p className="mb-3">
              All data lagras säkert i vår databas med kryptering och åtkomstkontroller. 
              Vi använder branschstandarder för att skydda din information.
            </p>
            <p>
              <strong>Lagringstid:</strong> Vi lagrar din data så länge ditt konto är aktivt. 
              Om du raderar ditt konto tas all data bort inom 30 dagar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Dina rättigheter (GDPR)</h2>
            <p className="mb-3">Du har rätt att:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Tillgång:</strong> Begära en kopia av all data vi har om dig</li>
              <li><strong>Rättelse:</strong> Korrigera felaktig eller ofullständig information</li>
              <li><strong>Radering:</strong> Radera ditt konto och all associerad data</li>
              <li><strong>Dataportabilitet:</strong> Exportera din data i maskinläsbart format</li>
              <li><strong>Invändning:</strong> Invända mot viss databehandling</li>
              <li><strong>Återkalla samtycke:</strong> När som helst återkalla ditt samtycke</li>
            </ul>
            <p className="mt-4">
              För att utöva dina rättigheter, kontakta oss på:{' '}
              <a href="mailto:privacy@mendio.se" className="text-blue-600 hover:underline">
                privacy@mendio.se
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Delning med tredje part</h2>
            <p>
              Vi delar <strong>inte</strong> din data med tredje part för marknadsföringsändamål. 
              Vi kan dela data med:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>OpenAI:</strong> För AI-modellbearbetning (anonymiserad när det är möjligt)</li>
              <li><strong>Hostingleverantörer:</strong> För datalagring och drift (Railway, Vercel)</li>
              <li><strong>Analysverktyg:</strong> För att förstå hur tjänsten används (anonymiserad)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Cookies och spårning</h2>
            <p>
              Vi använder tekniska cookies för att Bot Builder ska fungera korrekt. 
              Inga marknadsföringscookies används utan ditt samtycke.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Ändringar i policyn</h2>
            <p>
              Vi kan uppdatera denna policy vid behov. Väsentliga ändringar meddelas via e-post.
              <br />
              <strong>Senast uppdaterad:</strong> {new Date().toLocaleDateString('sv-SE')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Kontakt</h2>
            <p>
              För frågor om denna integritetspolicy eller din data, kontakta oss:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p><strong>E-post:</strong> privacy@mendio.se</p>
              <p><strong>Webbplats:</strong> mendio.se</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <a 
              href="/business/bot-builder" 
              className="inline-block px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Tillbaka till Bot Builder
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

