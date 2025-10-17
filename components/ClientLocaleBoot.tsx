"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientLocaleBoot() {
  const router = useRouter();
  const pathname = usePathname();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // run once
    ran.current = true;
    try {
      const pref = typeof window !== 'undefined' ? localStorage.getItem('preferredLang') : null;
      if (!pref) return;

      const search = typeof window !== 'undefined' ? window.location.search : '';
      if (pref === 'sv' && pathname && !pathname.startsWith('/sv')) {
        router.replace(`/sv${pathname}${search}`);
        return;
      }
      if (pref === 'en' && pathname && pathname.startsWith('/sv')) {
        router.replace(`${pathname.replace(/^\/sv/, '') || '/'}${search}`);
      }
    } catch {}
  }, [pathname, router]);

  return null;
}


