"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Switch,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Divider,
    Collapse,
    Avatar,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    Badge,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Visibility as ViewIcon,
    Send as SendIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PlayArrow as TestIcon,
    Email as EmailIcon,
    NotificationsActive as ActiveIcon,
    NotificationsOff as InactiveIcon,
    ExpandMore as ExpandMoreIcon,
    Work as WorkIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import JobViewDialog from "@/components/JobViewDialog";
import { JobAlert, NotificationFrequency, Job, JobSalary } from "@/types/Job";
import {
    getMyJobAlerts,
    createJobAlert,
    updateJobAlert,
    deleteJobAlert,
    toggleJobAlertStatus,
    getMatchingJobsForAlert,
} from "@/lib/api/jobAlertAPI";
import { useRouter } from "next/navigation";
import ApplicationFormDialog from "@/components/ApplicationFormDialog";

export default function JobAlertsPage() {
    const router = useRouter();
    const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
    const [matchingJobs, setMatchingJobs] = useState<Record<string, Job[]>>({});
    const [loadingJobs, setLoadingJobs] = useState<Record<string, boolean>>({});

    // Dialog state
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<JobAlert | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        keywords: "",
        skills: "",
        notificationFrequency: "immediate" as NotificationFrequency,
    });

    // Application dialog state
    const [applicationDialog, setApplicationDialog] = useState({
        open: false,
        job: null as Job | null,
    });

    const handleApplicationSuccess = () => {
        setSnackbar({
            open: true,
            message: "Application submitted successfully!",
            severity: "success",
        });
    };

    const handleCloseApplicationDialog = () => {
        setApplicationDialog({
            open: false,
            job: null,
        });
    };


    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    const fetchJobAlerts = async () => {
        setLoading(true);
        try {
            const response = await getMyJobAlerts({ page: 1, limit: 50 });
            if (response) {
                setJobAlerts(response.jobAlerts);
            }
        } catch (error) {
            console.error("Error fetching job alerts:", error);
            setSnackbar({
                open: true,
                message: "Failed to fetch job alerts",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchMatchingJobs = async (alertId: string) => {
        setLoadingJobs((prev) => ({ ...prev, [alertId]: true }));
        try {
            const response = await getMatchingJobsForAlert(alertId, { limit: 100 });
            if (response) {
                setMatchingJobs((prev) => ({ ...prev, [alertId]: response.jobs }));
            }
        } catch (error) {
            console.error("Error fetching matching jobs:", error);
            setSnackbar({
                open: true,
                message: "Failed to load matching jobs",
                severity: "error",
            });
        } finally {
            setLoadingJobs((prev) => ({ ...prev, [alertId]: false }));
        }
    };

    useEffect(() => {
        fetchJobAlerts();
    }, []);

    const handleExpandAlert = (alertId: string) => {
        if (expandedAlert === alertId) {
            setExpandedAlert(null);
        } else {
            setExpandedAlert(alertId);
            if (!matchingJobs[alertId]) {
                fetchMatchingJobs(alertId);
            }
        }
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

    const applyToJob = (job: Job) => {
        setApplicationDialog({
            open: true,
            job: job,
        });
    };

    const handleToggleStatus = async (alertId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        try {
            const response = await toggleJobAlertStatus(alertId);
            if (response) {
                setSnackbar({
                    open: true,
                    message: response.message,
                    severity: "success",
                });
                fetchJobAlerts();
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to toggle alert status",
                severity: "error",
            });
        }
    };

    const handleCreateAlert = async () => {
        try {
            const alertData = {
                name: formData.name,
                keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
                skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
                location: { type: "any" as const },
                jobTypes: [],
                experienceLevels: [],
                notificationFrequency: formData.notificationFrequency,
                notificationPreferences: {
                    email: true,
                    push: false,
                    sms: false,
                },
            };

            const response = await createJobAlert(alertData);
            if (response) {
                setSnackbar({
                    open: true,
                    message: "Job alert created successfully!",
                    severity: "success",
                });
                setCreateDialogOpen(false);
                setFormData({ name: "", keywords: "", skills: "", notificationFrequency: "immediate" });
                fetchJobAlerts();
            }
        } catch (error: unknown) {
            setSnackbar({
                open: true,
                message: error instanceof Error ? error.message : "Failed to create job alert",
                severity: "error",
            });
        }
    };

    const handleDeleteAlert = async () => {
        if (!selectedAlert) return;

        try {
            const response = await deleteJobAlert(selectedAlert._id);
            if (response) {
                setSnackbar({
                    open: true,
                    message: "Job alert deleted successfully",
                    severity: "success",
                });
                setDeleteDialogOpen(false);
                setSelectedAlert(null);
                fetchJobAlerts();
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to delete job alert",
                severity: "error",
            });
        }
    };

    const getFrequencyColor = (frequency: NotificationFrequency) => {
        switch (frequency) {
            case "immediate":
                return "error";
            case "daily":
                return "primary";
            case "weekly":
                return "info";
            case "monthly":
                return "success";
            default:
                return "default";
        }
    };

    const formatSalary = (salary: JobSalary | undefined) => {
        if (!salary?.min && !salary?.max) return "Not specified";
        const min = salary.min ? `${salary.currency || "$"}${salary.min.toLocaleString()}` : "";
        const max = salary.max ? `${salary.currency || "$"}${salary.max.toLocaleString()}` : "";
        return `${min}${min && max ? " - " : ""}${max}`;
    };



    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ position: "relative", zIndex: 2 }}>
            <Paper
                elevation={6}
                sx={{
                    p: { xs: 2, sm: 3, md: 6 },
                    borderRadius: { xs: 2, md: 3 },
                    backdropFilter: "blur(12px)",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                    boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <NotificationsIcon sx={{ fontSize: 40, color: "primary.main" }} />
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Custom Job Alerts
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create alerts based on keywords & skills
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Create Alert
                    </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Stats */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Total Alerts: {jobAlerts.length} | Active:{" "}
                        {jobAlerts.filter((a) => a.isActive).length}
                    </Typography>
                </Box>

                {/* Job Alerts List */}
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : jobAlerts.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                        <NotificationsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" gutterBottom>
                            No job alerts found
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Create alerts to get notified about jobs matching your criteria
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Your First Alert
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {jobAlerts.map((alert) => (
                            <Accordion
                                key={alert._id}
                                expanded={expandedAlert === alert._id}
                                onChange={() => handleExpandAlert(alert._id)}
                                sx={{
                                    borderRadius: 2,
                                    background: "rgba(255,255,255,0.3)",
                                    boxShadow: "0 4px 20px rgba(20,30,60,0.08)",
                                    border: alert.isActive
                                        ? "2px solid rgba(76, 175, 80, 0.3)"
                                        : "2px solid rgba(158, 158, 158, 0.3)",
                                    "&:before": { display: "none" },
                                }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {alert.name}
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                            <Chip
                                                icon={alert.isActive ? <ActiveIcon /> : <InactiveIcon />}
                                                label={alert.isActive ? "Active" : "Inactive"}
                                                color={alert.isActive ? "success" : "default"}
                                                size="small"
                                            />
                                            <Chip
                                                label={alert.notificationFrequency}
                                                color={getFrequencyColor(alert.notificationFrequency)}
                                                size="small"
                                            />
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        zIndex: 2,
                                    }}
                                    onClick={(e) => e.stopPropagation()} // prevents collapsing
                                >
                                    <Switch
                                        checked={alert.isActive}
                                        onChange={(e) => handleToggleStatus(alert._id, e)}
                                        size="small"
                                    />
                                    <Tooltip title="Delete alert">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAlert(alert);
                                                setDeleteDialogOpen(true);
                                            }}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <AccordionDetails>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                        Matching Jobs ({matchingJobs[alert._id]?.length || 0})
                                    </Typography>

                                    {loadingJobs[alert._id] ? (
                                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                            <CircularProgress size={30} />
                                        </Box>
                                    ) : matchingJobs[alert._id]?.length === 0 ? (
                                        <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                                            <WorkIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                                            <Typography variant="body2">
                                                No matching jobs found in the last 30 days
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {matchingJobs[alert._id]?.map((job) => (
                                                <Grid size={{ xs: 12 }} key={job._id}>
                                                    <Card
                                                        sx={{
                                                            borderRadius: 2,
                                                            background: "rgba(255,255,255,0.5)",
                                                            transition: "all 0.2s",
                                                            "&:hover": {
                                                                transform: "translateY(-2px)",
                                                                boxShadow: "0 6px 20px rgba(20,30,60,0.15)",
                                                            },
                                                        }}
                                                    >
                                                        <CardContent>
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "flex-start",
                                                                    mb: 2,
                                                                }}
                                                            >
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                                        {job.title}
                                                                    </Typography>
                                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                                        <BusinessIcon fontSize="small" color="action" />
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {typeof job.company === "object"
                                                                                ? job.company.name
                                                                                : "Company"}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
                                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                            <LocationIcon fontSize="small" color="action" />
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                {job.location.type}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                            <MoneyIcon fontSize="small" color="action" />
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                {formatSalary(job.salary)}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                                        <Chip label={job.jobType} size="small" />
                                                                        <Chip label={job.experienceLevel} size="small" color="primary" />
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                        <CardActions sx={{ px: 2, pb: 2 }}>
                                                            <Button
                                                                variant="contained"
                                                                startIcon={<ViewIcon />}
                                                                onClick={() => handleViewJob(job)}
                                                                size="small"
                                                            >
                                                                View Details
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                startIcon={<SendIcon />}
                                                                onClick={() => applyToJob(job)}
                                                                size="small"
                                                            >
                                                                Apply
                                                            </Button>
                                                        </CardActions>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}
            </Paper>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Custom Job Alert</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Alert Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Backend Developer Jobs"
                            required
                        />
                        <TextField
                            label="Keywords (comma-separated)"
                            fullWidth
                            value={formData.keywords}
                            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                            placeholder="e.g., backend, developer, api"
                            helperText="Jobs must contain at least one keyword in title/description"
                        />
                        <TextField
                            label="Skills (comma-separated)"
                            fullWidth
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            placeholder="e.g., Node.js, MongoDB, React"
                            helperText="Jobs must require at least one of these skills"
                        />
                        <TextField
                            label="Notification Frequency"
                            select
                            fullWidth
                            value={formData.notificationFrequency}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    notificationFrequency: e.target.value as NotificationFrequency,
                                })
                            }
                        >
                            <MenuItem value="immediate">Immediate (when job is posted)</MenuItem>
                            <MenuItem value="daily">Daily Digest</MenuItem>
                            <MenuItem value="weekly">Weekly Digest</MenuItem>
                            <MenuItem value="monthly">Monthly Digest</MenuItem>
                        </TextField>
                        <Alert severity="info">
                            Leave keywords and skills empty to get notified about all jobs. This alert will
                            send notifications via email.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateAlert} variant="contained" disabled={!formData.name}>
                        Create Alert
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Job Alert</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete &quot;{selectedAlert?.name}&quot;? This action cannot be
                        undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteAlert} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Job View Dialog */}
            <JobViewDialog
                open={viewDialogOpen}
                onClose={handleCloseDialog}
                job={selectedJob}
            />

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
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}