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
    useMediaQuery,
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
    GetApp as DownloadIcon,
    Cancel as WithdrawIcon,
    Warning as WarningIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Application, ApplicationFilters, ApplicationStats } from "@/types/Application";
import { getApplicationStats, getUserApplications, updateApplication } from "@/lib/api/applicationAPI";


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
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
    const [editNotes, setEditNotes] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, [filters]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await getUserApplications(filters);
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
            const response = await getApplicationStats();
            setStats(response);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    const handleFilterChange = (field: keyof ApplicationFilters, value: string | number | undefined) => {
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

    const handleUpdateApplication = async () => {
        if (!selectedApplication) return;

        try {
            await updateApplication(selectedApplication._id, {
                notes: editNotes,
                coverLetter: coverLetter
            });
            setEditDialogOpen(false);
            fetchApplications();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update application");
        }
    };

    const handleWithdrawClick = (application: Application) => {
        setSelectedApplication(application);
        setWithdrawDialogOpen(true);
    };

    const handleWithdrawApplication = async () => {
        if (!selectedApplication) return;

        try {
            setWithdrawLoading(true);
            await updateApplication(selectedApplication._id, {
                status: "withdrawn",
            });
            setWithdrawDialogOpen(false);
            fetchApplications();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to withdraw application");
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleViewResume = (application: Application) => {
        if (application.resume) {
            const resumeUrl = `${process.env.NEXT_PUBLIC_API_URL}/${application.resume}`;
            window.open(resumeUrl, '_blank');
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
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                p: { xs: 1, sm: 2, md: 3 },
                                borderRadius: { xs: 2, sm: 3 },
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                textAlign: "center",
                                height: { xs: '80px', sm: 'auto' },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography
                                variant="h4"
                                color="primary"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                                }}
                            >
                                {stats.totalApplications}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                                }}
                            >
                                Total Applications
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                p: { xs: 1, sm: 2, md: 3 },
                                borderRadius: { xs: 2, sm: 3 },
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                textAlign: "center",
                                height: { xs: '80px', sm: 'auto' },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography
                                variant="h4"
                                color="success.main"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                                }}
                            >
                                {stats.accepted}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                                }}
                            >
                                Accepted
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                p: { xs: 1, sm: 2, md: 3 },
                                borderRadius: { xs: 2, sm: 3 },
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                textAlign: "center",
                                height: { xs: '80px', sm: 'auto' },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography
                                variant="h4"
                                color="warning.main"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                                }}
                            >
                                {stats.underReview + stats.shortlisted}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                                }}
                            >
                                In Progress
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                p: { xs: 1, sm: 2, md: 3 },
                                borderRadius: { xs: 2, sm: 3 },
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                textAlign: "center",
                                height: { xs: '80px', sm: 'auto' },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography
                                variant="h4"
                                color="info.main"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                                }}
                            >
                                {stats.recentApplications}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                                }}
                            >
                                This Month
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Paper
                sx={{
                    p: { xs: 1, sm: 2, md: 3 },
                    mb: { xs: 2, sm: 3 },
                    borderRadius: { xs: 2, sm: 3 },
                    backdropFilter: "blur(12px)",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                    boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1, sm: 2 }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status || ""}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                handleFilterChange("status", newValue === "" ? undefined : newValue);
                            }}
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

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
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

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}>
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
                        borderRadius: { xs: 2, sm: 3 },
                        backdropFilter: "blur(12px)",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                        boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                        textAlign: "center"
                    }}
                >
                    <WorkIcon sx={{
                        fontSize: { xs: 48, sm: 64 },
                        color: "text.secondary",
                        mb: 2,
                        opacity: 0.5
                    }} />
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        No applications found
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                    >
                        You haven&apos;t applied to any jobs yet
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                    {applications.map((application) => (
                        <Grid size={{ xs: 12 }} key={application._id}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
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
                                                    fontSize: { xs: '1rem', sm: '1.25rem' }
                                                }}
                                            >
                                                {application.job.title}
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
                                                    label={application.company.name}
                                                    sx={{
                                                        fontWeight: 400,
                                                        borderColor: theme.palette.text.primary,
                                                        color: theme.palette.text.primary,
                                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                        height: { xs: 24, sm: 32 }
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
                                                        bgcolor: "#495866",
                                                        color: "#fff",
                                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                        height: { xs: 24, sm: 32 },
                                                        "& .MuiChip-icon": {
                                                            color: "#fff",
                                                        },
                                                    }}
                                                />
                                                <Chip
                                                    icon={<LocationIcon />}
                                                    label={formatLocation(application.job.location)}
                                                    color="primary"
                                                    variant="filled"
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 400,
                                                        bgcolor: theme.palette.primary.main,
                                                        color: "#fff",
                                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                        height: { xs: 24, sm: 32 }
                                                    }}
                                                />
                                            </Stack>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            alignSelf: { xs: 'flex-start', sm: 'center' }
                                        }}>
                                            <Chip
                                                label={application.status.replace("-", " ").toUpperCase()}
                                                color={getStatusColor(application.status)}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                    height: { xs: 24, sm: 32 }
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                        }}
                                    >
                                        💰 {formatSalary(application.job.salary)}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                        }}
                                    >
                                        📅 Applied on {formatDate(application.applicationDate)}
                                    </Typography>

                                    {application.coverLetter && (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 2,
                                                fontStyle: "italic",
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                            }}
                                        >
                                            &quot;{application.coverLetter.substring(0, 150)}...&quot;
                                        </Typography>
                                    )}
                                </CardContent>

                                <CardActions sx={{
                                    px: { xs: 1.5, sm: 2 },
                                    pb: { xs: 1.5, sm: 2 },
                                    gap: { xs: 0.5, sm: 1 },
                                    flexWrap: 'wrap',
                                    flexDirection: { xs: 'column', sm: 'row' }
                                }}>
                                    {/* View Details Button */}
                                    <Button
                                        variant="outlined"
                                        startIcon={<ViewIcon />}
                                        onClick={() => {
                                            setSelectedApplication(application);
                                            setViewDialogOpen(true);
                                        }}
                                        size="small"
                                        fullWidth={isMobile}
                                        sx={{
                                            borderColor: theme.palette.info.main,
                                            color: theme.palette.info.main,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                        }}
                                    >
                                        View Details
                                    </Button>

                                    {/* View Resume Button */}
                                    {application.resume && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => handleViewResume(application)}
                                            size="small"
                                            fullWidth={isMobile}
                                            sx={{
                                                borderColor: theme.palette.success.main,
                                                color: theme.palette.success.main,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                            }}
                                        >
                                            View Resume
                                        </Button>
                                    )}

                                    {/* Edit Notes Button - Blue Contained */}
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={() => {
                                            setSelectedApplication(application);
                                            setEditNotes(application.notes || "");
                                            setCoverLetter(application.coverLetter || "");
                                            setEditDialogOpen(true);
                                        }}
                                        size="small"
                                        fullWidth={isMobile}
                                        sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.dark,
                                            },
                                        }}
                                    >
                                        Edit Notes
                                    </Button>

                                    {/* Withdraw Application Button - Red Outline */}
                                    <Button
                                        variant="outlined"
                                        startIcon={<WithdrawIcon />}
                                        onClick={() => handleWithdrawClick(application)}
                                        size="small"
                                        fullWidth={isMobile}
                                        sx={{
                                            borderColor: theme.palette.error.main,
                                            color: theme.palette.error.main,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                        }}
                                    >
                                        Withdraw Application
                                    </Button>
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
                        size={isMobile ? "small" : "medium"}
                        siblingCount={isMobile ? 0 : 1}
                        boundaryCount={1}
                    />
                </Box>
            )}

            {/* View Application Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: { xs: 0, sm: 3 },
                        margin: { xs: 0, sm: 2 },
                        width: { xs: '100%', sm: 'auto' },
                        height: { xs: '100%', sm: 'auto' }
                    }
                }}
            >
                <DialogTitle sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    p: { xs: 2, sm: 3 }
                }}>
                    Application Details
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {selectedApplication && (
                        <Box>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontSize: { xs: '1rem', sm: '1.25rem' }
                                }}
                            >
                                {selectedApplication.job.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                                sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            >
                                {selectedApplication.company.name} • {selectedApplication.job.jobType}
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                            >
                                Cover Letter
                            </Typography>
                            <Typography
                                variant="body2"
                                paragraph
                                sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            >
                                {selectedApplication.coverLetter || "No cover letter provided"}
                            </Typography>

                            {selectedApplication.notes && (
                                <>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }}
                                    >
                                        Notes
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        paragraph
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                        }}
                                    >
                                        {selectedApplication.notes}
                                    </Typography>
                                </>
                            )}

                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                            >
                                Application Status
                            </Typography>
                            <Chip
                                label={selectedApplication.status.replace("-", " ").toUpperCase()}
                                color={getStatusColor(selectedApplication.status)}
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    p: { xs: 2, sm: 3 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Button
                        onClick={() => setViewDialogOpen(false)}
                        fullWidth={isMobile}
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
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
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: { xs: 0, sm: 3 },
                        margin: { xs: 0, sm: 2 },
                        width: { xs: '100%', sm: 'auto' },
                        height: { xs: '100%', sm: 'auto' }
                    }
                }}
            >
                <DialogTitle sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    p: { xs: 2, sm: 3 }
                }}>
                    Edit Application
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <TextField
                        label="Cover Letter"
                        multiline
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        fullWidth
                        sx={{
                            mt: 2,
                            '& .MuiInputBase-input': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            },
                            '& .MuiFormHelperText-root': {
                                fontSize: { xs: '0.75rem', sm: '0.75rem' }
                            }
                        }}
                        helperText={`${coverLetter.length}/500 characters`}
                    />
                    <TextField
                        label="Notes"
                        multiline
                        rows={4}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        fullWidth
                        sx={{
                            mt: 2,
                            '& .MuiInputBase-input': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            },
                            '& .MuiFormHelperText-root': {
                                fontSize: { xs: '0.75rem', sm: '0.75rem' }
                            }
                        }}
                        helperText={`${editNotes.length}/500 characters`}
                    />
                </DialogContent>
                <DialogActions sx={{
                    p: { xs: 2, sm: 3 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        fullWidth={isMobile}
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateApplication}
                        variant="contained"
                        fullWidth={isMobile}
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Withdraw Confirmation Dialog */}
            <Dialog
                open={withdrawDialogOpen}
                onClose={() => setWithdrawDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: { xs: 0, sm: 3 },
                        margin: { xs: 0, sm: 2 },
                        width: { xs: '100%', sm: 'auto' },
                        height: { xs: '100%', sm: 'auto' }
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    p: { xs: 2, sm: 3 }
                }}>
                    <WarningIcon color="error" />
                    Confirm Withdrawal
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                        variant="body1"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        Are you sure you want to withdraw your application for:
                    </Typography>
                    {selectedApplication && (
                        <Box sx={{
                            p: 2,
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(244, 67, 54, 0.3)',
                            mt: 2
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: 'error.main',
                                    fontSize: { xs: '1rem', sm: '1.25rem' }
                                }}
                            >
                                {selectedApplication.job.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            >
                                {selectedApplication.company.name}
                            </Typography>
                        </Box>
                    )}
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                        >
                            This action cannot be undone. Once withdrawn, you will not be able to reapply for this position.
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions sx={{
                    p: { xs: 2, sm: 3 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Button
                        onClick={() => setWithdrawDialogOpen(false)}
                        disabled={withdrawLoading}
                        fullWidth={isMobile}
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleWithdrawApplication}
                        variant="contained"
                        color="error"
                        startIcon={withdrawLoading ? <CircularProgress size={20} /> : <WithdrawIcon />}
                        disabled={withdrawLoading}
                        fullWidth={isMobile}
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        {withdrawLoading ? 'Withdrawing...' : 'Yes, Withdraw Application'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApplicationList;