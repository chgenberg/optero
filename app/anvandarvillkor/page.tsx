"use client";

export default function AnvandarvillkorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 animate-gradient"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-8 animate-fade-in-up">
            TERMS OF SERVICE
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Terms for using Optero
          </p>
          <p className="text-sm text-gray-500 mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Effective from: {new Date().toLocaleDateString('en-US')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="card p-8 mb-8 animate-fade-in-up">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to Optero! These Terms of Service ("Terms") govern your use of our service.
              By using Optero you agree to these Terms. If you do not agree, please do not use the service.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">1</span>
                About the service
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Optero helps users find AI tools tailored to their profession.
                  We provide personalized recommendations based on your role, specialization and tasks.
                </p>
                <p>
                  The service is operated by Christopher Genberg AB (reg. no. 559318-7089).
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">2</span>
                Use of the service
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="mb-4">When using Optero you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tillhandahålla korrekt information om ditt yrke och arbetsuppgifter</li>
                  <li>Använda tjänsten för lagliga ändamål</li>
                  <li>Inte försöka skada, överbelasta eller störa tjänstens funktion</li>
                  <li>Inte kopiera, modifiera eller distribuera tjänstens innehåll utan tillstånd</li>
                  <li>Respektera immateriella rättigheter</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">3</span>
                Intellectual property
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Allt innehåll på Optero, inklusive text, grafik, logotyper, ikoner och programvara, 
                  ägs av Christopher Genberg AB eller våra licensgivare och skyddas av svensk och internationell 
                  upphovsrättslagstiftning.
                </p>
                <p>
                  Du får en begränsad, icke-exklusiv, icke-överlåtbar licens att använda tjänsten för personligt bruk.
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">4</span>
                Limitation of liability
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Optero tillhandahålls "som den är" utan några garantier. Vi garanterar inte att:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tjänsten alltid kommer vara tillgänglig eller felfri</li>
                  <li>Rekommendationerna passar alla användares specifika behov</li>
                  <li>Resultaten från AI-verktygen alltid är korrekta eller fullständiga</li>
                </ul>
                <p className="mt-4">
                  Christopher Genberg AB ansvarar inte för indirekta skador, förlorad vinst eller andra 
                  följdskador som uppstår från användningen av tjänsten.
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">5</span>
                User content
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  När du tillhandahåller information till Optero (t.ex. yrkesuppgifter, arbetsuppgifter) 
                  ger du oss rätt att använda denna information för att:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Generera personliga rekommendationer</li>
                  <li>Förbättra och utveckla tjänsten</li>
                  <li>Skapa anonymiserad statistik</li>
                </ul>
                <p className="mt-4">
                  Du behåller alla rättigheter till ditt innehåll och ansvarar för att det inte kränker 
                  tredje parts rättigheter.
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">6</span>
                Changes to terms
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vi förbehåller oss rätten att när som helst ändra dessa användarvillkor. 
                  Väsentliga ändringar meddelas via e-post eller genom en notis på webbplatsen.
                </p>
                <p>
                  Fortsatt användning av tjänsten efter ändringar innebär att du accepterar de nya villkoren.
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">7</span>
                Termination
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Du kan när som helst sluta använda Optero. Vi förbehåller oss rätten att 
                  stänga av eller begränsa din åtkomst till tjänsten om vi misstänker att du 
                  bryter mot dessa villkor.
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">8</span>
                Governing law and disputes
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Dessa villkor regleras av svensk lag. Eventuella tvister ska i första hand 
                  lösas genom förhandling. Om överenskommelse inte kan nås ska tvisten avgöras 
                  av svensk domstol.
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">9</span>
                Contact
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>For questions about these Terms, contact:</p>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="font-semibold text-gray-900">Christopher Genberg AB</p>
                  <p>E-post: <a href="mailto:ch.genberg@gmail.com" className="text-gray-900 underline">ch.genberg@gmail.com</a></p>
                  <p>Telefon: <a href="tel:+46732305521" className="text-gray-900 underline">+46 732 30 55 21</a></p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center py-8 animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <p className="text-gray-600 mb-6">Do you have questions about our terms?</p>
              <a
                href="/kontakt"
                className="btn-primary inline-flex items-center gap-3"
              >
                Contact us
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
