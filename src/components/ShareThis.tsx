"use client";

import { useEffect } from 'react';

interface ShareThisProps {
  propertyId: string;
}

//Extend window interface to include ShareThis
declare global {
    interface Window {
        __sharethis__? : unknown;
    }
}

export default function ShareThis({ propertyId }: ShareThisProps) {
  useEffect(() => {
    // Load ShareThis script
    if (typeof window !== 'undefined' && ! window.__sharethis__) {
      const script = document.createElement('script');
      script.src = `https://platform-api.sharethis.com/js/sharethis.js#property=${propertyId}&product=inline-share-buttons`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [propertyId]);

  return null;
}