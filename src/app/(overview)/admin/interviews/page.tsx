"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  EventRepeat as RescheduleIcon,
  AssignmentTurnedIn as CompleteIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Interview, InterviewFilters, InterviewStats } from "@/types/Interview";
import {
  getAllInterviewsAdmin,
  deleteInterviewAdmin,
  confirmInterviewAdmin,
  cancelInterviewAdmin,
} from "@/lib/api/interviewAPI";
import AdminInterviewFormDialog from "@/components/InterviewFormDialog";
import AdminRescheduleDialog from "@/components/AdminRescheduleDialog";
import AdminCompleteInterviewDialog from "@/components/AdminCompleteDialog";
import InterviewDetailDialog from "@/components/InterviewDetailDialog";
import { getAdminInterviewStats } from "@/lib/api/adminAPI";

const AdminInterviewsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInterviews();
    fetchStats();
  }, [filters]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await getAllInterviewsAdmin(filters);
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
      const response = await getAdminInterviewStats();
      setStats(response);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleFilterChange = (field: keyof InterviewFilters, value: string | number | boolean | undefined) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleCreateInterview = () => {
    setSelectedInterview(null);
    setEditMode(false);
    setFormDialogOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setEditMode(true);
    setFormDialogOpen(true);
  };

  const handleViewInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setDetailDialogOpen(true);
  };

  const handleConfirmInterview = async (interview: Interview) => {
    try {
      setActionLoading(true);
      await confirmInterviewAdmin(interview._id);
      fetchInterviews();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm interview");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleCancelInterview = async () => {
    if (!selectedInterview) return;
    try {
      setActionLoading(true);
      await cancelInterviewAdmin(selectedInterview._id, cancelReason);
      setCancelDialogOpen(false);
      fetchInterviews();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel interview");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setRescheduleDialogOpen(true);
  };

  const handleCompleteClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setCompleteDialogOpen(true);
  };

  const handleDeleteClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setDeleteDialogOpen(true);
  };

  const handleDeleteInterview = async () => {
    if (!selectedInterview) return;
    try {
      setActionLoading(true);
      await deleteInterviewAdmin(selectedInterview._id);
      setDeleteDialogOpen(false);
      fetchInterviews();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete interview");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchInterviews();
    fetchStats();
    setFormDialogOpen(false);
    setRescheduleDialogOpen(false);
    setCompleteDialogOpen(false);
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
        return <VideoIcon fontSize="small" />;
      case "phone":
        return <PhoneIcon fontSize="small" />;
      case "in-person":
        return <BusinessIcon fontSize="small" />;
      default:
        return <BusinessIcon fontSize="small" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
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

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
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
            p: { xs: 0.5, sm: 1, md: 2, lg: 3 },
            borderRadius: { xs: 0, sm: 2, md: 3 },
            backdropFilter: "blur(12px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
            boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
            mx: { xs: 0, sm: 1, md: 0 },
            minHeight: { xs: '100vh', sm: 'auto' },
            // Custom breakpoints for very small screens
            '@media (max-width: 600px)': {
              p: 0.75,
            },
            '@media (max-width: 480px)': {
              p: 0.5,
            },
            '@media (max-width: 350px)': {
              p: 0.375,
              background: 'rgba(255,255,255,0.95)'
            }
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              mb: { xs: 1.5, sm: 2, md: 3 },
              gap: { xs: 1.5, sm: 0 },
              p: { xs: 0.5, sm: 0 },
              // Custom breakpoints
              '@media (max-width: 600px)': {
                mb: 1.25,
                p: 0.25
              },
              '@media (max-width: 480px)': {
                mb: 1,
                p: 0.25
              },
              '@media (max-width: 350px)': {
                mb: 0.75,
                p: 0.25
              }
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.5rem",
                  md: "1.75rem",
                  lg: "2rem"
                },
                lineHeight: 1.2,
                // Custom breakpoints
                '@media (max-width: 600px)': {
                  fontSize: '1rem'
                },
                '@media (max-width: 480px)': {
                  fontSize: '0.9rem'
                },
                '@media (max-width: 350px)': {
                  fontSize: '0.8rem'
                }
              }}
            >
              Interview Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateInterview}
              sx={{
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                minWidth: { xs: 'auto', sm: 'auto' },
                // Custom breakpoints
                '@media (max-width: 350px)': {
                  fontSize: '0.65rem',
                  px: 0.75,
                  py: 0.375
                }
              }}
            >
              Schedule Interview
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box>
            {/* Stats Cards */}
            {stats && (
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 2, md: 3 } }}>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.25, sm: 2, md: 3 },
                      borderRadius: { xs: 1.5, sm: 2, md: 3 },
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                      minHeight: { xs: '70px', sm: 'auto' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      // Custom breakpoints
                      '@media (max-width: 600px)': {
                        p: 1,
                      },
                      '@media (max-width: 350px)': {
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                        backdropFilter: "blur(8px)",
                        p: 0.75
                      }
                    }}
                  >
                    <Typography
                      variant="h4"
                      color="#1565c0"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' },
                        // Custom breakpoints
                        '@media (max-width: 600px)': {
                          fontSize: '1rem'
                        },
                        '@media (max-width: 350px)': {
                          fontSize: '0.9rem'
                        }
                      }}
                    >
                      {stats.totalInterviews}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#2e3d4d"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.75rem', md: '0.875rem' },
                        // Custom breakpoints
                        '@media (max-width: 600px)': {
                          fontSize: '0.7rem'
                        },
                        '@media (max-width: 350px)': {
                          fontSize: '0.65rem'
                        }
                      }}
                    >
                      Total Interviews
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.25, sm: 2, md: 3 },
                      borderRadius: { xs: 1.5, sm: 2, md: 3 },
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                      minHeight: { xs: '70px', sm: 'auto' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      // Custom breakpoints
                      '@media (max-width: 600px)': {
                        p: 1,
                      },
                      '@media (max-width: 350px)': {
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                        backdropFilter: "blur(8px)",
                        p: 0.75
                      }
                    }}
                  >
                    <Typography
                      variant="h4"
                      color="info.main"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' },
                        // Custom breakpoints
                        '@media (max-width: 600px)': {
                          fontSize: '1rem'
                        },
                        '@media (max-width: 350px)': {
                          fontSize: '0.9rem'
                        }
                      }}
                    >
                      {stats.upcomingInterviews}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#2e3d4d"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.75rem', md: '0.875rem' },
                        // Custom breakpoints
                        '@media (max-width: 600px)': {
                          fontSize: '0.7rem'
                        },
                        '@media (max-width: 350px)': {
                          fontSize: '0.65rem'
                        }
                      }}
                    >
                      Upcoming
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.25, sm: 2, md: 3 },
                      borderRadius: { xs: 1.5, sm: 2, md: 3 },
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                      minHeight: { xs: '70px', sm: 'auto' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      // Custom breakpoints
                      '@media (max-width: 600px)': {
                        p: 1,
                      },
                      '@media (max-width: 350px)': {
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                        backdropFilter: "blur(8px)",
                        p: 0.75
                      }
                    }}
                  >
                    <Typography
                      variant="h4"
                      color="success.main"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' },
                        // Custom breakpoints
                        '@media (max-width: 600px)': {
                          fontSize: '1rem'
                        },
                        '@media (max-width: 350px)': {
                          fontSize: '0.9rem'
                        }
                      }}
                    >
                      {stats.completedInterviews}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#2e3d4d"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.75rem', md: '0.875rem' },
                        // Custom breakpoints
                        '@media (max-width: 600px)': {
                          fontSize: '0.7rem'
                        },
                        '@media (max-width: 350px)': {
                          fontSize: '0.65rem'
                        }
                      }}
                    >
                      Completed
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Filters */}
            <Paper
              sx={{
                p: { xs: 1.25, sm: 2, md: 3 },
                mb: { xs: 2, sm: 2, md: 3 },
                borderRadius: { xs: 1.5, sm: 2, md: 3 },
                backdropFilter: "blur(12px)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                // Custom breakpoints
                '@media (max-width: 600px)': {
                  p: 1,
                },
                '@media (max-width: 350px)': {
                  background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                  backdropFilter: "blur(8px)",
                  p: 0.75
                }
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                  fontWeight: 600,
                  // Custom breakpoints
                  '@media (max-width: 350px)': {
                    fontSize: '0.8rem',
                    mb: 1.5
                  }
                }}
              >
                Filters
              </Typography>

              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Status</InputLabel>
                    <Select
                      value={filters.status || ""}
                      onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                      label="Status"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>All</MenuItem>
                      <MenuItem value="scheduled" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Scheduled</MenuItem>
                      <MenuItem value="confirmed" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Confirmed</MenuItem>
                      <MenuItem value="completed" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Completed</MenuItem>
                      <MenuItem value="cancelled" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Cancelled</MenuItem>
                      <MenuItem value="rescheduled" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Rescheduled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Type</InputLabel>
                    <Select
                      value={filters.type || ""}
                      onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
                      label="Type"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>All</MenuItem>
                      <MenuItem value="phone" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Phone</MenuItem>
                      <MenuItem value="video" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Video</MenuItem>
                      <MenuItem value="in-person" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>In-Person</MenuItem>
                      <MenuItem value="technical" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Technical</MenuItem>
                      <MenuItem value="panel" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Panel</MenuItem>
                      <MenuItem value="hr" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>HR</MenuItem>
                      <MenuItem value="final" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Final</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Time</InputLabel>
                    <Select
                      value={
                        filters.upcoming ? "upcoming" : filters.past ? "past" : ""
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
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>All</MenuItem>
                      <MenuItem value="upcoming" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Upcoming</MenuItem>
                      <MenuItem value="past" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Past</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy || "scheduledDate"}
                      onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                      label="Sort By"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      <MenuItem value="scheduledDate" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Date</MenuItem>
                      <MenuItem value="status" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Status</MenuItem>
                      <MenuItem value="type" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Type</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Order</InputLabel>
                    <Select
                      value={filters.sortOrder || "asc"}
                      onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                      label="Order"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      <MenuItem value="asc" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Earliest</MenuItem>
                      <MenuItem value="desc" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Latest</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Interviews Table - Desktop */}
            <Paper
              sx={{
                borderRadius: { xs: 1.5, sm: 2, md: 3 },
                backdropFilter: "blur(12px)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                display: { xs: "none", md: "block" },
                // Custom breakpoints
                '@media (max-width: 350px)': {
                  background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                  backdropFilter: "blur(8px)"
                }
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{
                        fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                        fontWeight: 600,
                        p: { xs: 0.5, sm: 1, md: 1.5 }
                      }}>
                        Candidate
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                        fontWeight: 600,
                        p: { xs: 0.5, sm: 1, md: 1.5 }
                      }}>
                        Position
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                        fontWeight: 600,
                        p: { xs: 0.5, sm: 1, md: 1.5 }
                      }}>
                        Type
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                        fontWeight: 600,
                        p: { xs: 0.5, sm: 1, md: 1.5 }
                      }}>
                        Date & Time
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                        fontWeight: 600,
                        p: { xs: 0.5, sm: 1, md: 1.5 }
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                        fontWeight: 600,
                        p: { xs: 0.5, sm: 1, md: 1.5 }
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {interviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <CalendarIcon
                            sx={{ fontSize: { xs: 48, sm: 64 }, color: "text.secondary", mb: 2, opacity: 0.5 }}
                          />
                          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
                            No interviews found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' } }}>
                            Schedule an interview to get started
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      interviews.map((interview) => (
                        <TableRow key={interview._id} hover>
                          <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                              <Avatar
                                src={
                                  interview.user.profilePicture
                                    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${interview.user.profilePicture}`
                                    : undefined
                                }
                                sx={{
                                  width: { xs: 24, sm: 32, md: 40 },
                                  height: { xs: 24, sm: 32, md: 40 },
                                  fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                                }}
                              >
                                {interview.user.firstName[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                                }}>
                                  {interview.user.firstName} {interview.user.lastName}
                                </Typography>
                                <Typography variant="caption" color="#2e3d4d" sx={{
                                  fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' }
                                }}>
                                  {interview.user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                              }}>
                                {interview.job.title}
                              </Typography>
                              <Typography variant="caption" color="#2e3d4d" sx={{
                                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' }
                              }}>
                                {interview.company.name} • Round {interview.round}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                            <Chip
                              icon={getTypeIcon(interview.type)}
                              label={
                                interview.type.charAt(0).toUpperCase() +
                                interview.type.slice(1)
                              }
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                                height: { xs: 20, sm: 24, md: 28 }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                            <Box>
                              <Typography variant="body2" sx={{
                                fontWeight: 500,
                                fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                              }}>
                                {formatDate(interview.scheduledDate)}
                              </Typography>
                              <Typography variant="caption" color="#2e3d4d" sx={{
                                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' }
                              }}>
                                {formatTime(interview.scheduledDate)} ({interview.duration} mins)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                            <Chip
                              label={interview.status.toUpperCase()}
                              color={getStatusColor(interview.status)}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                                height: { xs: 20, sm: 24, md: 28 }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                            <Box sx={{ display: "flex", gap: { xs: 0.25, sm: 0.5, md: 0.5 }, flexWrap: "wrap" }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewInterview(interview)}
                                  sx={{
                                    width: { xs: 24, sm: 28, md: 32 },
                                    height: { xs: 24, sm: 28, md: 32 }
                                  }}
                                >
                                  <ViewIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                </IconButton>
                              </Tooltip>
                              {interview.status === "scheduled" && (
                                <Tooltip title="Confirm">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleConfirmInterview(interview)}
                                    color="success"
                                    sx={{
                                      width: { xs: 24, sm: 28, md: 32 },
                                      height: { xs: 24, sm: 28, md: 32 }
                                    }}
                                  >
                                    <CheckCircleIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {(interview.status === "scheduled" ||
                                interview.status === "confirmed") && (
                                  <>
                                    <Tooltip title="Reschedule">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleRescheduleClick(interview)}
                                        color="warning"
                                        sx={{
                                          width: { xs: 24, sm: 28, md: 32 },
                                          height: { xs: 24, sm: 28, md: 32 }
                                        }}
                                      >
                                        <RescheduleIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleCancelClick(interview)}
                                        color="error"
                                        sx={{
                                          width: { xs: 24, sm: 28, md: 32 },
                                          height: { xs: 24, sm: 28, md: 32 }
                                        }}
                                      >
                                        <CancelIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              {(interview.status === "scheduled" ||
                                interview.status === "confirmed" ||
                                interview.status === "rescheduled") && (
                                  <Tooltip title="Mark Complete">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCompleteClick(interview)}
                                      color="primary"
                                      sx={{
                                        width: { xs: 24, sm: 28, md: 32 },
                                        height: { xs: 24, sm: 28, md: 32 }
                                      }}
                                    >
                                      <CompleteIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditInterview(interview)}
                                  sx={{
                                    width: { xs: 24, sm: 28, md: 32 },
                                    height: { xs: 24, sm: 28, md: 32 }
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(interview)}
                                  color="error"
                                  sx={{
                                    width: { xs: 24, sm: 28, md: 32 },
                                    height: { xs: 24, sm: 28, md: 32 }
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Interviews Cards - Mobile */}
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              {interviews.length === 0 ? (
                <Paper
                  sx={{
                    p: { xs: 4, sm: 6 },
                    borderRadius: { xs: 1.5, sm: 2, md: 3 },
                    textAlign: "center",
                    backdropFilter: "blur(12px)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                    // Custom breakpoints
                    '@media (max-width: 350px)': {
                      background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                      backdropFilter: "blur(8px)",
                      p: 3
                    }
                  }}
                >
                  <CalendarIcon
                    sx={{ fontSize: { xs: 48, sm: 64 }, color: "text.secondary", mb: 2, opacity: 0.5 }}
                  />
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
                    No interviews found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' } }}>
                    Schedule an interview to get started
                  </Typography>
                </Paper>
              ) : (
                interviews.map((interview) => (
                  <Card
                    key={interview._id}
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      borderRadius: { xs: 1.5, sm: 2, md: 3 },
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                      boxShadow: "0 4px 15px rgba(20,30,60,0.08)",
                      // Custom breakpoints
                      '@media (max-width: 350px)': {
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                        backdropFilter: "blur(8px)"
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.25, sm: 1.5, md: 2 } }}>
                      {/* Candidate */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}>
                        <Avatar
                          src={
                            interview.user.profilePicture
                              ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${interview.user.profilePicture}`
                              : undefined
                          }
                          sx={{
                            width: { xs: 32, sm: 40, md: 48 },
                            height: { xs: 32, sm: 40, md: 48 },
                            fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' }
                          }}
                        >
                          {interview.user.firstName[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {interview.user.firstName} {interview.user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{
                            display: 'block',
                            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {interview.user.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={interview.status.toUpperCase()}
                          color={getStatusColor(interview.status)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                            height: { xs: 20, sm: 24, md: 28 }
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: { xs: 1, sm: 1.5, md: 2 } }} />

                      {/* Job Info */}
                      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                        <Typography variant="body2" color="text.secondary" sx={{
                          mb: 0.5,
                          fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                        }}>
                          Position
                        </Typography>
                        <Typography variant="subtitle2" sx={{
                          fontWeight: 600,
                          mb: 1,
                          fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {interview.job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{
                          fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' }
                        }}>
                          {interview.company.name} • Round {interview.round}
                        </Typography>
                      </Box>

                      {/* Interview Details */}
                      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                        <Typography variant="body2" color="text.secondary" sx={{
                          mb: 0.5,
                          fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                        }}>
                          Interview Details
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Chip
                            icon={getTypeIcon(interview.type)}
                            label={
                              interview.type.charAt(0).toUpperCase() + interview.type.slice(1)
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                              height: { xs: 20, sm: 24, md: 28 }
                            }}
                          />
                        </Stack>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' } }}>
                          📅 {formatDateTime(interview.scheduledDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' } }}>
                          ⏱️ {interview.duration} minutes
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{
                      justifyContent: "flex-end",
                      px: { xs: 1.25, sm: 1.5, md: 2 },
                      pb: { xs: 1.25, sm: 1.5, md: 2 },
                      flexWrap: "wrap",
                      gap: { xs: 0.5, sm: 1 }
                    }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                        onClick={() => handleViewInterview(interview)}
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                          minWidth: { xs: 'auto', sm: 'auto' },
                          px: { xs: 1, sm: 1.5 }
                        }}
                      >
                        View
                      </Button>
                      {interview.status === "scheduled" && (
                        <Button
                          size="small"
                          startIcon={<CheckCircleIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                          onClick={() => handleConfirmInterview(interview)}
                          color="success"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                            minWidth: { xs: 'auto', sm: 'auto' },
                            px: { xs: 1, sm: 1.5 }
                          }}
                        >
                          Confirm
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleEditInterview(interview)}
                        sx={{
                          width: { xs: 28, sm: 32 },
                          height: { xs: 28, sm: 32 }
                        }}
                      >
                        <EditIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(interview)}
                        color="error"
                        sx={{
                          width: { xs: 28, sm: 32 },
                          height: { xs: 28, sm: 32 }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))
              )}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 2, sm: 2.5, md: 3 } }}>
                <Pagination
                  count={totalPages}
                  page={filters.page || 1}
                  onChange={(_, page) => handleFilterChange("page", page)}
                  color="primary"
                  size="small"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                      minWidth: { xs: 28, sm: 32, md: 40 },
                      height: { xs: 28, sm: 32, md: 40 }
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Dialogs */}
      <AdminInterviewFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        interview={editMode ? selectedInterview : null}
        onSuccess={handleSuccess}
      />

      {selectedInterview && (
        <>
          <InterviewDetailDialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            interview={selectedInterview}
            isAdmin={true}
          />
          <AdminRescheduleDialog
            open={rescheduleDialogOpen}
            onClose={() => setRescheduleDialogOpen(false)}
            interview={selectedInterview}
            onSuccess={handleSuccess}
          />
          <AdminCompleteInterviewDialog
            open={completeDialogOpen}
            onClose={() => setCompleteDialogOpen(false)}
            interview={selectedInterview}
            onSuccess={handleSuccess}
          />
        </>
      )}

      {/* Cancel Interview Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => !actionLoading && setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          Cancel Interview
        </DialogTitle>
        <DialogContent>
          {selectedInterview && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to cancel this interview?
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(237, 108, 2, 0.1)",
                  borderRadius: 2,
                  border: "1px solid rgba(237, 108, 2, 0.3)",
                  my: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedInterview.job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedInterview.user.firstName} {selectedInterview.user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(selectedInterview.scheduledDate)}
                </Typography>
              </Box>
              <TextField
                label="Cancellation Reason (Optional)"
                multiline
                rows={3}
                fullWidth
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why is this interview being cancelled?"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>
            Back
          </Button>
          <Button
            onClick={handleCancelInterview}
            variant="contained"
            color="warning"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {actionLoading ? "Cancelling..." : "Cancel Interview"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Interview Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !actionLoading && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="error" />
          Delete Interview
        </DialogTitle>
        <DialogContent>
          {selectedInterview && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to permanently delete this interview?
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(244, 67, 54, 0.1)",
                  borderRadius: 2,
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                  my: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "error.main" }}>
                  {selectedInterview.job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedInterview.user.firstName} {selectedInterview.user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(selectedInterview.scheduledDate)}
                </Typography>
              </Box>
              <Alert severity="error">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  This action cannot be undone. The interview will be permanently deleted.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteInterview}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {actionLoading ? "Deleting..." : "Yes, Delete Interview"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminInterviewsPage;