"use client";

import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Card,
  CardContent,
  CardActions,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel,
  Collapse,
  Slider,
} from "@mui/material";
import {
  Work as WorkIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Visibility as ViewIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  MyLocation as MyLocationIcon,
  Send as SendIcon,
  TuneOutlined as FilterIcon
} from "@mui/icons-material";
import JobViewDialog from "@/components/JobViewDialog";
import { Job, JobType, ExperienceLevel, JobFilters, LocationType } from "@/types/Job";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllJobs } from "@/lib/api/jobAPI";
import ApplicationFormDialog from "@/components/ApplicationFormDialog";
import JobShareButtons from "@/components/JobShareButtons";
import useSWR from "swr";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

const JobsPageContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXSmall = useMediaQuery(theme.breakpoints.down(490));
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const mapsLoaded = useGoogleMaps();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Separate input states (what user types) from filter states (what's used for fetching)
  const [searchInput, setSearchInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  // Debounced filter states (used for actual API calls)
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  // Location based filters
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [radius, setRadius] = useState<number>(50);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Other filter states (no debouncing needed for dropdowns)
  const [jobTypeFilter, setJobTypeFilter] = useState<JobType | "">("");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel | "">("");
  const [locationFilter, setLocationFilter] = useState<LocationType | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);

  // UI State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const SAVED_JOBS_KEY = 'savedJobs';
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const router = useRouter();

  // Application dialog state
  const [applicationDialog, setApplicationDialog] = useState({
    open: false,
    job: null as Job | null,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  //Initialize Google Places Autocomplete
  useEffect(() => {

    if (!mapsLoaded) {
      console.log('Maps not loaded yet, skipping autocomplete init');
      return;
    }

    if (!locationInputRef.current) {
      console.log('Location input ref not available, skipping autocomplete init');
      return;
    }

    if (autocompleteRef.current) {
      console.log('Autocomplete already exists, skipping init');
      return;
    }

    // Only initialize if advanced filters are shown and not remote only
    if (!showAdvancedFilters || remoteOnly) {
      console.log('Advanced filters not shown or remote only, skipping autocomplete init');
      return;
    }

    console.log('Initializing Google Places Autocomplete...');

    try {
      // Clear any existing autocomplete
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }

      autocompleteRef.current = new google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ['geocode'],
          fields: ['address_components', 'geometry', 'name', 'formatted_address']
        }
      );

      console.log('Autocomplete created successfully:', autocompleteRef.current);

      autocompleteRef.current.addListener('place_changed', () => {
        console.log('Place changed event triggered!');
        const place = autocompleteRef.current?.getPlace();
        console.log('Selected place:', place);

        if (place && place.formatted_address) {
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();

          console.log('Setting location:', { lat, lng, address: place.formatted_address });
          setLocationInput(place.formatted_address);
          if (lat && lng) {
            setLatitude(lat);
            setLongitude(lng);
            setUseCurrentLocation(false);
            setCurrentPage(1);
          }
        }
      });
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [mapsLoaded, showAdvancedFilters, remoteOnly]); // Only depend on mapsLoaded

  // Get user's current location
  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationInput("Using current location");
          setUseCurrentLocation(true);
          setGettingLocation(false);
          setCurrentPage(1);
          setSnackbar({
            open: true,
            message: "Location detected successfully!",
            severity: "success",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setGettingLocation(false);
          setSnackbar({
            open: true,
            message: "Unable to get your location. Please enter it manually.",
            severity: "error",
          });
        }
      );
    } else {
      setGettingLocation(false);
      setSnackbar({
        open: true,
        message: "Geolocation is not supported by your browser.",
        severity: "error",
      });
    }
  };


  // Debounce effect for search input (waits 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Debounce effect for company filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompanyFilter(companyInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [companyInput]);


  const jobTypes: JobType[] = [
    "full-time",
    "part-time",
    "contract",
    "internship",
    "temporary"
  ];

  const experienceLevels: ExperienceLevel[] = [
    "entry",
    "mid",
    "senior",
    "executive"
  ];

  const getJobTypeColor = (jobType: JobType): "success" | "warning" | "error" | "default" | "info" => {
    switch (jobType) {
      case "full-time": return "success";
      case "part-time": return "info";
      case "contract": return "warning";
      case "internship": return "default";
      case "temporary": return "error";
      default: return "default";
    }
  };

  const getExperienceColor = (level: ExperienceLevel): "success" | "warning" | "error" | "default" | "info" => {
    switch (level) {
      case "entry": return "success";
      case "mid": return "info";
      case "senior": return "warning";
      case "executive": return "error";
      default: return "default";
    }
  };

  const locationTypes = ["on-site", "hybrid"];

  // Create SWR key based on current filters
  const swrKey = useMemo(() => {
    const params: JobFilters = {
      page: currentPage,
      limit,
    };

    // Only add defined values
    if (searchTerm) params.search = searchTerm;
    if (companyFilter) params.company = companyFilter;
    if (jobTypeFilter) params.jobType = jobTypeFilter as JobType;
    if (experienceFilter) params.experienceLevel = experienceFilter as ExperienceLevel;
    if (remoteOnly) params.remoteOnly = remoteOnly;

    // Only add location-based filters if not remote only
    if (!remoteOnly) {
      if (locationFilter) params.locationType = locationFilter as LocationType;
      if (latitude && longitude && radius) {
        params.latitude = latitude;
        params.longitude = longitude;
        params.radius = radius;
      }
    }

    return ['jobs', params];
  }, [
    currentPage,
    limit,
    searchTerm,
    companyFilter,
    jobTypeFilter,
    experienceFilter,
    locationFilter,
    remoteOnly,
    latitude,
    longitude,
    radius
  ]);

  // Fetcher function for SWR
  const fetcher = async ([_, params]: [string, JobFilters]) => {
    console.log('Fetching jobs with params:', params);
    const response = await getAllJobs(params);
    return response;
  };

  // Use SWR for data fetching with keepPreviousData
  const { data, error, isLoading, isValidating, mutate } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    keepPreviousData: true, // This prevents flickering and losing focus
  });

  // Extract data from SWR response
  const jobs = data?.jobs || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  useEffect(() => {
    if (error) {
      console.error("Error fetching jobs:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch jobs",
        severity: "error",
      });
    }
  }, [error]);



  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setCompanyInput("");
    setCompanyFilter("");
    setJobTypeFilter("");
    setExperienceFilter("");
    setLocationFilter("");
    setLocationInput("");
    setLatitude(undefined);
    setLongitude(undefined);
    setRadius(50);
    setRemoteOnly(false);
    setUseCurrentLocation(false);
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Open dialog to view job details
  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedJob(null);
  };

  const isInitialLoading = isLoading && !data;

  if (isInitialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }


  const applyToJob = (job: Job) => {
    setApplicationDialog({
      open: true,
      job: job,
    });
  };

  const handleApplicationSuccess = () => {
    setSnackbar({
      open: true,
      message: "Application submitted successfully!",
      severity: "success",
    });
    // Revalidate the jobs list to update application counts
    mutate();
  };

  const handleCloseApplicationDialog = () => {
    setApplicationDialog({
      open: false,
      job: null,
    });
  };

  const formatSalary = (salary: Job["salary"]) => {
    if (!salary) return "Not specified";
    const { min, max, currency, period } = salary;
    if (min && max) {
      return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()} / ${period}`;
    } else if (min) {
      return `${currency}${min.toLocaleString()}+ / ${period}`;
    }
    return "Not specified";
  };

  const formatLocation = (location: Job["location"]) => {
    if (location.type === "remote") return "Remote";
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(", ");
  };

  const getCompanyName = (company: string | { _id: string; name: string; logo?: string }): string => {
    return typeof company === "string" ? company : company.name;
  };

  const getCompanyLogo = (company: string | { _id: string; name: string; logo?: string }): string | null => {
    if (typeof company === "string") return null;
    return company.logo || null;
  };


  const handleRemoteOnlyChange = (checked: boolean) => {
    setRemoteOnly(checked);
    if (checked) {
      // Clear location based filters when remote only is enabled
      setLocationFilter("remote");
      setLocationInput("");
      setLatitude(undefined);
      setLongitude(undefined);
      setUseCurrentLocation(false);
    } else {
      setLocationFilter("");
    }
    setCurrentPage(1);
  };

  return (
    <>
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 1, sm: 2, md: 3, lg: 4 },
            borderRadius: { xs: 1.5, md: 3 },
            backdropFilter: "blur(12px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
            boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
            mx: { xs: 1, sm: 2, md: 0 },
          }}
        >
          {/* Header */}
          <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            mb: { xs: 1.5, sm: 3 },
            gap: { xs: 1, sm: 2 }
          }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem", lg: "2.125rem" },
              }}
            >
              Find Your Next Job
            </Typography>
            <Button
              variant="contained"
              startIcon={isXSmall ? null : <FilterIcon />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              size="small"
              fullWidth={isXSmall}
            >
              {showAdvancedFilters ? "Hide" : "Show"} Filters
            </Button>
          </Box>

          {/* Search and Filters */}
          <Paper
            sx={{
              p: { xs: 1, sm: 2, md: 3 },
              mb: { xs: 1.5, sm: 3 },
              borderRadius: { xs: 2, md: 3 },
              backdropFilter: "blur(12px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
              boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
            }}
          >
            <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
              {/* Main Search */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  placeholder="Search jobs..."
                  spellCheck={false}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Company Search */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  placeholder="Search by Company"
                  value={companyInput}
                  spellCheck={false}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize={isMobile ? "small" : "medium"} />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>

              {/* Remote Only Toggle */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={remoteOnly}
                      onChange={(e) => handleRemoteOnlyChange(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Remote Only</Typography>}
                  sx={{ ml: 0 }}
                />
              </Grid>

              {/* Reset Button */}
              <Grid size={{ xs: 6, sm: 6, md: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={isXSmall ? null : <RefreshIcon fontSize="small" />}
                  onClick={handleReset}
                  fullWidth
                  size="small"
                >
                  Reset
                </Button>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            <Collapse in={showAdvancedFilters}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {/* Job Type Filter */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={jobTypeFilter}
                      onChange={(e) => {
                        setJobTypeFilter(e.target.value as JobType | "");
                        setCurrentPage(1);
                      }}
                      label="Job Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {jobTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Experience Filter */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Experience</InputLabel>
                    <Select
                      value={experienceFilter}
                      onChange={(e) => {
                        setExperienceFilter(e.target.value as ExperienceLevel | "");
                        setCurrentPage(1);
                      }}
                      label="Experience"
                    >
                      <MenuItem value="">All Levels</MenuItem>
                      {experienceLevels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Location Type Filter - Only show if not remote only */}
                {!remoteOnly && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Location Type</InputLabel>
                      <Select
                        value={locationFilter}
                        onChange={(e) => {
                          setLocationFilter(e.target.value as LocationType | "");
                          setCurrentPage(1);
                        }}
                        label="Location Type"
                      >
                        <MenuItem value="">All Locations</MenuItem>
                        {locationTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type === "on-site" ? "On-site" : type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Location Search with Google Places - Only show if not remote only */}
                {!remoteOnly && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                      <TextField
                        inputRef={locationInputRef}
                        placeholder="Enter location..."
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        disabled={!mapsLoaded || gettingLocation}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: !mapsLoaded ? (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ) : null,
                        }}
                        fullWidth
                        size="small"
                      />
                      <Tooltip title="Use my location">
                        <IconButton
                          onClick={handleGetCurrentLocation}
                          disabled={gettingLocation}
                          color={useCurrentLocation ? "primary" : "default"}
                          size="small"
                          sx={{
                            minWidth: { xs: 36, sm: 40 },
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 }
                          }}
                        >
                          {gettingLocation ? <CircularProgress size={24} /> : <MyLocationIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {useCurrentLocation && (
                      <Chip
                        label="Using current location"
                        color="primary"
                        size="small"
                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                      />
                    )}
                  </Grid>
                )}

                {/* Radius Slider - Only show if coordinates are set */}
                {!remoteOnly && latitude && longitude && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ px: 2 }}>
                      <Typography gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                        Search Radius: {radius} km
                      </Typography>
                      <Slider
                        value={radius}
                        onChange={(_, value) => {
                          setRadius(value as number);
                          setCurrentPage(1);
                        }}
                        min={5}
                        max={500}
                        step={6}
                        marks={isXSmall ? undefined : [
                          { value: 5, label: '5km' },
                          { value: 50, label: '50km' },
                          { value: 100, label: '100km' },
                          { value: 200, label: '200km' },
                          { value: 500, label: '500km' }
                        ]}
                        valueLabelDisplay="auto"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </Paper>

          <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

          {/* Results Summary with loading indicator */}

          <Box sx={{
            mb: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Showing {jobs.length} of {total} jobs {isLoading && "..."}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Page {currentPage} of {totalPages}
            </Typography>
          </Box>

          {/* Jobs Grid */}
          <Grid container spacing={{ xs: 1.5, sm: 2.5, md: 3 }}>
            {jobs.map((job) => (
              <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={job._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: { xs: 2, md: 3 },
                    backdropFilter: "blur(12px)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                    boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                    border: `1px solid ${job.isFeatured ? '#1976d2' : '#4caf50'}40`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: { xs: "none", sm: "translateY(-4px)" },
                      boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 }, position: 'relative' }}>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          mr: 2,
                          bgcolor: "primary.main",
                        }}
                      >
                        {getCompanyLogo(job.company) ? (
                          <Box
                            component="img"
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${getCompanyLogo(job.company)}`}
                            alt={getCompanyName(job.company)}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <BusinessIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={job.title}
                        >
                          {job.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                          title={getCompanyName(job.company)}
                        >
                          {getCompanyName(job.company)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Job Details */}
                    <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                      <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                        flexWrap: "wrap",
                        gap: 0.5,
                      }}>
                        <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                          <Chip
                            label={job.jobType}
                            color={getJobTypeColor(job.jobType)}
                            size="small"
                            sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" } }}
                          />
                          <Chip
                            label={job.experienceLevel}
                            color={getExperienceColor(job.experienceLevel)}
                            size="small"
                            sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" } }}
                          />

                        </Box>
                        <JobShareButtons job={job} variant="menu" />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" }
                        }}
                        title={formatLocation(job.location)}
                      >
                        📍 {formatLocation(job.location)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" }
                        }}
                        title={formatSalary(job.salary)}
                      >
                        💰 {formatSalary(job.salary)}
                      </Typography>
                    </Box>

                    {/* Skills */}
                    {job.requirements?.skills && job.requirements.skills.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {job.requirements.skills.slice(0, 3).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: { xs: "0.625rem", sm: "0.7rem" } }}
                            />
                          ))}
                          {job.requirements.skills.length > 3 && (
                            <Chip
                              label={`+${job.requirements.skills.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: { xs: "0.625rem", sm: "0.7rem" } }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Stats */}
                    <Box sx={{ textAlign: "left", flex: 1 }}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                          Applications
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                          {job.applicationCount || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Box sx={{
                    p: { xs: 1, sm: 1.5, md: 2 },
                    pt: 0,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1 },
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'space-between' },
                    width: '100%'
                  }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={!isSmall ? <ViewIcon /> : null}
                      onClick={() => handleViewJob(job)}
                      size="small"
                      sx={{ width: '100%' }}
                    >
                      {isXSmall ? "View" : "View Details"}
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={!isSmall ? <SendIcon /> : null}
                      onClick={() => applyToJob(job)}
                      size="small"
                      sx={{ width: '100%' }}
                    >
                      {isXSmall ? "Apply" : "Apply Now"}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 3, sm: 4 }, px: { xs: 0, sm: 2 } }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
                siblingCount={isXSmall ? 0 : 1}
                boundaryCount={1}
              />
            </Box>
          )}

          {/* Empty State */}
          {jobs.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 6, sm: 8 },
                color: "text.secondary",
              }}
            >
              <WorkIcon sx={{ fontSize: { xs: 40, sm: 48, md: 64 }, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                No jobs found
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                {searchTerm || jobTypeFilter || experienceFilter || locationFilter || remoteOnly || locationInput
                  ? "Try adjusting your search criteria"
                  : "No jobs available at the moment"}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box >

      {/* Application Dialog */}
      < ApplicationFormDialog
        open={applicationDialog.open}
        onClose={handleCloseApplicationDialog}
        job={applicationDialog.job}
        onSuccess={handleApplicationSuccess}
      />

      {/* Job View Dialog */}
      < JobViewDialog
        open={viewDialogOpen}
        onClose={handleCloseDialog}
        job={selectedJob}
      />

      {/* Snackbar */}
      < Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar >
    </>
  );
}

export default function FindJobs() {
  return (
    <Suspense fallback={
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    }>
      <JobsPageContent />
    </Suspense>
  );
}