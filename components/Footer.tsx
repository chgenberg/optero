"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="font-thin text-2xl tracking-wider uppercase mb-4">MENDIO</h2>
            <p className="text-sm text-gray-600 max-w-sm">
              AI-drivna chatbots som förstår din verksamhet
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-xs uppercase tracking-widest mb-6">Produkt</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/business/bot-builder" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Bygg bot
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Priser
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-xs uppercase tracking-widest mb-6">Juridiskt</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/integritetspolicy" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Integritet
                </Link>
              </li>
              <li>
                <Link href="/anvandarvillkor" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Villkor
                </Link>
              </li>
              <li>
                <Link href="/gdpr/exportera-data" className="text-sm text-gray-600 hover:text-black transition-colors">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              © {new Date().getFullYear()} Christopher Genberg AB
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="mailto:ch.genberg@gmail.com" 
                className="text-xs text-gray-500 hover:text-black transition-colors"
              >
                ch.genberg@gmail.com
              </a>
              <a 
                href="tel:+46732305521" 
                className="text-xs text-gray-500 hover:text-black transition-colors"
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
