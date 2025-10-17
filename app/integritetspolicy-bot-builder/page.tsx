import React from 'react';

export default function BotBuilderPrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-light text-gray-900 mb-8">
          Privacy Policy for Bot Builder
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Overview</h2>
            <p>
              When you use our Bot Builder we collect and store information to create your AI bot 
              and improve the service. This policy explains what data we collect, how we use it, 
              and your rights under GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Data we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email address:</strong> To create your account and send bot information</li>
              <li><strong>Website URL:</strong> To analyze and scrape content from your website</li>
              <li><strong>Website content:</strong> Text, structure, colors and fonts from your website</li>
              <li><strong>Bot configuration:</strong> Your choices (color, font, tone, problem type)</li>
              <li><strong>Conversation data:</strong> Q&A from interview process and bot chats</li>
              <li><strong>Usage statistics:</strong> Messages, clicks, and interactions with your bot</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">How we use your data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and train your AI bot based on your website and needs</li>
              <li>Improve bot quality by analyzing common questions and answers</li>
              <li>Send you reports and insights about your bot performance</li>
              <li>Provide recommendations to improve your bot over time</li>
              <li>Provide customer support and technical assistance</li>
              <li>Develop and improve our service overall (anonymized data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Data storage and security</h2>
            <p className="mb-3">
              All data is stored securely in our database with encryption and access controls. 
              We use industry standards to protect your information.
            </p>
            <p>
              <strong>Retention:</strong> We store your data as long as your account is active. 
              If you delete your account, all data is removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Your rights (GDPR)</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of all data we have about you</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
              <li><strong>Erasure:</strong> Delete your account and associated data</li>
              <li><strong>Portability:</strong> Export your data in machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain processing</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise your rights, contact us at:{' '}
              <a href="mailto:privacy@mendio.se" className="text-blue-600 hover:underline">
                privacy@mendio.se
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Third-party sharing</h2>
            <p>
              We do <strong>not</strong> share your data with third parties for marketing purposes. 
              We may share data with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>OpenAI:</strong> For AI model processing (anonymized where possible)</li>
              <li><strong>Hosting providers:</strong> For data storage and operations (Railway, Vercel)</li>
              <li><strong>Analytics tools:</strong> To understand usage (anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Cookies and tracking</h2>
            <p>
              We use technical cookies to ensure the Bot Builder functions correctly. 
              No marketing cookies are used without your consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Changes to this policy</h2>
            <p>
              We may update this policy as needed. Material changes will be notified by email.
              <br />
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Contact</h2>
            <p>
              For questions about this privacy policy or your data, contact us:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p><strong>Email:</strong> privacy@mendio.se</p>
              <p><strong>Website:</strong> mendio.se</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <a 
              href="/business/bot-builder" 
              className="inline-block px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Bot Builder
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

