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

  const handleFilterChange = (field: keyof InterviewFilters, value: any) => {
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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              mb: { xs: 2, sm: 3 },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem", lg: "2.125rem" },
                lineHeight: 1.2,
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
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{xs:12, md:4}}>
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
                    <Typography variant="h4" color="#1565c0" sx={{ fontWeight: 600 }}>
                      {stats.totalInterviews}
                    </Typography>
                    <Typography variant="body2" color="#2e3d4d">
                      Total Interviews
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{xs:12, md:4}}>
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
                    <Typography variant="body2" color="#2e3d4d">
                      Upcoming
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{xs:12, md:4}}>
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
                    <Typography variant="body2" color="#2e3d4d">
                      Completed
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Filters */}
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                mb: 3,
                borderRadius: 3,
                backdropFilter: "blur(12px)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
              }}
            >
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid size={{xs:12, sm:6, md:2}}>
                  <FormControl fullWidth size="small">
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
                </Grid>
                <Grid size={{xs:12, sm:6, md:2}}>
                  <FormControl fullWidth size="small">
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
                </Grid>
                <Grid size={{xs:12, sm:6, md:2}}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Time</InputLabel>
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
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="upcoming">Upcoming</MenuItem>
                      <MenuItem value="past">Past</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{xs:12, sm:6, md:2}}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy || "scheduledDate"}
                      onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="scheduledDate">Date</MenuItem>
                      <MenuItem value="status">Status</MenuItem>
                      <MenuItem value="type">Type</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{xs:12, sm:6, md:2}}>
                  <FormControl fullWidth size="small">
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
                </Grid>
              </Grid>
            </Paper>

            {/* Interviews Table - Desktop */}
            <Paper
              sx={{
                borderRadius: 3,
                backdropFilter: "blur(12px)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                display: { xs: "none", md: "block" },
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                        Candidate
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                        Position
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                        Date & Time
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {interviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <CalendarIcon
                            sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }}
                          />
                          <Typography variant="h6" gutterBottom>
                            No interviews found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Schedule an interview to get started
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      interviews.map((interview) => (
                        <TableRow key={interview._id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Avatar
                                src={
                                  interview.user.profilePicture
                                    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${interview.user.profilePicture}`
                                    : undefined
                                }
                                sx={{ width: 40, height: 40 }}
                              >
                                {interview.user.firstName[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {interview.user.firstName} {interview.user.lastName}
                                </Typography>
                                <Typography variant="caption" color="#2e3d4d">
                                  {interview.user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {interview.job.title}
                              </Typography>
                              <Typography variant="caption" color="#2e3d4d">
                                {interview.company.name} • Round {interview.round}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getTypeIcon(interview.type)}
                              label={
                                interview.type.charAt(0).toUpperCase() +
                                interview.type.slice(1)
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatDate(interview.scheduledDate)}
                              </Typography>
                              <Typography variant="caption" color="#2e3d4d">
                                {formatTime(interview.scheduledDate)} ({interview.duration} mins)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={interview.status.toUpperCase()}
                              color={getStatusColor(interview.status)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewInterview(interview)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {interview.status === "scheduled" && (
                                <Tooltip title="Confirm">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleConfirmInterview(interview)}
                                    color="success"
                                  >
                                    <CheckCircleIcon fontSize="small" />
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
                                    >
                                      <RescheduleIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancel">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCancelClick(interview)}
                                      color="error"
                                    >
                                      <CancelIcon fontSize="small" />
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
                                  >
                                    <CompleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditInterview(interview)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(interview)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
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
                    p: 6,
                    borderRadius: 3,
                    textAlign: "center",
                    backdropFilter: "blur(12px)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                  }}
                >
                  <CalendarIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    No interviews found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule an interview to get started
                  </Typography>
                </Paper>
              ) : (
                interviews.map((interview) => (
                  <Card
                    key={interview._id}
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                      boxShadow: "0 4px 15px rgba(20,30,60,0.08)",
                    }}
                  >
                    <CardContent>
                      {/* Candidate */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Avatar
                          src={
                            interview.user.profilePicture
                              ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${interview.user.profilePicture}`
                              : undefined
                          }
                          sx={{ width: 48, height: 48 }}
                        >
                          {interview.user.firstName[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {interview.user.firstName} {interview.user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {interview.user.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={interview.status.toUpperCase()}
                          color={getStatusColor(interview.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Job Info */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Position
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {interview.job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {interview.company.name} • Round {interview.round}
                        </Typography>
                      </Box>

                      {/* Interview Details */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
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
                          />
                        </Stack>
                        <Typography variant="body2">
                          📅 {formatDateTime(interview.scheduledDate)}
                        </Typography>
                        <Typography variant="body2">
                          ⏱️ {interview.duration} minutes
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2, flexWrap: "wrap", gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewInterview(interview)}
                      >
                        View
                      </Button>
                      {interview.status === "scheduled" && (
                        <Button
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleConfirmInterview(interview)}
                          color="success"
                        >
                          Confirm
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleEditInterview(interview)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(interview)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))
              )}
            </Box>

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