"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isSwedish = pathname?.startsWith('/sv') || false;
  const prefix = isSwedish ? '/sv' : '';
  return (
    <footer className="mt-auto border-t border-[#E5E7EB] bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="font-bold text-xl mb-3">MENDIO</h2>
            <p className="text-sm text-[#4B5563] leading-relaxed max-w-sm">
              AI chatbots that understand your business
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/bot" className="text-sm text-[#4B5563] hover:text-black transition-colors">
                  {isSwedish ? 'Bygg bot' : 'Build bot'}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/dashboard`} className="text-sm text-[#4B5563] hover:text-black transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/pricing`} className="text-sm text-[#4B5563] hover:text-black transition-colors">
                  {isSwedish ? 'Priser' : 'Pricing'}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={`${prefix}/privacy`} className="text-sm text-[#4B5563] hover:text-black transition-colors">
                  {isSwedish ? 'Integritet' : 'Privacy'}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/terms`} className="text-sm text-[#4B5563] hover:text-black transition-colors">
                  {isSwedish ? 'Villkor' : 'Terms'}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/gdpr`} className="text-sm text-[#4B5563] hover:text-black transition-colors">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#9CA3AF]">
              © {new Date().getFullYear()} Christopher Genberg AB
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:ch.genberg@gmail.com" 
                className="text-xs text-[#9CA3AF] hover:text-black transition-colors"
              >
                ch.genberg@gmail.com
              </a>
              <span className="text-[#E5E7EB]">·</span>
              <a 
                href="tel:+46732305521" 
                className="text-xs text-[#9CA3AF] hover:text-black transition-colors"
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
