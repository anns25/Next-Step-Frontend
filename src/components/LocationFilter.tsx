'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import LocationAutocomplete from './LocationAutocomplete';

interface JobFiltersProps {
  onFilterChange: (filters: JobFilters) => void;
  initialFilters?: Partial<JobFilters>;
}

export interface JobFilters {
  search: string;
  jobType: string;
  experienceLevel: string;
  locationType: string;
  city: string;
  state: string;
  country: string;
  remoteOnly: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
}

export default function JobFilters({ onFilterChange, initialFilters }: JobFiltersProps) {
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    jobType: '',
    experienceLevel: '',
    locationType: '',
    city: '',
    state: '',
    country: '',
    remoteOnly: false,
    radius: 50,
    ...initialFilters
  });

  const [locationInput, setLocationInput] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newFilters = {
            ...filters,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setFilters(newFilters);
          setUseCurrentLocation(true);
          setLoadingLocation(false);
          onFilterChange(newFilters);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoadingLocation(false);
          alert('Unable to get your location. Please enter it manually.');
        }
      );
    }
  };

  const handleLocationSelect = (address: string, coordinates?: { lat: number; lng: number }) => {
    setLocationInput(address);
    if (coordinates) {
      const newFilters = {
        ...filters,
        latitude: coordinates.lat,
        longitude: coordinates.lng
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // If remote only is enabled, clear location filters
    if (key === 'remoteOnly' && value === true) {
      newFilters.city = '';
      newFilters.state = '';
      newFilters.country = '';
      newFilters.latitude = undefined;
      newFilters.longitude = undefined;
      newFilters.radius = undefined;
      newFilters.locationType = 'remote';
      setLocationInput('');
      setUseCurrentLocation(false);
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: JobFilters = {
      search: '',
      jobType: '',
      experienceLevel: '',
      locationType: '',
      city: '',
      state: '',
      country: '',
      remoteOnly: false,
      radius: 50
    };
    setFilters(resetFilters);
    setLocationInput('');
    setUseCurrentLocation(false);
    onFilterChange(resetFilters);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Grid container spacing={3}>
        {/* Search */}
        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="Search Jobs"
            placeholder="Job title, keywords, or company"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </Grid>

        {/* Remote Only Toggle */}
        <Grid size={{xs:12}}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.remoteOnly}
                onChange={(e) => handleFilterChange('remoteOnly', e.target.checked)}
                color="primary"
              />
            }
            label="Remote Jobs Only"
          />
        </Grid>

        {/* Location Type */}
        {!filters.remoteOnly && (
          <Grid size={{xs:12, sm:6}}>
            <FormControl fullWidth>
              <InputLabel>Location Type</InputLabel>
              <Select
                value={filters.locationType}
                label="Location Type"
                onChange={(e) => handleFilterChange('locationType', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="remote">Remote</MenuItem>
                <MenuItem value="on-site">On-site</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Job Type */}
        <Grid size={{xs:12, sm:6}}>
          <FormControl fullWidth>
            <InputLabel>Job Type</InputLabel>
            <Select
              value={filters.jobType}
              label="Job Type"
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="full-time">Full-time</MenuItem>
              <MenuItem value="part-time">Part-time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="internship">Internship</MenuItem>
              <MenuItem value="temporary">Temporary</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Experience Level */}
        <Grid size={{xs:12, sm:6}}>
          <FormControl fullWidth>
            <InputLabel>Experience Level</InputLabel>
            <Select
              value={filters.experienceLevel}
              label="Experience Level"
              onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="entry">Entry Level</MenuItem>
              <MenuItem value="mid">Mid Level</MenuItem>
              <MenuItem value="senior">Senior Level</MenuItem>
              <MenuItem value="executive">Executive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Location-based Search - Only show if not remote only */}
        {!filters.remoteOnly && (
          <>
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" gutterBottom>
                Location-based Search
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? <CircularProgress size={20} /> : 'Use Current Location'}
                </Button>
                {useCurrentLocation && (
                  <Chip label="Using current location" color="primary" size="small" />
                )}
              </Box>
              
              <LocationAutocomplete
                label="Search Location"
                value={locationInput}
                onChange={handleLocationSelect}
                types={['(cities)', '(regions)']}
                disabled={filters.remoteOnly}
              />
            </Grid>

            {/* Radius Slider - Only show if coordinates are set */}
            {(filters.latitude && filters.longitude) && (
              <Grid size={{xs:12}}>
                <Typography gutterBottom>
                  Search Radius: {filters.radius} km
                </Typography>
                <Slider
                  value={filters.radius || 50}
                  onChange={(_, value) => handleFilterChange('radius', value)}
                  min={5}
                  max={200}
                  step={5}
                  marks={[
                    { value: 5, label: '5km' },
                    { value: 50, label: '50km' },
                    { value: 100, label: '100km' },
                    { value: 200, label: '200km' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>
            )}
          </>
        )}

        {/* Reset Button */}
        <Grid size={{xs:12}}>
          <Button variant="outlined" onClick={handleReset} fullWidth>
            Reset Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}