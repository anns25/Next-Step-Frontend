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

  const handleFilterChange = (field: keyof InterviewFilters, value: string | number | boolean | undefined) => {
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
            p: { xs: 0.5, sm: 2, md: 3, lg: 4 },
            borderRadius: { xs: 0, sm: 2, md: 3 },
            backdropFilter: "blur(12px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
            boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
            mx: { xs: 0.25, sm: 2, md: 0 },
            minHeight: { xs: '100vh', sm: 'auto' },
            // Custom breakpoints for very small screens
            '@media (max-width: 360px)': {
              p: 0.25,
              mx: 0.125,
              background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.12) 100%)",
              backdropFilter: "blur(8px)"
            },
            '@media (max-width: 240px)': {
              p: 0.125,
              mx: 0,
              background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.1) 100%)",
              backdropFilter: "blur(6px)"
            }
          }}
        >
          <Box sx={{
            p: { xs: 1, sm: 2, md: 3 },
            px: { xs: 0.75, sm: 2, md: 3 },
            // Custom breakpoints
            '@media (max-width: 360px)': {
              p: 0.75,
              px: 0.5
            },
            '@media (max-width: 240px)': {
              p: 0.5,
              px: 0.25
            }
          }}>
            {/* Header */}
            <Box sx={{
              mb: { xs: 2, sm: 3 },
              // Custom breakpoints
              '@media (max-width: 360px)': {
                mb: 1.5
              },
              '@media (max-width: 240px)': {
                mb: 1
              }
            }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  fontSize: {
                    xs: '1.1rem',
                    sm: '1.5rem',
                    md: '1.75rem',
                    lg: '2rem'
                  },
                  textAlign: { xs: 'center', sm: 'left' },
                  // Custom breakpoints
                  '@media (max-width: 360px)': {
                    fontSize: '1rem'
                  },
                  '@media (max-width: 240px)': {
                    fontSize: '0.9rem'
                  }
                }}
                gutterBottom
              >
                My Interviews
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textAlign: { xs: 'center', sm: 'left' },
                  // Custom breakpoints
                  '@media (max-width: 360px)': {
                    fontSize: '0.7rem'
                  },
                  '@media (max-width: 240px)': {
                    fontSize: '0.65rem'
                  }
                }}
              >
                View your scheduled interviews and add preparation notes
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  // Custom breakpoints
                  '@media (max-width: 360px)': {
                    mb: 1.5,
                    fontSize: '0.7rem'
                  },
                  '@media (max-width: 240px)': {
                    mb: 1,
                    fontSize: '0.65rem'
                  }
                }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            {/* Stats Cards */}
            {stats && (
              <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 3 },
                      borderRadius: { xs: 2, sm: 3 },
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                      height: { xs: '80px', sm: 'auto' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      // Custom breakpoints to maintain glassy effect
                      '@media (max-width: 360px)': {
                        p: 1,
                        height: '70px',
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                        backdropFilter: "blur(8px)"
                      },
                      '@media (max-width: 240px)': {
                        p: 0.75,
                        height: '60px',
                        background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(245,250,255,0.06) 100%)",
                        backdropFilter: "blur(6px)"
                      }
                    }}
                  >
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                        // Custom breakpoints
                        '@media (max-width: 360px)': {
                          fontSize: '1.1rem'
                        },
                        '@media (max-width: 240px)': {
                          fontSize: '1rem'
                        }
                      }}
                    >
                      {stats.totalInterviews}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        // Custom breakpoints
                        '@media (max-width: 360px)': {
                          fontSize: '0.65rem'
                        },
                        '@media (max-width: 240px)': {
                          fontSize: '0.6rem'
                        }
                      }}
                    >
                      Total Interviews
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 3 },
                      borderRadius: { xs: 2, sm: 3 },
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                      height: { xs: '80px', sm: 'auto' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      // Custom breakpoints to maintain glassy effect
                      '@media (max-width: 360px)': {
                        p: 1,
                        height: '70px',
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                        backdropFilter: "blur(8px)"
                      },
                      '@media (max-width: 240px)': {
                        p: 0.75,
                        height: '60px',
                        background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(245,250,255,0.06) 100%)",
                        backdropFilter: "blur(6px)"
                      }
                    }}
                  >
                    <Typography
                      variant="h4"
                      color="info.main"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                        // Custom breakpoints
                        '@media (max-width: 360px)': {
                          fontSize: '1.1rem'
                        },
                        '@media (max-width: 240px)': {
                          fontSize: '1rem'
                        }
                      }}
                    >
                      {stats.upcomingInterviews}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        // Custom breakpoints
                        '@media (max-width: 360px)': {
                          fontSize: '0.65rem'
                        },
                        '@media (max-width: 240px)': {
                          fontSize: '0.6rem'
                        }
                      }}
                    >
                      Upcoming
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 3 },
                      borderRadius: { xs: 2, sm: 3 },
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                      boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                      textAlign: "center",
                      height: { xs: '80px', sm: 'auto' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      // Custom breakpoints to maintain glassy effect
                      '@media (max-width: 360px)': {
                        p: 1,
                        height: '70px',
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                        backdropFilter: "blur(8px)"
                      },
                      '@media (max-width: 240px)': {
                        p: 0.75,
                        height: '60px',
                        background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(245,250,255,0.06) 100%)",
                        backdropFilter: "blur(6px)"
                      }
                    }}
                  >
                    <Typography
                      variant="h4"
                      color="success.main"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                        // Custom breakpoints
                        '@media (max-width: 360px)': {
                          fontSize: '1.1rem'
                        },
                        '@media (max-width: 240px)': {
                          fontSize: '1rem'
                        }
                      }}
                    >
                      {stats.completedInterviews}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        // Custom breakpoints
                        '@media (max-width: 360px)': {
                          fontSize: '0.65rem'
                        },
                        '@media (max-width: 240px)': {
                          fontSize: '0.6rem'
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
                p: { xs: 1.5, sm: 2, md: 3 },
                mb: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
                backdropFilter: "blur(12px)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                // Custom breakpoints to maintain glassy effect
                '@media (max-width: 360px)': {
                  p: 1,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                  backdropFilter: "blur(8px)"
                },
                '@media (max-width: 240px)': {
                  p: 0.75,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(245,250,255,0.06) 100%)",
                  backdropFilter: "blur(6px)"
                }
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 2 }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                sx={{
                  // Custom breakpoints for better spacing
                  '@media (max-width: 360px)': {
                    spacing: 1
                  },
                  '@media (max-width: 240px)': {
                    spacing: 0.75
                  }
                }}
              >
                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 120 },
                    // Custom breakpoints
                    '@media (max-width: 360px)': {
                      minWidth: '100%'
                    }
                  }}
                >
                  <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                    label="Status"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    <MenuItem value="" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>All</MenuItem>
                    <MenuItem value="scheduled" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Scheduled</MenuItem>
                    <MenuItem value="confirmed" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Confirmed</MenuItem>
                    <MenuItem value="completed" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Completed</MenuItem>
                    <MenuItem value="cancelled" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Cancelled</MenuItem>
                    <MenuItem value="rescheduled" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Rescheduled</MenuItem>
                  </Select>
                </FormControl>

                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 120 },
                    // Custom breakpoints
                    '@media (max-width: 360px)': {
                      minWidth: '100%'
                    }
                  }}
                >
                  <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Type</InputLabel>
                  <Select
                    value={filters.type || ""}
                    onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
                    label="Type"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    <MenuItem value="" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>All</MenuItem>
                    <MenuItem value="phone" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Phone</MenuItem>
                    <MenuItem value="video" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Video</MenuItem>
                    <MenuItem value="in-person" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>In-Person</MenuItem>
                    <MenuItem value="technical" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Technical</MenuItem>
                    <MenuItem value="panel" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Panel</MenuItem>
                    <MenuItem value="hr" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>HR</MenuItem>
                    <MenuItem value="final" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Final</MenuItem>
                  </Select>
                </FormControl>

                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 120 },
                    // Custom breakpoints
                    '@media (max-width: 360px)': {
                      minWidth: '100%'
                    }
                  }}
                >
                  <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Time</InputLabel>
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
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    <MenuItem value="" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>All</MenuItem>
                    <MenuItem value="upcoming" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Upcoming</MenuItem>
                    <MenuItem value="past" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Past</MenuItem>
                  </Select>
                </FormControl>

                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 100 },
                    // Custom breakpoints
                    '@media (max-width: 360px)': {
                      minWidth: '100%'
                    }
                  }}
                >
                  <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Order</InputLabel>
                  <Select
                    value={filters.sortOrder || "asc"}
                    onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                    label="Order"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    <MenuItem value="asc" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Earliest</MenuItem>
                    <MenuItem value="desc" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Latest</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            {/* Interviews List */}
            {interviews.length === 0 ? (
              <Paper
                sx={{
                  p: { xs: 3, sm: 4, md: 6 },
                  borderRadius: { xs: 2, sm: 3 },
                  backdropFilter: "blur(12px)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                  boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                  textAlign: "center",
                  // Custom breakpoints to maintain glassy effect
                  '@media (max-width: 360px)': {
                    p: 2,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                    backdropFilter: "blur(8px)"
                  },
                  '@media (max-width: 240px)': {
                    p: 1.5,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(245,250,255,0.06) 100%)",
                    backdropFilter: "blur(6px)"
                  }
                }}
              >
                <CalendarIcon sx={{
                  fontSize: { xs: 48, sm: 56, md: 64 },
                  color: "text.secondary",
                  mb: 2,
                  opacity: 0.5,
                  // Custom breakpoints
                  '@media (max-width: 360px)': {
                    fontSize: 40
                  },
                  '@media (max-width: 240px)': {
                    fontSize: 32
                  }
                }} />
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    // Custom breakpoints
                    '@media (max-width: 360px)': {
                      fontSize: '0.9rem'
                    },
                    '@media (max-width: 240px)': {
                      fontSize: '0.8rem'
                    }
                  }}
                >
                  No interviews scheduled
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    // Custom breakpoints
                    '@media (max-width: 360px)': {
                      fontSize: '0.7rem'
                    },
                    '@media (max-width: 240px)': {
                      fontSize: '0.65rem'
                    }
                  }}
                >
                  Your HR team will schedule interviews for you
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {interviews.map((interview) => (
                  <Grid size={{ xs: 12 }} key={interview._id}>
                    <Card
                      sx={{
                        borderRadius: { xs: 2, sm: 3 },
                        backdropFilter: "blur(12px)",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                        boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: { xs: "none", sm: "translateY(-4px)" },
                          boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                        },
                        // Custom breakpoints to maintain glassy effect
                        '@media (max-width: 360px)': {
                          background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.12) 100%)",
                          backdropFilter: "blur(8px)"
                        },
                        '@media (max-width: 240px)': {
                          background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(245,250,255,0.1) 100%)",
                          backdropFilter: "blur(6px)"
                        }
                      }}
                    >
                      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                        <Box sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: { xs: 1, sm: 0 }
                        }}>
                          <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                // Custom breakpoints
                                '@media (max-width: 360px)': {
                                  fontSize: '0.9rem'
                                },
                                '@media (max-width: 240px)': {
                                  fontSize: '0.8rem'
                                }
                              }}
                            >
                              {interview.job.title}
                            </Typography>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={{ xs: 0.5, sm: 1 }}
                              sx={{
                                mb: 2,
                                flexWrap: 'wrap',
                                gap: { xs: 0.5, sm: 1 }
                              }}
                            >
                              <Chip
                                icon={<BusinessIcon />}
                                label={interview.company.name}
                                variant="outlined"
                                size="small"
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  height: { xs: 24, sm: 32 },
                                  // Custom breakpoints
                                  '@media (max-width: 360px)': {
                                    fontSize: '0.65rem',
                                    height: 22
                                  },
                                  '@media (max-width: 240px)': {
                                    fontSize: '0.6rem',
                                    height: 20
                                  }
                                }}
                              />
                              <Chip
                                icon={getTypeIcon(interview.type)}
                                label={interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                                variant="filled"
                                size="small"
                                sx={{
                                  bgcolor: "#495866",
                                  color: "#fff",
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  height: { xs: 24, sm: 32 },
                                  "& .MuiChip-icon": {
                                    color: "#fff",
                                  },
                                  // Custom breakpoints
                                  '@media (max-width: 360px)': {
                                    fontSize: '0.65rem',
                                    height: 22
                                  },
                                  '@media (max-width: 240px)': {
                                    fontSize: '0.6rem',
                                    height: 20
                                  }
                                }}
                              />
                              <Chip
                                label={`Round ${interview.round}`}
                                color="primary"
                                variant="filled"
                                size="small"
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  height: { xs: 24, sm: 32 },
                                  // Custom breakpoints
                                  '@media (max-width: 360px)': {
                                    fontSize: '0.65rem',
                                    height: 22
                                  },
                                  '@media (max-width: 240px)': {
                                    fontSize: '0.6rem',
                                    height: 20
                                  }
                                }}
                              />
                            </Stack>
                          </Box>
                          <Chip
                            label={interview.status.toUpperCase()}
                            color={getStatusColor(interview.status)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 32 },
                              alignSelf: { xs: 'flex-start', sm: 'center' },
                              // Custom breakpoints
                              '@media (max-width: 360px)': {
                                fontSize: '0.65rem',
                                height: 22
                              },
                              '@media (max-width: 240px)': {
                                fontSize: '0.6rem',
                                height: 20
                              }
                            }}
                          />
                        </Box>

                        <Stack spacing={1}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CalendarIcon
                              fontSize="small"
                              color="action"
                              sx={{ fontSize: { xs: 16, sm: 20 } }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                // Custom breakpoints
                                '@media (max-width: 360px)': {
                                  fontSize: '0.7rem'
                                },
                                '@media (max-width: 240px)': {
                                  fontSize: '0.65rem'
                                }
                              }}
                            >
                              {formatDate(interview.scheduledDate)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TimeIcon
                              fontSize="small"
                              color="action"
                              sx={{ fontSize: { xs: 16, sm: 20 } }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                // Custom breakpoints
                                '@media (max-width: 360px)': {
                                  fontSize: '0.7rem'
                                },
                                '@media (max-width: 240px)': {
                                  fontSize: '0.65rem'
                                }
                              }}
                            >
                              {formatTime(interview.scheduledDate)} ({interview.duration} mins)
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationIcon
                              fontSize="small"
                              color="action"
                              sx={{ fontSize: { xs: 16, sm: 20 } }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                // Custom breakpoints
                                '@media (max-width: 360px)': {
                                  fontSize: '0.7rem'
                                },
                                '@media (max-width: 240px)': {
                                  fontSize: '0.65rem'
                                }
                              }}
                            >
                              {interview.location.type === "remote"
                                ? "Remote"
                                : interview.location.type === "phone"
                                  ? "Phone"
                                  : interview.location.address || "Office"}
                            </Typography>
                          </Box>
                          {interview.interviewers.length > 0 && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <PersonIcon
                                fontSize="small"
                                color="action"
                                sx={{ fontSize: { xs: 16, sm: 20 } }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  // Custom breakpoints
                                  '@media (max-width: 360px)': {
                                    fontSize: '0.7rem'
                                  },
                                  '@media (max-width: 240px)': {
                                    fontSize: '0.65rem'
                                  }
                                }}
                              >
                                {interview.interviewers.map((i) => i.name).join(", ")}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>

                      <CardActions sx={{
                        px: { xs: 1.5, sm: 2 },
                        pb: { xs: 1.5, sm: 2 },
                        gap: { xs: 1, sm: 1 },
                        flexWrap: "wrap",
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}>
                        <Button
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewInterview(interview)}
                          size="small"
                          fullWidth
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            // Custom breakpoints
                            '@media (max-width: 360px)': {
                              fontSize: '0.7rem'
                            },
                            '@media (max-width: 240px)': {
                              fontSize: '0.65rem'
                            }
                          }}
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
                              fullWidth
                              sx={{
                                backgroundColor: theme.palette.success.main,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                '&:hover': {
                                  backgroundColor: theme.palette.success.dark,
                                },
                                // Custom breakpoints
                                '@media (max-width: 360px)': {
                                  fontSize: '0.7rem'
                                },
                                '@media (max-width: 240px)': {
                                  fontSize: '0.65rem'
                                }
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
              <Box sx={{
                display: "flex",
                justifyContent: "center",
                mt: { xs: 2, sm: 3 },
                px: { xs: 1, sm: 0 }
              }}>
                <Pagination
                  count={totalPages}
                  page={filters.page || 1}
                  onChange={(_, page) => handleFilterChange("page", page)}
                  color="primary"
                  size="small"
                  siblingCount={0}
                  boundaryCount={1}
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