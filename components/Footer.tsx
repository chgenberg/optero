"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/MENDIO_logo.png" 
                alt="MENDIO" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-gray-600 max-w-sm">
              {t('footer.tagline')}
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Produkt</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/business/bot-builder" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Bygg en bot
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Bot Marketplace
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Mina bots
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
            <h3 className="font-medium text-gray-900 mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/integritetspolicy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/anvandarvillkor" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/gdpr/exportera-data" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('footer.export')}
                </Link>
              </li>
              <li>
                <Link href="/gdpr/radera-data" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('footer.delete')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Christopher Genberg AB. {t('footer.rights')}
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
