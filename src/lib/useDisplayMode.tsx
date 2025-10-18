"use client";
import { useEffect, useState } from 'react';

type NavigatorWithStandalone = Navigator & {
  // iOS WebApp mode exposes `navigator.standalone` (not in standard Navigator type)
  standalone?: boolean;
};

export function useDisplayMode() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    function check() {
      // navigator.standalone for iOS, display-mode media query and matchMedia for PWA/TWA
      const isIOSStandalone = typeof window !== 'undefined' && (navigator as NavigatorWithStandalone).standalone === true;
      const isDisplayStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(isIOSStandalone || isDisplayStandalone);
    }

    check();
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = () => check();
    try { mq.addEventListener('change', handler); } catch { mq.addListener(handler); }
    return () => { try { mq.removeEventListener('change', handler); } catch { mq.removeListener(handler); } };
  }, []);

  return { isStandalone };
}
