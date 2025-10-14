"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Interview, InterviewFilters, InterviewStats } from "@/types/Interview";
import {
  getUserInterviews,
  getInterviewStats,
} from "@/lib/api/interviewAPI";
import InterviewDetailDialog from "@/components/InterviewDetailDialog";
import PreparationDialog from "@/components/PreparationDialog";

const InterviewsPage: React.FC = () => {
  const theme = useTheme();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState<InterviewFilters>({
    page: 1,
    limit: 10,
    sortBy: "scheduledDate",
    sortOrder: "asc",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [preparationDialogOpen, setPreparationDialogOpen] = useState(false);

  useEffect(() => {
    fetchInterviews();
    fetchStats();
  }, [filters]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await getUserInterviews(filters);
      setInterviews(response.interviews);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getInterviewStats();
      setStats(response);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleFilterChange = (field: keyof InterviewFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleViewInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setDetailDialogOpen(true);
  };

  const handlePreparation = (interview: Interview) => {
    setSelectedInterview(interview);
    setPreparationDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchInterviews();
    fetchStats();
    setPreparationDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "info";
      case "confirmed":
        return "success";
      case "completed":
        return "default";
      case "cancelled":
        return "error";
      case "rescheduled":
        return "warning";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <VideoIcon />;
      case "phone":
        return <PhoneIcon />;
      case "in-person":
        return <BusinessIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  if (loading && interviews.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
                My Interviews
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View your scheduled interviews and add preparation notes
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* Stats Cards */}
            {stats && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {stats.totalInterviews}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Interviews
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                      {stats.upcomingInterviews}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                      {stats.completedInterviews}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Filters */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                backdropFilter: "blur(12px)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="rescheduled">Rescheduled</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type || ""}
                    onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
                    label="Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="in-person">In-Person</MenuItem>
                    <MenuItem value="technical">Technical</MenuItem>
                    <MenuItem value="panel">Panel</MenuItem>
                    <MenuItem value="hr">HR</MenuItem>
                    <MenuItem value="final">Final</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time</InputLabel>
                  <Select
                    value={
                      filters.upcoming
                        ? "upcoming"
                        : filters.past
                          ? "past"
                          : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "upcoming") {
                        handleFilterChange("upcoming", true);
                        handleFilterChange("past", undefined);
                      } else if (value === "past") {
                        handleFilterChange("past", true);
                        handleFilterChange("upcoming", undefined);
                      } else {
                        handleFilterChange("upcoming", undefined);
                        handleFilterChange("past", undefined);
                      }
                    }}
                    label="Time"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="past">Past</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={filters.sortOrder || "asc"}
                    onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                    label="Order"
                  >
                    <MenuItem value="asc">Earliest</MenuItem>
                    <MenuItem value="desc">Latest</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            {/* Interviews List */}
            {interviews.length === 0 ? (
              <Paper
                sx={{
                  p: 6,
                  borderRadius: 3,
                  backdropFilter: "blur(12px)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                  boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                  textAlign: "center",
                }}
              >
                <CalendarIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  No interviews scheduled
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your HR team will schedule interviews for you
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {interviews.map((interview) => (
                  <Grid size={{ xs: 12 }} key={interview._id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        backdropFilter: "blur(12px)",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                        boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                              {interview.job.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                              <Chip
                                icon={<BusinessIcon />}
                                label={interview.company.name}
                                variant="outlined"
                                size="small"
                              />
                              <Chip
                                icon={getTypeIcon(interview.type)}
                                label={interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                                variant="filled"
                                size="small"
                                sx={{
                                  bgcolor: "#495866",
                                  color: "#fff",
                                  "& .MuiChip-icon": {
                                    color: "#fff",
                                  },
                                }}
                              />
                              <Chip
                                label={`Round ${interview.round}`}
                                color="primary"
                                variant="filled"
                                size="small"
                              />
                            </Stack>
                          </Box>
                          <Chip
                            label={interview.status.toUpperCase()}
                            color={getStatusColor(interview.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        <Stack spacing={1}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(interview.scheduledDate)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(interview.scheduledDate)} ({interview.duration} mins)
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {interview.location.type === "remote"
                                ? "Remote"
                                : interview.location.type === "phone"
                                  ? "Phone"
                                  : interview.location.address || "Office"}
                            </Typography>
                          </Box>
                          {interview.interviewers.length > 0 && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {interview.interviewers.map((i) => i.name).join(", ")}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>

                      <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
                        <Button
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewInterview(interview)}
                          size="small"
                        >
                          View Details
                        </Button>
                        {isUpcoming(interview.scheduledDate) &&
                          interview.status !== 'cancelled' &&
                          interview.status !== 'completed' && (
                            <Button
                              variant="contained"
                              startIcon={<NotesIcon />}
                              onClick={() => handlePreparation(interview)}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.success.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.success.dark,
                                },
                              }}
                            >
                              Preparation Notes
                            </Button>
                          )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={filters.page || 1}
                  onChange={(_, page) => handleFilterChange("page", page)}
                  color="primary"
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Dialogs */}
      {selectedInterview && (
        <>
          <InterviewDetailDialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            interview={selectedInterview}
            isAdmin={false}
          />
          <PreparationDialog
            open={preparationDialogOpen}
            onClose={() => setPreparationDialogOpen(false)}
            interview={selectedInterview}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </>
  );
};

export default InterviewsPage;