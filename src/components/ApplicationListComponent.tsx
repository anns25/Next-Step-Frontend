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
    Menu,
    MenuItem,
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
    Divider,
} from "@mui/material";
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Work as WorkIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { ApplicationApi } from "@/lib/api/applicationAPI";
import { Application, ApplicationFilters, ApplicationStats } from "@/types/Application";


interface Props {
    onRefresh?: () => void;
}

const ApplicationList: React.FC<Props> = ({ onRefresh }) => {
    const theme = useTheme();
    const [applications, setApplications] = useState<Application[]>([]);
    const [stats, setStats] = useState<ApplicationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [filters, setFilters] = useState<ApplicationFilters>({
        page: 1,
        limit: 10,
        sortBy: "applicationDate",
        sortOrder: "desc",
    });
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editNotes, setEditNotes] = useState("");

    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, [filters]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await ApplicationApi.getUserApplications(filters);
            setApplications(response.applications);
            setTotalPages(response.totalPages);
            setTotal(response.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await ApplicationApi.getApplicationStats();
            setStats(response);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    const handleFilterChange = (field: keyof ApplicationFilters, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, application: Application) => {
        setMenuAnchor(event.currentTarget);
        setSelectedApplication(application);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedApplication(null);
    };

    const handleViewApplication = () => {
        setViewDialogOpen(true);
        handleMenuClose();
    };

    const handleEditApplication = () => {
        setEditNotes(selectedApplication?.notes || "");
        setEditDialogOpen(true);
        handleMenuClose();
    };

    const handleUpdateApplication = async () => {
        if (!selectedApplication) return;

        try {
            await ApplicationApi.updateApplication(selectedApplication._id, {
                notes: editNotes,
            });
            setEditDialogOpen(false);
            fetchApplications();
            onRefresh?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update application");
        }
    };

    const handleWithdrawApplication = async () => {
        if (!selectedApplication) return;

        try {
            await ApplicationApi.updateApplication(selectedApplication._id, {
                status: "withdrawn",
            });
            handleMenuClose();
            fetchApplications();
            onRefresh?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to withdraw application");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "applied":
                return "primary";
            case "under-review":
                return "warning";
            case "shortlisted":
                return "info";
            case "interview-scheduled":
                return "secondary";
            case "interviewed":
                return "default";
            case "rejected":
                return "error";
            case "accepted":
                return "success";
            case "withdrawn":
                return "default";
            default:
                return "default";
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatSalary = (salary?: Application["job"]["salary"]) => {
        if (!salary) return "Not specified";
        const { min, max, currency, period } = salary;
        if (min && max) {
            return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`;
        } else if (min) {
            return `${currency} ${min.toLocaleString()}+ / ${period}`;
        }
        return "Not specified";
    };

    const formatLocation = (location: Application["job"]["location"]) => {
        if (location.type === "remote") return "Remote";
        const parts = [location.city, location.state, location.country].filter(Boolean);
        return parts.join(", ");
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                p: { xs: 1.5, sm: 2, md: 3 },
                                mb: { xs: 2, sm: 3 },
                                borderRadius: 3,
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                textAlign: "center"
                            }}
                        >
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                                {stats.totalApplications}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Applications
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                p: { xs: 1.5, sm: 2, md: 3 },
                                mb: { xs: 2, sm: 3 },
                                borderRadius: 3,
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                textAlign: "center"
                            }}
                        >
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                                {stats.accepted}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Accepted
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                p: { xs: 1.5, sm: 2, md: 3 },
                                mb: { xs: 2, sm: 3 },
                                borderRadius: 3,
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                textAlign: "center"
                            }}
                        >
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                                {stats.underReview + stats.shortlisted}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                In Progress
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                p: { xs: 1.5, sm: 2, md: 3 },
                                mb: { xs: 2, sm: 3 },
                                borderRadius: 3,
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                textAlign: "center"
                            }}
                        >
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                                {stats.recentApplications}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                This Month
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
                    borderRadius: 3,
                    backdropFilter: "blur(12px)",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                    boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status || ""}
                            onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="applied">Applied</MenuItem>
                            <MenuItem value="under-review">Under Review</MenuItem>
                            <MenuItem value="shortlisted">Shortlisted</MenuItem>
                            <MenuItem value="interview-scheduled">Interview Scheduled</MenuItem>
                            <MenuItem value="interviewed">Interviewed</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                            <MenuItem value="accepted">Accepted</MenuItem>
                            <MenuItem value="withdrawn">Withdrawn</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={filters.sortBy || "applicationDate"}
                            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                            label="Sort By"
                        >
                            <MenuItem value="applicationDate">Date</MenuItem>
                            <MenuItem value="status">Status</MenuItem>
                            <MenuItem value="company">Company</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Order</InputLabel>
                        <Select
                            value={filters.sortOrder || "desc"}
                            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                            label="Order"
                        >
                            <MenuItem value="desc">Newest</MenuItem>
                            <MenuItem value="asc">Oldest</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Applications List */}
            {applications.length === 0 ? (
                <Paper
                    sx={{
                        p: { xs: 1.5, sm: 2, md: 3 },
                        mb: { xs: 2, sm: 3 },
                        borderRadius: 3,
                        backdropFilter: "blur(12px)",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                        boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                        textAlign: "center"
                    }}
                >
                    <WorkIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                        No applications found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You haven't applied to any jobs yet
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {applications.map((application) => (
                        <Grid size={{ xs: 12 }} key={application._id}>
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
                                                {application.job.title}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                                <Chip
                                                    icon={<BusinessIcon />}
                                                    label={application.company.name}
                                                    sx={{
                                                        fontWeight: 400,
                                                        borderColor: theme.palette.text.primary,
                                                        color: theme.palette.text.primary,
                                                    }}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                                <Chip
                                                    icon={<WorkIcon />}
                                                    label={`${application.job.jobType} • ${application.job.experienceLevel}`}
                                                    variant="filled"
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 400,
                                                        bgcolor: "#495866", // ✅ your custom background
                                                        color: "#fff",      // ✅ text color
                                                        "& .MuiChip-icon": {
                                                            color: "#fff",    // ✅ make the icon white too
                                                        },
                                                    }}
                                                />


                                                <Chip
                                                    icon={<LocationIcon />}
                                                    label={formatLocation(application.job.location)}
                                                    color="primary"
                                                    variant="filled"   // ✅ makes it stand out more
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 400,
                                                        bgcolor: theme.palette.primary.main,
                                                        color: "#fff",
                                                    }}
                                                />

                                            </Stack>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Chip
                                                label={application.status.replace("-", " ").toUpperCase()}
                                                color={getStatusColor(application.status)}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                            <IconButton
                                                onClick={(e) => handleMenuClick(e, application)}
                                                size="small"
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        💰 {formatSalary(application.job.salary)}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        📅 Applied on {formatDate(application.applicationDate)}
                                    </Typography>

                                    {application.coverLetter && (
                                        <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
                                            "{application.coverLetter.substring(0, 150)}..."
                                        </Typography>
                                    )}
                                </CardContent>

                                <CardActions sx={{ px: 2, pb: 2 }}>
                                    <Button
                                        startIcon={<ViewIcon />}
                                        onClick={() => {
                                            setSelectedApplication(application);
                                            setViewDialogOpen(true);
                                        }}
                                        size="small"
                                    >
                                        View Details
                                    </Button>
                                    {application.resume && (
                                        <Button
                                            startIcon={<AttachFileIcon />}
                                            href={`${process.env.NEXT_PUBLIC_API_URL}/${application.resume}`}
                                            target="_blank"
                                            size="small"
                                        >
                                            View Resume
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

            {/* View Application Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Application Details
                </DialogTitle>
                <DialogContent>
                    {selectedApplication && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {selectedApplication.job.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {selectedApplication.company.name} • {selectedApplication.job.jobType}
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Cover Letter
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {selectedApplication.coverLetter || "No cover letter provided"}
                            </Typography>

                            {selectedApplication.notes && (
                                <>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                        Notes
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {selectedApplication.notes}
                                    </Typography>
                                </>
                            )}

                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Application Status
                            </Typography>
                            <Chip
                                label={selectedApplication.status.replace("-", " ").toUpperCase()}
                                color={getStatusColor(selectedApplication.status)}
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Application Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Edit Application Notes
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Notes"
                        multiline
                        rows={4}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                        helperText={`${editNotes.length}/500 characters`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateApplication} variant="contained">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleViewApplication}>
                    <ViewIcon sx={{ mr: 1 }} />
                    View Details
                </MenuItem>
                <MenuItem onClick={handleEditApplication}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit Notes
                </MenuItem>
                <MenuItem onClick={handleWithdrawApplication} sx={{ color: "error.main" }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Withdraw Application
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ApplicationList;