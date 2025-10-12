"use client";

export default function FreePlanBanner() {
  return (
    <div className="mb-4 rounded-xl border-2 border-gray-900 bg-white p-3 text-sm text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="font-semibold">Free‑plan</span>: 50 meddelanden/dygn per bot, watermark i widget och publik chat.
        </div>
        <a href="/pricing" className="inline-block rounded-lg border-2 border-gray-900 bg-white px-3 py-1 font-semibold hover:bg-gray-50">
          Se prisplaner
        </a>
      </div>
    </div>
  );
}


