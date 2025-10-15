"use client";

export default function IntegritetspolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 animate-gradient"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-8 animate-fade-in-up">
            PRIVACY POLICY
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Your privacy is important to us
          </p>
          <p className="text-sm text-gray-500 mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="card p-8 mb-8 animate-fade-in-up">
            <p className="text-lg text-gray-700 leading-relaxed">
              Christopher Genberg AB ("we", "us" or "our"), company reg. 559318-7089, cares about your privacy.
              This privacy policy explains how we collect, use and protect your personal data when you use our service Mendio.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">1</span>
                What data we collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold text-gray-900">Information you provide:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email address (when you sign up to receive your results)</li>
                  <li>Professional information (profession, specialization, responsibilities)</li>
                  <li>Preferences and challenges in your work</li>
                </ul>
                
                <h3 className="font-semibold text-gray-900 mt-6">Information we collect automatically:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Technical information (IP address, browser type, device information)</li>
                  <li>Usage data (which pages you visit, how long you stay)</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">2</span>
                How we use your data
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="mb-4">We use your personal data to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide personalized AI recommendations for your profession</li>
                  <li>Improve and develop our service based on usage patterns</li>
                  <li>Email your results to you (if requested)</li>
                  <li>Communicate updates or new features</li>
                  <li>Analyze usage trends to improve the user experience</li>
                  <li>Fulfill legal obligations</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">3</span>
                Sharing of information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We never sell your personal data. We may share information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service providers:</strong> Who help operate the service (e.g., hosting, analytics)</li>
                  <li><strong>AI services:</strong> To generate personalized recommendations (anonymized where possible)</li>
                  <li><strong>Legal requirements:</strong> When required by law</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">4</span>
                Storage and security
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We store your data only as long as necessary to provide the service.
                  We use industry-standard security measures to protect your data, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encrypted data transfer (HTTPS)</li>
                  <li>Secure server storage with trusted providers</li>
                  <li>Restricted access to personal data</li>
                  <li>Regular security updates</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">5</span>
                Your rights
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Under GDPR you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access</strong> your personal data</li>
                  <li><strong>Rectify</strong> inaccurate information</li>
                  <li><strong>Erase</strong> your data ("right to be forgotten")</li>
                  <li><strong>Restrict</strong> processing of your data</li>
                  <li><strong>Data portability</strong> – receive your data in machine-readable format</li>
                  <li><strong>Object</strong> to processing</li>
                  <li><strong>Withdraw consent</strong> at any time</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact us at: <a href="mailto:ch.genberg@gmail.com" className="text-gray-900 underline">ch.genberg@gmail.com</a>
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">6</span>
                Cookies
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences</li>
                  <li>Analyze how the service is used</li>
                  <li>Improve the user experience</li>
                </ul>
                <p className="mt-4">
                  You can block cookies in your browser, but some features may not work correctly.
                </p>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">7</span>
                Data Protection Officer
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our Data Protection Officer ensures compliance with data protection law
                  and is your contact for all personal data questions.
                </p>
                <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-gray-900">
                  <p className="font-semibold text-gray-900 mb-2">Data Protection Officer:</p>
                  <p className="font-medium text-gray-900">Christopher Genberg</p>
                  <p className="text-sm text-gray-600 mt-1">Christopher Genberg AB</p>
                  <div className="mt-4 space-y-2">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href="mailto:ch.genberg@gmail.com" className="text-gray-900 underline">ch.genberg@gmail.com</a>
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href="tel:+46732305521" className="text-gray-900 underline">+46 732 30 55 21</a>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  You can contact our DPO to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                  <li>Ask questions about how we process your personal data</li>
                  <li>Exercise your GDPR rights</li>
                  <li>Report any data protection issues</li>
                  <li>Get information about our data protection practices</li>
                </ul>
              </div>
            </section>

            <section className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">8</span>
                Contact information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>For general questions about the service or this privacy policy:</p>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="font-semibold text-gray-900">Christopher Genberg AB</p>
                  <p>Organisationsnummer: 559318-7089</p>
                  <p>Södra Skjutbanevägen 10</p>
                  <p>439 55 Åsa</p>
                  <p className="mt-3">
                    Email: <a href="mailto:ch.genberg@gmail.com" className="text-gray-900 underline">ch.genberg@gmail.com</a>
                  </p>
                  <p>
                    Phone: <a href="tel:+46732305521" className="text-gray-900 underline">+46 732 30 55 21</a>
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center py-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <p className="text-gray-600 mb-6">Questions about how we handle your data?</p>
              <a
                href="/contact"
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
