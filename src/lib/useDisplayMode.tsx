"use client";
import { useEffect, useState } from 'react';

export function useDisplayMode() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    function check() {
      // navigator.standalone for iOS, display-mode media query and matchMedia for PWA/TWA
      const isIOSStandalone = typeof (window as any).navigator !== 'undefined' && (window as any).navigator.standalone === true;
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(isIOSStandalone || isDisplayStandalone);
    }

    check();
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = () => check();
    try { mq.addEventListener('change', handler); } catch { mq.addListener(handler); }
    return () => { try { mq.removeEventListener('change', handler); } catch { mq.removeListener(handler); } };
  }, []);

  return { isStandalone };
}
