import Link from "next/link";

export default function GDPRPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-24 pb-24">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 space-y-6">
        <h1 className="text-3xl font-bold">GDPR</h1>
        <p className="text-gray-700">Manage your data rights under GDPR.</p>
        <div className="space-x-3">
          <Link href="/gdpr/exportera-data" className="minimal-button-outline">Exportera data</Link>
          <Link href="/gdpr/radera-data" className="minimal-button">Radera data</Link>
        </div>
      </div>
    </main>
  );
}


