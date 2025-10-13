"use client";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="font-thin text-2xl tracking-wider uppercase">
            MENDIO
          </a>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <a
              href="/business/bot-builder"
              className="text-xs uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
            >
              Bygg bot
            </a>
            <a
              href="/dashboard"
              className="text-xs uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/kontakt"
              className="text-xs uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
            >
              Kontakt
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
