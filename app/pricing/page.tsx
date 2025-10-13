export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20 pb-20">
        <div className="mb-6">
          <div className="rounded-xl border-2 border-gray-900 bg-white p-3 text-sm text-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="font-semibold">Free‑plan</span>: 50 meddelanden/dygn per bot, watermark i widget och publik chat.
              </div>
              <a href="#buy" className="inline-block rounded-lg border-2 border-gray-900 bg-white px-3 py-1 font-semibold hover:bg-gray-50">
                Uppgradera
              </a>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-8">Prisplaner</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <div className="text-xl font-bold mb-2">Free</div>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>50 meddelanden/dygn per bot</li>
              <li>Watermark i widget och publik chat</li>
              <li>DD‑analys, bot‑playbooks, ROI, approvals</li>
            </ul>
          </div>
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <div className="text-xl font-bold mb-2">Pro (snart)</div>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Högre gränser + ingen watermark</li>
              <li>OAuth‑integrationer (Gmail/HubSpot/Zendesk)</li>
              <li>Versionering, eval‑suite, SSO/RBAC</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


