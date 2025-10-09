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

interface Props {
    onRefresh?: () => void;
}

const AdminApplicationsList: React.FC<Props> = ({ onRefresh }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [applications, setApplications] = useState<Application[]>([]);
    const [stats, setStats] = useState<any>(null);
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
            onRefresh?.();
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
            onRefresh?.();
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
            onRefresh?.();
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
                                lineHeight: 1.2,
                            }}
                        >
                            Applications
                        </Typography>
                    </Box>
                    <Box>
                        {/* Stats Cards */}
                        {stats && (
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            backdropFilter: "blur(12px)",
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                            textAlign: "center"
                                        }}
                                    >
                                        <Typography variant="h4" color="#1565c0" sx={{ fontWeight: 600 }}>
                                            {stats.totalApplications || 0}
                                        </Typography>
                                        <Typography variant="body2" color="#2e3d4d">
                                            Total Applications
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            backdropFilter: "blur(12px)",
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                            textAlign: "center"
                                        }}
                                    >
                                        <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                                            {stats.underReview || 0}
                                        </Typography>
                                        <Typography variant="body2" color="#2e3d4d">
                                            Under Review
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            backdropFilter: "blur(12px)",
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                            textAlign: "center"
                                        }}
                                    >
                                        <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                                            {stats.accepted || 0}
                                        </Typography>
                                        <Typography variant="body2" color="#2e3d4d">
                                            Accepted
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            backdropFilter: "blur(12px)",
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                            textAlign: "center"
                                        }}
                                    >
                                        <Typography variant="h4" color="error.main" sx={{ fontWeight: 600 }}>
                                            {stats.rejected || 0}
                                        </Typography>
                                        <Typography variant="body2" color="#2e3d4d">
                                            Rejected
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
                                {/* ... existing filter controls ... */}
                            </Grid>
                        </Paper>


                        {/* Applications Table - Desktop */}
                        <Paper
                            sx={{
                                borderRadius: 3,
                                backdropFilter: "blur(12px)",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                                boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                                display: { xs: 'none', md: 'block' }
                            }}
                        >
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600, }}>Applicant</TableCell>
                                            <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600, }}>Job</TableCell>
                                            <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600, }}>Company</TableCell>
                                            <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600, }}>Status</TableCell>
                                            <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600, }}>Applied Date</TableCell>
                                            <TableCell sx={{ fontSize: "1.2rem", fontWeight: 600, }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {applications.map((application) => (
                                            <TableRow key={application._id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            src={application.user.profilePicture ?
                                                                `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${application.user.profilePicture}` :
                                                                undefined
                                                            }
                                                            sx={{ width: 40, height: 40 }}
                                                        >
                                                            {application.user.firstName}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                {application.user.firstName} {application.user.lastName}
                                                            </Typography>
                                                            <Typography variant="caption" color="#2e3d4d">
                                                                {application.user.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            {application.job.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="#2e3d4d">
                                                            {application.job.jobType} • {application.job.experienceLevel}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {application.company.logo && (
                                                            <Avatar
                                                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${application.company.logo}`}
                                                                sx={{ width: 24, height: 24 }}
                                                            />
                                                        )}
                                                        <Typography variant="body2">
                                                            {application.company.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getStatusIcon(application.status)}
                                                        label={application.status.replace("-", " ").toUpperCase()}
                                                        color={getStatusColor(application.status)}
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(application.applicationDate)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedApplication(application);
                                                                    setViewDialogOpen(true);
                                                                }}
                                                            >
                                                                <ViewIcon />
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
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="View Resume">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewResume(application)}
                                                            >
                                                                <DownloadIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {/* <Tooltip title="More Actions">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuClick(e, application)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Tooltip> */}
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
                                        mb: 2,
                                        borderRadius: 3,
                                        backdropFilter: "blur(12px)",
                                        background:
                                            "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                                        boxShadow: "0 4px 15px rgba(20,30,60,0.08)",
                                    }}
                                >
                                    <CardContent>
                                        {/* Applicant */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Avatar
                                                src={application.user.profilePicture ?
                                                    `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${application.user.profilePicture}` :
                                                    undefined
                                                }
                                                sx={{ width: 48, height: 48 }}
                                            >
                                                {application.user.firstName[0]}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    {application.user.firstName} {application.user.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {application.user.email}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                icon={getStatusIcon(application.status)}
                                                label={application.status.replace("-", " ").toUpperCase()}
                                                color={getStatusColor(application.status)}
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
                                                {application.job.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {application.job.jobType} • {application.job.experienceLevel}
                                            </Typography>
                                        </Box>

                                        {/* Company */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Company
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {application.company.logo && (
                                                    <Avatar
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${application.company.logo}`}
                                                        sx={{ width: 24, height: 24 }}
                                                    />
                                                )}
                                                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                                    {application.company.name}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Date */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Applied Date
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                {formatDate(application.applicationDate)}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                        <Button
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() => {
                                                setSelectedApplication(application);
                                                setViewDialogOpen(true);
                                            }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => {
                                                setSelectedApplication(application);
                                                setStatusUpdate(application.status);
                                                setAdminNotes(application.notes || "");
                                                setEditDialogOpen(true);
                                            }}
                                        >
                                            Update
                                        </Button>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewResume(application)}
                                        >
                                            <DownloadIcon />
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
                        >
                            <DialogTitle>
                                Application Details
                            </DialogTitle>
                            <DialogContent>
                                {selectedApplication && (
                                    <Box>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    Applicant Information
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Avatar
                                                        src={selectedApplication.user.profilePicture ?
                                                            `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${selectedApplication.user.profilePicture}` :
                                                            undefined
                                                        }
                                                        sx={{ width: 60, height: 60 }}
                                                    >
                                                        {selectedApplication.user.firstName}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6">
                                                            {selectedApplication.user.firstName} {selectedApplication.user.lastName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {selectedApplication.user.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    Job Information
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    {selectedApplication.job.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedApplication.company.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedApplication.job.jobType} • {selectedApplication.job.experienceLevel}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" gutterBottom>
                                            Cover Letter
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            {selectedApplication.coverLetter || "No cover letter provided"}
                                        </Typography>

                                        {selectedApplication.notes && (
                                            <>
                                                <Typography variant="h6" gutterBottom>
                                                    Admin Notes
                                                </Typography>
                                                <Typography variant="body2" paragraph>
                                                    {selectedApplication.notes}
                                                </Typography>
                                            </>
                                        )}

                                        <Typography variant="h6" gutterBottom>
                                            Application Status
                                        </Typography>
                                        <Chip
                                            icon={getStatusIcon(selectedApplication.status)}
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
                            fullScreen={isMobile}
                        >
                            <DialogTitle>
                                Update Application Status
                            </DialogTitle>
                            <DialogContent>
                                <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusUpdate}
                                        onChange={(e) => setStatusUpdate(e.target.value)}
                                        label="Status"
                                    >
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

                                <TextField
                                    label="Admin Notes"
                                    multiline
                                    rows={4}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    fullWidth
                                    helperText="Add internal notes about this application"
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateApplication}
                                    variant="contained"
                                    disabled={actionLoading}
                                    startIcon={actionLoading ? <CircularProgress size={20} /> : null}
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