"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/mendio_logo.png" alt="Mendio" className="h-6" />
            </div>
            <p className="text-sm text-gray-600 max-w-sm">
              Gör vardagen lättare med AI. Hitta verktyg anpassade för ditt yrke och spara 5-15 timmar varje vecka.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Om Mendio</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/om" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Om oss
                </Link>
              </li>
              <li>
                <Link href="/prompts" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Prompt-bibliotek
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Juridiskt</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/integritetspolicy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Integritetspolicy
                </Link>
              </li>
              <li>
                <Link href="/anvandarvillkor" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Användarvillkor
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Christopher Genberg AB. Alla rättigheter förbehållna.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:ch.genberg@gmail.com" 
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                ch.genberg@gmail.com
              </a>
              <span className="text-gray-300">•</span>
              <a 
                href="tel:+46732305521" 
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                +46 732 30 55 21
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
