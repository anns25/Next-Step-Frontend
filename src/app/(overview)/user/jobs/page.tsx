"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Work as WorkIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Send as SendIcon,
} from "@mui/icons-material";

import { Job, JobType, ExperienceLevel } from "@/types/Job";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllJobs } from "@/lib/api/jobAPI";
import ApplicationFormDialog from "@/components/ApplicationFormDialog";

export default function FindJobs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [locationFilter, setLocationFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
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

  const locationTypes = ["remote", "on-site", "hybrid"];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        company: companyFilter || undefined,
        jobType: jobTypeFilter || undefined,
        experienceLevel: experienceFilter || undefined,
        locationType: locationFilter || undefined,
        city: cityFilter || undefined,
        country: countryFilter || undefined,
      };

      console.log('Fetching jobs with params:', params);
      const response = await getAllJobs(params);

      if (response) {
        setJobs(response.jobs);
        setTotalPages(response.totalPages);
        setTotal(response.total);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch jobs",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchTerm, companyFilter, jobTypeFilter, experienceFilter, locationFilter, cityFilter, countryFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setCompanyFilter("");
    setJobTypeFilter("");
    setExperienceFilter("");
    setLocationFilter("");
    setCityFilter("");
    setCountryFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
      setSnackbar({
        open: true,
        message: "Job removed from saved",
        severity: "info",
      });
    } else {
      newSaved.add(jobId);
      setSnackbar({
        open: true,
        message: "Job saved successfully",
        severity: "success",
      });
    }
    setSavedJobs(newSaved);
  };

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
    // Optionally refresh the jobs list to update application counts
    fetchJobs();
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

  const handleLocationFilter = (value: string) => {
    setLocationFilter(value);
    setCurrentPage(1);
    // Clear city and country when switching to remote
    if (value === "remote") {
      setCityFilter("");
      setCountryFilter("");
    }
  };

  const handleCityFilter = (value: string) => {
    setCityFilter(value);
    setCurrentPage(1);
  };

  const handleCountryFilter = (value: string) => {
    setCountryFilter(value);
    setCurrentPage(1);
  };

  return (
    <>
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 1.5, sm: 2, md: 3, lg: 4 },
            borderRadius: { xs: 2, md: 3 },
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
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 2, sm: 3 },
            gap: { xs: 2, sm: 0 }
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
          </Box>

          {/* Search and Filters */}
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: { xs: 2, sm: 3 },
              borderRadius: 3,
              backdropFilter: "blur(12px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
              boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
            }}
          >
            <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
              {/* Search Jobs */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize={isMobile ? "small" : "medium"} />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>

              {/* Job Type Filter */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Experience</InputLabel>
                  <Select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
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

              {/* Company Search */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  placeholder="Search by Company"
                  value={companyFilter}
                  onChange={(e) => {
                    setCompanyFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize={isMobile ? "small" : "medium"} />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>


              {/* Location Type Filter */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={locationFilter}
                    onChange={(e) => handleLocationFilter(e.target.value)}
                    label="Location"
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

              {/* City Filter - Only show for non-remote */}
              {locationFilter && locationFilter !== "remote" && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    placeholder="City"
                    value={cityFilter}
                    onChange={(e) => handleCityFilter(e.target.value)}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              )}

              {/* Country Filter - Only show for non-remote */}
              {locationFilter && locationFilter !== "remote" && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    placeholder="Country"
                    value={countryFilter}
                    onChange={(e) => handleCountryFilter(e.target.value)}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              )}

              {/* Reset Button */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon fontSize={isMobile ? "small" : "medium"} />}
                  onClick={handleReset}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

          {/* Results Summary */}
          <Box sx={{
            mb: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Showing {jobs.length} of {total} jobs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Page {currentPage} of {totalPages}
            </Typography>
          </Box>

          {/* Jobs Grid */}
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {jobs.map((job) => (
              <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={job._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    backdropFilter: "blur(12px)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                    boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                    border: `1px solid ${job.isFeatured ? '#1976d2' : '#4caf50'}40`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 } }}>
                    {job.isFeatured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{ mb: 1, fontSize: { xs: "0.625rem", sm: "0.75rem" } }}
                      />
                    )}

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
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" } }}>
                          Applications
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                          {job.applicationCount || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" } }}>
                          Views
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                          {job.viewCount || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<SendIcon />}
                      onClick={() => applyToJob(job)}
                      size={isMobile ? "small" : "medium"}
                    >
                      Apply Now
                    </Button>
                    <Tooltip title={savedJobs.has(job._id) ? "Remove from saved" : "Save job"}>
                      <IconButton
                        onClick={() => toggleSaveJob(job._id)}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                      >
                        {savedJobs.has(job._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 3, sm: 4 } }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "large"}
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
                {searchTerm || jobTypeFilter || experienceFilter || locationFilter || cityFilter || countryFilter
                  ? "Try adjusting your search criteria"
                  : "No jobs available at the moment"}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Application Dialog */}
      <ApplicationFormDialog
        open={applicationDialog.open}
        onClose={handleCloseApplicationDialog}
        job={applicationDialog.job}
        onSuccess={handleApplicationSuccess}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}