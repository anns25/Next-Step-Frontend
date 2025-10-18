import { useEffect, useState } from 'react';

let isLoading = false;
let isLoaded = false;

export const useGoogleMaps = () => {
  const [loaded, setLoaded] = useState(isLoaded);

  useEffect(() => {
    console.log('useGoogleMaps hook running...');
    console.log('isLoaded:', isLoaded);
    console.log('window.google?.maps:', !!window.google?.maps);
    if (isLoaded) {
      setLoaded(true);
      return;
    }

    if (isLoading) {
      console.log('Already loading, setting up interval...');
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setLoaded(true);
          isLoaded = true;
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Since the script is already loaded in layout.tsx, just check if it's available
    if (window.google?.maps) {
      console.log('Google Maps already available!');
      setLoaded(true);
      isLoaded = true;
      return;
    }

    // If not loaded yet, start checking periodically
    console.log('Starting to check for Google Maps...');
    isLoading = true;
    const checkLoaded = setInterval(() => {
      if (window.google?.maps) {
        setLoaded(true);
        isLoaded = true;
        isLoading = false;
        clearInterval(checkLoaded);
      }
    }, 100);

    return () => clearInterval(checkLoaded);
  }, []);
  console.log('useGoogleMaps returning:', loaded);
  return loaded;
};