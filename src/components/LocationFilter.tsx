"use client";

import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Autocomplete,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Public as RemoteIcon,
} from '@mui/icons-material';
import { useLoadScript } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

interface LocationFilterProps {
  onFilterChange: (filters: LocationFilters) => void;
  currentFilters: LocationFilters;
}

export interface LocationFilters {
  locationType: 'all' | 'remote' | 'hybrid' | 'on-site';
  city?: string;
  country?: string;
  radius?: number; // in miles
  latitude?: number;
  longitude?: number;
  remoteOnly?: boolean;
}

export default function LocationFilter({ onFilterChange, currentFilters }: LocationFilterProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [remoteOnly, setRemoteOnly] = useState(currentFilters.remoteOnly || false);
  const [locationType, setLocationType] = useState(currentFilters.locationType || 'all');
  const [searchRadius, setSearchRadius] = useState(currentFilters.radius || 50);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.places.PlaceResult | null>(null);

  // Auto-complete for location search
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        fields: ['geometry', 'formatted_address', 'address_components'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          setSelectedLocation(place);
          handleLocationSelect(place);
        }
      });
    }
  }, [isLoaded]);

  const handleLocationSelect = (place: google.maps.places.PlaceResult) => {
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();

    let city = '';
    let country = '';

    place.address_components?.forEach((component) => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.long_name;
      }
    });

    onFilterChange({
      ...currentFilters,
      city,
      country,
      latitude: lat,
      longitude: lng,
      radius: searchRadius,
    });
  };

  const handleRemoteOnlyToggle = (checked: boolean) => {
    setRemoteOnly(checked);
    onFilterChange({
      ...currentFilters,
      remoteOnly: checked,
      locationType: checked ? 'remote' : currentFilters.locationType,
    });
  };

  const handleLocationTypeChange = (type: 'all' | 'remote' | 'hybrid' | 'on-site') => {
    setLocationType(type);
    onFilterChange({
      ...currentFilters,
      locationType: type,
      remoteOnly: type === 'remote',
    });
  };

  const handleRadiusChange = (_event: Event, value: number | number[]) => {
    const radius = Array.isArray(value) ? value[0] : value;
    setSearchRadius(radius);
    onFilterChange({
      ...currentFilters,
      radius,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get city name
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === 'OK' && results?.[0]) {
                let city = '';
                let country = '';

                results[0].address_components?.forEach((component) => {
                  if (component.types.includes('locality')) {
                    city = component.long_name;
                  }
                  if (component.types.includes('country')) {
                    country = component.long_name;
                  }
                });

                if (inputRef.current) {
                  inputRef.current.value = `${city}, ${country}`;
                }

                onFilterChange({
                  ...currentFilters,
                  city,
                  country,
                  latitude,
                  longitude,
                  radius: searchRadius,
                });
              }
            }
          );
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (loadError) {
    return <Typography color="error">Error loading maps</Typography>;
  }

  if (!isLoaded) {
    return <Typography>Loading location services...</Typography>;
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Location Preferences
      </Typography>

      {/* Remote Only Toggle */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={remoteOnly}
              onChange={(e) => handleRemoteOnlyToggle(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RemoteIcon />
              <Typography>Remote Jobs Only</Typography>
            </Box>
          }
        />
      </Box>

      {/* Location Type */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Location Type</InputLabel>
        <Select
          value={locationType}
          onChange={(e) => handleLocationTypeChange(e.target.value as any)}
          label="Location Type"
          disabled={remoteOnly}
        >
          <MenuItem value="all">All Locations</MenuItem>
          <MenuItem value="remote">Remote Only</MenuItem>
          <MenuItem value="hybrid">Hybrid</MenuItem>
          <MenuItem value="on-site">On-Site</MenuItem>
        </Select>
      </FormControl>

      {/* Location Search (disabled if remote only) */}
      {!remoteOnly && (
        <>
          <Box sx={{ mb: 2 }}>
            <TextField
              inputRef={inputRef}
              fullWidth
              label="Search Location"
              placeholder="Enter city or location"
              InputProps={{
                endAdornment: (
                  <MyLocationIcon
                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                    onClick={getCurrentLocation}
                  />
                ),
              }}
              disabled={remoteOnly}
            />
          </Box>

          {/* Distance Radius */}
          {selectedLocation && (
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>
                Search Radius: {searchRadius} miles
              </Typography>
              <Slider
                value={searchRadius}
                onChange={handleRadiusChange}
                min={5}
                max={100}
                step={5}
                marks={[
                  { value: 5, label: '5mi' },
                  { value: 25, label: '25mi' },
                  { value: 50, label: '50mi' },
                  { value: 100, label: '100mi' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          )}
        </>
      )}

      {/* Current Filters Display */}
      {(currentFilters.city || currentFilters.remoteOnly) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Active Filters:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
            {currentFilters.remoteOnly && (
              <Chip
                label="Remote Only"
                icon={<RemoteIcon />}
                color="primary"
                size="small"
              />
            )}
            {currentFilters.city && !currentFilters.remoteOnly && (
              <Chip
                label={`${currentFilters.city}${currentFilters.radius ? ` (${currentFilters.radius}mi)` : ''}`}
                icon={<LocationIcon />}
                color="secondary"
                size="small"
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}