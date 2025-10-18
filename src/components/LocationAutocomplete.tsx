'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TextField, CircularProgress } from '@mui/material';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  types?: string[];
  disabled?: boolean;
}

export default function LocationAutocomplete({
  label,
  value,
  onChange,
  types = ['(cities)'],
  disabled = false
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const mapsLoaded = useGoogleMaps();

  useEffect(() => {
    if (!mapsLoaded || !inputRef.current) return;

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types,
          fields: ['address_components', 'geometry', 'name', 'formatted_address']
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.formatted_address) {
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          
          setInputValue(place.formatted_address);
          onChange(
            place.formatted_address,
            lat && lng ? { lat, lng } : undefined
          );
        }
      });
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [mapsLoaded, types, onChange]);

  return (
    <TextField
      inputRef={inputRef}
      label={label}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
      }}
      fullWidth
      disabled={disabled || !mapsLoaded}
      InputProps={{
        endAdornment: !mapsLoaded ? <CircularProgress size={20} /> : null
      }}
    />
  );
}