"use client";

export default function IntegritetspolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 animate-gradient"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-8 animate-fade-in-up">
            INTEGRITETSPOLICY
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Din integritet är viktig för oss
          </p>
          <p className="text-sm text-gray-500 mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="card p-8 mb-8 animate-fade-in-up">
            <p className="text-lg text-gray-700 leading-relaxed">
              Christopher Genberg AB ("vi", "oss" eller "vårt"), organisationsnummer 559318-7089, värnar om din personliga integritet. 
              Denna integritetspolicy förklarar hur vi samlar in, använder och skyddar dina personuppgifter när du använder vår tjänst Optero.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">1</span>
                Vilka uppgifter vi samlar in
              </h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold text-gray-900">Information du ger oss:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>E-postadress (när du registrerar dig för att få dina resultat)</li>
                  <li>Yrkesinformation (profession, specialisering, arbetsuppgifter)</li>
                  <li>Preferenser och utmaningar i ditt arbete</li>
                </ul>
                
                <h3 className="font-semibold text-gray-900 mt-6">Information vi samlar in automatiskt:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Teknisk information (IP-adress, webbläsartyp, enhetsinformation)</li>
                  <li>Användningsdata (vilka sidor du besöker, hur länge du stannar)</li>
                  <li>Cookies och liknande teknologier</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">2</span>
                Hur vi använder dina uppgifter
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="mb-4">Vi använder dina personuppgifter för att:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tillhandahålla personliga AI-rekommendationer för ditt yrke</li>
                  <li>Förbättra och utveckla vår tjänst baserat på användarmönster</li>
                  <li>Skicka dig dina resultat via e-post (om du begärt det)</li>
                  <li>Kommunicera med dig om uppdateringar eller nya funktioner</li>
                  <li>Analysera användningstrender för att förbättra användarupplevelsen</li>
                  <li>Uppfylla juridiska skyldigheter</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">3</span>
                Delning av information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Vi säljer aldrig dina personuppgifter. Vi kan dela information med:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Tjänsteleverantörer:</strong> Som hjälper oss driva tjänsten (t.ex. hosting, analys)</li>
                  <li><strong>AI-tjänster:</strong> För att generera dina personliga rekommendationer (anonymiserat)</li>
                  <li><strong>Juridiska krav:</strong> Om lagen kräver det</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">4</span>
                Lagring och säkerhet
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vi lagrar dina uppgifter endast så länge som nödvändigt för att tillhandahålla tjänsten. 
                  Vi använder branschstandard säkerhetsåtgärder för att skydda dina uppgifter, inklusive:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Krypterad dataöverföring (HTTPS)</li>
                  <li>Säker serverlagring hos betrodda leverantörer</li>
                  <li>Begränsad åtkomst till personuppgifter</li>
                  <li>Regelbundna säkerhetsuppdateringar</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">5</span>
                Dina rättigheter
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Enligt GDPR har du rätt att:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Få tillgång</strong> till dina personuppgifter</li>
                  <li><strong>Rätta</strong> felaktiga uppgifter</li>
                  <li><strong>Radera</strong> dina uppgifter ("rätten att bli glömd")</li>
                  <li><strong>Begränsa</strong> behandlingen av dina uppgifter</li>
                  <li><strong>Dataportabilitet</strong> - få dina uppgifter i maskinläsbart format</li>
                  <li><strong>Invända</strong> mot behandling</li>
                  <li><strong>Återkalla samtycke</strong> när som helst</li>
                </ul>
                <p className="mt-4">
                  För att utöva dessa rättigheter, kontakta oss på: <a href="mailto:ch.genberg@gmail.com" className="text-gray-900 underline">ch.genberg@gmail.com</a>
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">6</span>
                Cookies
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Vi använder cookies för att:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Komma ihåg dina preferenser</li>
                  <li>Analysera hur tjänsten används</li>
                  <li>Förbättra användarupplevelsen</li>
                </ul>
                <p className="mt-4">
                  Du kan blockera cookies i din webbläsare, men vissa funktioner kanske inte fungerar korrekt.
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">7</span>
                Kontaktinformation
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>För frågor om denna integritetspolicy eller dina personuppgifter, kontakta:</p>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="font-semibold text-gray-900">Christopher Genberg AB</p>
                  <p>Södra Skjutbanevägen 10</p>
                  <p>439 55 Åsa</p>
                  <p className="mt-3">
                    E-post: <a href="mailto:ch.genberg@gmail.com" className="text-gray-900 underline">ch.genberg@gmail.com</a>
                  </p>
                  <p>
                    Telefon: <a href="tel:+46732305521" className="text-gray-900 underline">+46 732 30 55 21</a>
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center py-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <p className="text-gray-600 mb-6">Har du frågor om hur vi hanterar dina uppgifter?</p>
              <a
                href="/kontakt"
                className="btn-primary inline-flex items-center gap-3"
              >
                Kontakta oss
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
