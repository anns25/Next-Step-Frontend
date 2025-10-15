"use client";

import { useEffect } from 'react';

interface ShareThisProps {
  propertyId: string;
}

export default function ShareThis({ propertyId }: ShareThisProps) {
  useEffect(() => {
    // Load ShareThis script
    if (typeof window !== 'undefined' && !(window as any).__sharethis__) {
      const script = document.createElement('script');
      script.src = `https://platform-api.sharethis.com/js/sharethis.js#property=${propertyId}&product=inline-share-buttons`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [propertyId]);

  return null;
}