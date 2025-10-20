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
    Menu,
    ListItemIcon,
    ListItemText,
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
    Restore as RestoreIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Block as BlockIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Application, ApplicationFilters } from "@/types/Application";
import { deleteApplication, getApplicationStats, getUserApplications, restoreApplication, updateApplicationStatus } from "@/lib/api/applicationAPI";


const AdminApplicationsList: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [applications, setApplications] = useState<Application[]>([]);
    const [stats, setStats] = useState<{
        totalApplications: number;
        underReview: number;
        accepted: number;
        rejected: number;
    } | null>(null);
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, [filters]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await getUserApplications(filters);
            console.log(response);
            if (response) {
                setApplications(response.applications);
                setTotalPages(response.totalPages);
                setTotal(response.total);
            }
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

    const handleViewApplication = () => {
        setViewDialogOpen(true);
        handleMenuClose();
    };

    const handleEditApplication = () => {
        setStatusUpdate(selectedApplication?.status || "");
        setAdminNotes(selectedApplication?.notes || "");
        setEditDialogOpen(true);
        handleMenuClose();
    };

    const handleUpdateApplication = async () => {
        if (!selectedApplication) return;

        try {
            setActionLoading(true);
            await updateApplicationStatus(selectedApplication._id, {
                status: statusUpdate,
                notes: adminNotes,
            });
            setEditDialogOpen(false);
            fetchApplications();
            fetchStats();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update application");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteApplication = async () => {
        if (!selectedApplication) return;

        try {
            setActionLoading(true);
            await deleteApplication(selectedApplication._id);
            setDeleteDialogOpen(false);
            fetchApplications();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete application");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRestoreApplication = async () => {
        if (!selectedApplication) return;

        try {
            setActionLoading(true);
            await restoreApplication(selectedApplication._id);
            handleMenuClose();
            fetchApplications();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to restore application");
        } finally {
            setActionLoading(false);
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "applied":
                return <ScheduleIcon />;
            case "under-review":
                return <WorkIcon />;
            case "shortlisted":
                return <CheckCircleIcon />;
            case "interview-scheduled":
                return <CalendarIcon />;
            case "interviewed":
                return <PersonIcon />;
            case "rejected":
                return <BlockIcon />;
            case "accepted":
                return <CheckCircleIcon />;
            case "withdrawn":
                return <WithdrawIcon />;
            default:
                return <WorkIcon />;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
        <>
            <Box sx={{ position: "relative", zIndex: 2 }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 1.5, sm: 2, md: 2, lg: 3 },
                        borderRadius: { xs: 2, sm: 2, md: 3 },
                        backdropFilter: "blur(12px)",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                        boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                        mx: { xs: 0, sm: 1, md: 2 },
                        minHeight: { xs: '100vh', sm: 'auto' },
                    }}
                >
                    {/* Header */}
                    <Box sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        mb: { xs: 1, sm: 2, md: 3 },
                        gap: { xs: 1, sm: 0 },
                        p: { xs: 1, sm: 0 },
                        // Custom breakpoints
                        '@media (max-width: 480px)': {
                            mb: 0.75,
                            p: 0.75
                        },
                        '@media (max-width: 350px)': {
                            mb: 0.5,
                            p: 0.5
                        },
                        '@media (max-width: 240px)': {
                            mb: 0.25,
                            p: 0.25
                        }
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                fontSize: {
                                    xs: "1rem",
                                    sm: "1.25rem",
                                    md: "1.5rem",
                                    lg: "1.75rem"
                                },
                                lineHeight: 1.2,
                                // Custom breakpoints
                                '@media (max-width: 480px)': {
                                    fontSize: '0.9rem'
                                },
                                '@media (max-width: 350px)': {
                                    fontSize: '0.8rem'
                                },
                                '@media (max-width: 240px)': {
                                    fontSize: '0.75rem'
                                }
                            }}
                        >
                            Applications
                        </Typography>
                    </Box>
                    <Box>
                        {/* Stats Cards */}
                        {stats && (
                            <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 1.5, sm: 2, md: 3 } }}>
                                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                                    <Paper
                                        sx={{
                                            p: { xs: 1, sm: 2, md: 3 },
                                            borderRadius: { xs: 1.5, sm: 2, md: 3 },
                                            backdropFilter: "blur(12px)",
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                            textAlign: "center",
                                            minHeight: { xs: '60px', sm: 'auto' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            // Custom breakpoints
                                            '@media (max-width: 350px)': {
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                                                backdropFilter: "blur(8px)",
                                                p: 0.75
                                            },
                                            '@media (max-width: 240px)': {
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(245,250,255,0.05) 100%)",
                                                backdropFilter: "blur(6px)",
                                                p: 0.5
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="h4"
                                            color="#1565c0"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                                                // Custom breakpoints
                                                '@media (max-width: 350px)': {
                                                    fontSize: '0.9rem'
                                                },
                                                '@media (max-width: 240px)': {
                                                    fontSize: '0.8rem'
                                                }
                                            }}
                                        >
                                            {stats.totalApplications || 0}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="#2e3d4d"
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                                                // Custom breakpoints
                                                '@media (max-width: 350px)': {
                                                    fontSize: '0.65rem'
                                                },
                                                '@media (max-width: 240px)': {
                                                    fontSize: '0.6rem'
                                                }
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
                                            borderRadius: { xs: 1.5, sm: 2, md: 3 },
                                            backdropFilter: "blur(12px)",
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                            textAlign: "center",
                                            minHeight: { xs: '60px', sm: 'auto' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            // Custom breakpoints
                                            '@media (max-width: 350px)': {
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                                                backdropFilter: "blur(8px)",
                                                p: 0.75
                                            },
                                            '@media (max-width: 240px)': {
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(245,250,255,0.05) 100%)",
                                                backdropFilter: "blur(6px)",
                                                p: 0.5
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="h4"
                                            color="warning.main"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                                                // Custom breakpoints
                                                '@media (max-width: 350px)': {
                                                    fontSize: '0.9rem'
                                                },
                                                '@media (max-width: 240px)': {
                                                    fontSize: '0.8rem'
                                                }
                                            }}
                                        >
                                            {stats.underReview || 0}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="#2e3d4d"
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                                                // Custom breakpoints
                                                '@media (max-width: 350px)': {
                                                    fontSize: '0.65rem'
                                                },
                                                '@media (max-width: 240px)': {
                                                    fontSize: '0.6rem'
                                                }
                                            }}
                                        >
                                            Under Review
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                                    <Paper
                                        sx={{
                                            p: { xs: 1, sm: 2, md: 3 },
                                            borderRadius: { xs: 1.5, sm: 2, md: 3 },
                                            backdropFilter: "blur(12px)",
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                            textAlign: "center",
                                            minHeight: { xs: '60px', sm: 'auto' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            // Custom breakpoints
                                            '@media (max-width: 350px)': {
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                                                backdropFilter: "blur(8px)",
                                                p: 0.75
                                            },
                                            '@media (max-width: 240px)': {
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(245,250,255,0.05) 100%)",
                                                backdropFilter: "blur(6px)",
                                                p: 0.5
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="h4"
                                            color="success.main"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                                                // Custom breakpoints
                                                '@media (max-width: 350px)': {
                                                    fontSize: '0.9rem'
                                                },
                                                '@media (max-width: 240px)': {
                                                    fontSize: '0.8rem'
                                                }
                                            }}
                                        >
                                            {stats.accepted || 0}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="#2e3d4d"
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                                                // Custom breakpoints
                                                '@media (max-width: 350px)': {
                                                    fontSize: '0.65rem'
                                                },
                                                '@media (max-width: 240px)': {
                                                    fontSize: '0.6rem'
                                                }
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
                                            borderRadius: { xs: 1.5, sm: 2, md: 3 },
                                            backdropFilter: "blur(12px)",
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                            textAlign: "center",
                                            minHeight: { xs: '60px', sm: 'auto' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            // Custom breakpoints
                                            '@media (max-width: 350px)': {
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                                                backdropFilter: "blur(8px)",
                                                p: 0.75
                                            },
                                            '@media (max-width: 240px)': {
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(245,250,255,0.05) 100%)",
                                                backdropFilter: "blur(6px)",
                                                p: 0.5
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="h4"
                                            color="error.main"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                                                // Custom breakpoints
                                                '@media (max-width: 350px)': {
                                                    fontSize: '0.9rem'
                                                },
                                                '@media (max-width: 240px)': {
                                                    fontSize: '0.8rem'
                                                }
                                            }}
                                        >
                                            {stats.rejected || 0}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="#2e3d4d"
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                                                // Custom breakpoints
                                                '@media (max-width: 350px)': {
                                                    fontSize: '0.65rem'
                                                },
                                                '@media (max-width: 240px)': {
                                                    fontSize: '0.6rem'
                                                }
                                            }}
                                        >
                                            Rejected
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}


                        {/* Applications Table - Desktop */}
                        <Paper
                            sx={{
                                borderRadius: { xs: 1.5, sm: 2, md: 3 },
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                                boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                                display: { xs: 'none', md: 'block' },
                                // Custom breakpoints
                                '@media (max-width: 350px)': {
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                                    backdropFilter: "blur(8px)"
                                },
                                '@media (max-width: 240px)': {
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(245,250,255,0.05) 100%)",
                                    backdropFilter: "blur(6px)"
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
                                            }}>Applicant</TableCell>
                                            <TableCell sx={{
                                                fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                                                fontWeight: 600,
                                                p: { xs: 0.5, sm: 1, md: 1.5 }
                                            }}>Job</TableCell>
                                            <TableCell sx={{
                                                fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                                                fontWeight: 600,
                                                p: { xs: 0.5, sm: 1, md: 1.5 }
                                            }}>Company</TableCell>
                                            <TableCell sx={{
                                                fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                                                fontWeight: 600,
                                                p: { xs: 0.5, sm: 1, md: 1.5 }
                                            }}>Status</TableCell>
                                            <TableCell sx={{
                                                fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                                                fontWeight: 600,
                                                p: { xs: 0.5, sm: 1, md: 1.5 }
                                            }}>Applied Date</TableCell>
                                            <TableCell sx={{
                                                fontSize: { xs: "0.75rem", sm: "1rem", md: "1.2rem" },
                                                fontWeight: 600,
                                                p: { xs: 0.5, sm: 1, md: 1.5 }
                                            }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {applications.map((application) => (
                                            <TableRow key={application._id} hover>
                                                <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                                                        <Avatar
                                                            src={application.user.profilePicture ?
                                                                `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${application.user.profilePicture}` :
                                                                undefined
                                                            }
                                                            sx={{
                                                                width: { xs: 24, sm: 32, md: 40 },
                                                                height: { xs: 24, sm: 32, md: 40 },
                                                                fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                                                            }}
                                                        >
                                                            {application.user.firstName}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                                                                }}
                                                            >
                                                                {application.user.firstName} {application.user.lastName}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="#2e3d4d"
                                                                sx={{
                                                                    fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' }
                                                                }}
                                                            >
                                                                {application.user.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                                                    <Box>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                                                            }}
                                                        >
                                                            {application.job.title}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="#2e3d4d"
                                                            sx={{
                                                                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' }
                                                            }}
                                                        >
                                                            {application.job.jobType} • {application.job.experienceLevel}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                                                        {application.company.logo && (
                                                            <Avatar
                                                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${application.company.logo}`}
                                                                sx={{
                                                                    width: { xs: 16, sm: 20, md: 24 },
                                                                    height: { xs: 16, sm: 20, md: 24 }
                                                                }}
                                                            />
                                                        )}
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                                                            }}
                                                        >
                                                            {application.company.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                                                    <Chip
                                                        icon={getStatusIcon(application.status)}
                                                        label={application.status.replace("-", " ").toUpperCase()}
                                                        color={getStatusColor(application.status)}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                                                            height: { xs: 20, sm: 24, md: 28 }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }
                                                        }}
                                                    >
                                                        {formatDate(application.applicationDate)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ p: { xs: 0.5, sm: 1, md: 1.5 } }}>
                                                    <Box sx={{ display: 'flex', gap: { xs: 0.25, sm: 0.5, md: 1 } }}>
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedApplication(application);
                                                                    setViewDialogOpen(true);
                                                                }}
                                                                sx={{
                                                                    width: { xs: 24, sm: 28, md: 32 },
                                                                    height: { xs: 24, sm: 28, md: 32 }
                                                                }}
                                                            >
                                                                <ViewIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Update Status">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedApplication(application);
                                                                    setStatusUpdate(application.status);
                                                                    setAdminNotes(application.notes || "");
                                                                    setEditDialogOpen(true);
                                                                }}
                                                                sx={{
                                                                    width: { xs: 24, sm: 28, md: 32 },
                                                                    height: { xs: 24, sm: 28, md: 32 }
                                                                }}
                                                            >
                                                                <EditIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="View Resume">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewResume(application)}
                                                                sx={{
                                                                    width: { xs: 24, sm: 28, md: 32 },
                                                                    height: { xs: 24, sm: 28, md: 32 }
                                                                }}
                                                            >
                                                                <DownloadIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                        {/* Applications Cards - Mobile */}
                        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                            {applications.map((application) => (
                                <Card
                                    key={application._id}
                                    sx={{
                                        mb: { xs: 1, sm: 1.5, md: 2 },
                                        borderRadius: { xs: 1.5, sm: 2, md: 3 },
                                        backdropFilter: "blur(12px)",
                                        background:
                                            "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                                        boxShadow: "0 4px 15px rgba(20,30,60,0.08)",
                                        // Custom breakpoints
                                        '@media (max-width: 350px)': {
                                            background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(245,250,255,0.08) 100%)",
                                            backdropFilter: "blur(8px)"
                                        },
                                        '@media (max-width: 240px)': {
                                            background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(245,250,255,0.05) 100%)",
                                            backdropFilter: "blur(6px)"
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
                                        {/* Applicant */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
                                            <Avatar
                                                src={application.user.profilePicture ?
                                                    `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${application.user.profilePicture}` :
                                                    undefined
                                                }
                                                sx={{
                                                    width: { xs: 32, sm: 40, md: 48 },
                                                    height: { xs: 32, sm: 40, md: 48 },
                                                    fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' }
                                                }}
                                            >
                                                {application.user.firstName[0]}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {application.user.firstName} {application.user.lastName}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {application.user.email}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                icon={getStatusIcon(application.status)}
                                                label={application.status.replace("-", " ").toUpperCase()}
                                                color={getStatusColor(application.status)}
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
                                        <Box sx={{ mb: { xs: 1, sm: 1.5, md: 2 } }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 0.5,
                                                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                                                }}
                                            >
                                                Position
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    mb: 0.5,
                                                    fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' },
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {application.job.title}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' }
                                                }}
                                            >
                                                {application.job.jobType} • {application.job.experienceLevel}
                                            </Typography>
                                        </Box>

                                        {/* Company */}
                                        <Box sx={{ mb: { xs: 1, sm: 1.5, md: 2 } }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 0.5,
                                                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                                                }}
                                            >
                                                Company
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                                                {application.company.logo && (
                                                    <Avatar
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${application.company.logo}`}
                                                        sx={{
                                                            width: { xs: 16, sm: 20, md: 24 },
                                                            height: { xs: 16, sm: 20, md: 24 }
                                                        }}
                                                    />
                                                )}
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 500,
                                                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' },
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {application.company.name}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Date */}
                                        <Box sx={{ mb: { xs: 1, sm: 1.5, md: 2 } }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 0.5,
                                                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                                                }}
                                            >
                                                Applied Date
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' }
                                                }}
                                            >
                                                {formatDate(application.applicationDate)}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{
                                        justifyContent: 'flex-end',
                                        px: { xs: 1, sm: 1.5, md: 2 },
                                        pb: { xs: 1, sm: 1.5, md: 2 },
                                        gap: { xs: 0.5, sm: 1 }
                                    }}>
                                        <Button
                                            size="small"
                                            startIcon={<ViewIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                                            onClick={() => {
                                                setSelectedApplication(application);
                                                setViewDialogOpen(true);
                                            }}
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                                                minWidth: { xs: 'auto', sm: 'auto' },
                                                px: { xs: 1, sm: 1.5 }
                                            }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                                            onClick={() => {
                                                setSelectedApplication(application);
                                                setStatusUpdate(application.status);
                                                setAdminNotes(application.notes || "");
                                                setEditDialogOpen(true);
                                            }}
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                                                minWidth: { xs: 'auto', sm: 'auto' },
                                                px: { xs: 1, sm: 1.5 }
                                            }}
                                        >
                                            Update
                                        </Button>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewResume(application)}
                                            sx={{
                                                width: { xs: 28, sm: 32 },
                                                height: { xs: 28, sm: 32 }
                                            }}
                                        >
                                            <DownloadIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            ))}
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

                        {/* View Application Dialog */}
                        <Dialog
                            open={viewDialogOpen}
                            onClose={() => setViewDialogOpen(false)}
                            maxWidth="md"
                            fullWidth
                            fullScreen={isMobile}
                            PaperProps={{
                                sx: {
                                    borderRadius: { xs: 0, sm: 2, md: 3 },
                                    margin: { xs: 0, sm: 2 },
                                    width: { xs: '100%', sm: 'auto' },
                                    height: { xs: '100%', sm: 'auto' },
                                    maxHeight: { xs: '100vh', sm: '90vh' }
                                }
                            }}
                        >
                            <DialogTitle sx={{
                                p: { xs: 1.5, sm: 2, md: 3 },
                                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                            }}>
                                Application Details
                            </DialogTitle>
                            <DialogContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                                {selectedApplication && (
                                    <Box>
                                        <Grid container spacing={{ xs: 2, sm: 3 }}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography
                                                    variant="h6"
                                                    gutterBottom
                                                    sx={{
                                                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                                                    }}
                                                >
                                                    Applicant Information
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
                                                    <Avatar
                                                        src={selectedApplication.user.profilePicture ?
                                                            `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${selectedApplication.user.profilePicture}` :
                                                            undefined
                                                        }
                                                        sx={{
                                                            width: { xs: 40, sm: 50, md: 60 },
                                                            height: { xs: 40, sm: 50, md: 60 }
                                                        }}
                                                    >
                                                        {selectedApplication.user.firstName}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                                                            }}
                                                        >
                                                            {selectedApplication.user.firstName} {selectedApplication.user.lastName}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                                            }}
                                                        >
                                                            {selectedApplication.user.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography
                                                    variant="h6"
                                                    gutterBottom
                                                    sx={{
                                                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                                                    }}
                                                >
                                                    Job Information
                                                </Typography>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                                                    }}
                                                >
                                                    {selectedApplication.job.title}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                                    }}
                                                >
                                                    {selectedApplication.company.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                                    }}
                                                >
                                                    {selectedApplication.job.jobType} • {selectedApplication.job.experienceLevel}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{
                                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                                            }}
                                        >
                                            Cover Letter
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            paragraph
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                            }}
                                        >
                                            {selectedApplication.coverLetter || "No cover letter provided"}
                                        </Typography>

                                        {selectedApplication.notes && (
                                            <>
                                                <Typography
                                                    variant="h6"
                                                    gutterBottom
                                                    sx={{
                                                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                                                    }}
                                                >
                                                    Admin Notes
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    paragraph
                                                    sx={{
                                                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                                    }}
                                                >
                                                    {selectedApplication.notes}
                                                </Typography>
                                            </>
                                        )}

                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{
                                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                                            }}
                                        >
                                            Application Status
                                        </Typography>
                                        <Chip
                                            icon={getStatusIcon(selectedApplication.status)}
                                            label={selectedApplication.status.replace("-", " ").toUpperCase()}
                                            color={getStatusColor(selectedApplication.status)}
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                            }}
                                        />
                                    </Box>
                                )}
                            </DialogContent>
                            <DialogActions sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                                <Button
                                    onClick={() => setViewDialogOpen(false)}
                                    sx={{
                                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
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
                                    borderRadius: { xs: 0, sm: 2, md: 3 },
                                    margin: { xs: 0, sm: 2 },
                                    width: { xs: '100%', sm: 'auto' },
                                    height: { xs: '100%', sm: 'auto' },
                                    maxHeight: { xs: '100vh', sm: '90vh' }
                                }
                            }}
                        >
                            <DialogTitle sx={{
                                p: { xs: 1.5, sm: 2, md: 3 },
                                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                            }}>
                                Update Application Status
                            </DialogTitle>
                            <DialogContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                                <FormControl fullWidth sx={{ mt: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
                                    <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Status</InputLabel>
                                    <Select
                                        value={statusUpdate}
                                        onChange={(e) => setStatusUpdate(e.target.value)}
                                        label="Status"
                                        sx={{
                                            fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                                        }}
                                    >
                                        <MenuItem value="applied" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Applied</MenuItem>
                                        <MenuItem value="under-review" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Under Review</MenuItem>
                                        <MenuItem value="shortlisted" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Shortlisted</MenuItem>
                                        <MenuItem value="interview-scheduled" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Interview Scheduled</MenuItem>
                                        <MenuItem value="interviewed" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Interviewed</MenuItem>
                                        <MenuItem value="rejected" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Rejected</MenuItem>
                                        <MenuItem value="accepted" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } }}>Accepted</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Admin Notes"
                                    multiline
                                    rows={4}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    fullWidth
                                    helperText="Add internal notes about this application"
                                    sx={{
                                        '& .MuiInputLabel-root': {
                                            fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                                        },
                                        '& .MuiFormHelperText-root': {
                                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                                        }
                                    }}
                                />
                            </DialogContent>
                            <DialogActions sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                                <Button
                                    onClick={() => setEditDialogOpen(false)}
                                    sx={{
                                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateApplication}
                                    variant="contained"
                                    disabled={actionLoading}
                                    startIcon={actionLoading ? <CircularProgress size={20} /> : null}
                                    sx={{
                                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                    }}
                                >
                                    {actionLoading ? 'Updating...' : 'Update Status'}
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Delete Confirmation Dialog */}
                        <Dialog
                            open={deleteDialogOpen}
                            onClose={() => setDeleteDialogOpen(false)}
                            maxWidth="sm"
                            fullWidth
                            fullScreen={isMobile}
                        >
                            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarningIcon color="error" />
                                Confirm Deletion
                            </DialogTitle>
                            <DialogContent>
                                <Typography variant="body1" gutterBottom>
                                    Are you sure you want to permanently delete this application?
                                </Typography>
                                {selectedApplication && (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(244, 67, 54, 0.3)',
                                        mt: 2
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                                            {selectedApplication.job.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedApplication.user.firstName} {selectedApplication.user.lastName}
                                        </Typography>
                                    </Box>
                                )}
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        This action cannot be undone. The application will be permanently deleted.
                                    </Typography>
                                </Alert>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={() => setDeleteDialogOpen(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteApplication}
                                    variant="contained"
                                    color="error"
                                    startIcon={actionLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Deleting...' : 'Yes, Delete Application'}
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
                                <ListItemIcon>
                                    <ViewIcon />
                                </ListItemIcon>
                                <ListItemText>View Details</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleEditApplication}>
                                <ListItemIcon>
                                    <EditIcon />
                                </ListItemIcon>
                                <ListItemText>Update Status</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => {
                                if (selectedApplication) {
                                    handleViewResume(selectedApplication);
                                }
                                handleMenuClose();
                            }}>
                                <ListItemIcon>
                                    <DownloadIcon />
                                </ListItemIcon>
                                <ListItemText>View Resume</ListItemText>
                            </MenuItem>
                            {selectedApplication?.is_deleted && (
                                <MenuItem onClick={handleRestoreApplication}>
                                    <ListItemIcon>
                                        <RestoreIcon />
                                    </ListItemIcon>
                                    <ListItemText>Restore Application</ListItemText>
                                </MenuItem>
                            )}
                            <MenuItem
                                onClick={() => {
                                    setDeleteDialogOpen(true);
                                    handleMenuClose();
                                }}
                                sx={{ color: "error.main" }}
                            >
                                <ListItemIcon>
                                    <DeleteIcon color="error" />
                                </ListItemIcon>
                                <ListItemText>Delete Application</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default AdminApplicationsList;