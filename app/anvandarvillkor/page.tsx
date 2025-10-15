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
                Welcome to Mendio! These Terms of Service ("Terms") govern your use of our service.
                By using Mendio you agree to these Terms. If you do not agree, please do not use the service.
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
                  Mendio helps businesses design, build and deploy AI chatbots and assistants.
                  We provide analysis, recommendations, and tools to create customized bots for your use cases.
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
                <p className="mb-4">When using Mendio you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate information and use the service for lawful purposes</li>
                  <li>Not attempt to harm, overload, or disrupt the service</li>
                  <li>Not copy, modify, or distribute the service content without permission</li>
                  <li>Respect intellectual property rights</li>
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
                  All content on Mendio, including text, graphics, logos, icons and software, 
                  is owned by Christopher Genberg AB or our licensors and protected by applicable 
                  copyright laws.
                </p>
                <p>
                  You are granted a limited, non-exclusive, non-transferable license to use the service for business use.
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
                  Mendio is provided "as is" without warranties. We do not guarantee that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The service will always be available or error-free</li>
                  <li>Recommendations fit every user’s specific needs</li>
                  <li>AI outputs are always accurate or complete</li>
                </ul>
                <p className="mt-4">
                  Christopher Genberg AB is not liable for indirect damages, lost profits, or other
                  consequential damages arising from use of the service.
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
                  When you provide information to Mendio (e.g., website, documents, bot configuration),
                  you grant us the right to use this information to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Generate personalized recommendations</li>
                  <li>Improve and develop the service</li>
                  <li>Create anonymized statistics</li>
                </ul>
                <p className="mt-4">
                  You retain all rights to your content and are responsible that it does not infringe
                  third-party rights.
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
                  We reserve the right to modify these Terms at any time. Material changes will be
                  notified via email or a notice on the website.
                </p>
                <p>
                  Continued use of the service after changes means you accept the new terms.
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
                  You may stop using Mendio at any time. We reserve the right to suspend or limit
                  access if we suspect a breach of these Terms.
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
                  These Terms are governed by Swedish law. Disputes shall first be attempted to
                  be resolved amicably. If no agreement is reached, the dispute shall be resolved in Swedish courts.
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
