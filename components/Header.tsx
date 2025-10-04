"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2 group">
              <Image 
                src="/mendio_logo.png" 
                alt="Mendio" 
                width={28}
                height={28}
                className="transition-transform group-hover:scale-105"
                priority
              />
            </a>
          </div>
        </div>
      </header>
  );
}
