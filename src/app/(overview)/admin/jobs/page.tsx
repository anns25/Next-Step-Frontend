"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    Chip,
    CircularProgress,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    CardActions,
    Alert,
    Snackbar,
    Stack,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {
    Work as WorkIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    People as PeopleIcon,
    Schedule as ScheduleIcon,
} from "@mui/icons-material";

import { Job, JobListResponse, JobFilters } from "@/types/Job";
import AdminLayout from "@/components/AdminSidebarLayout";
import {
    getAllJobsByAdmin,
    deleteJob,
    updateJob,
} from "@/lib/api/adminAPI";

import JobFormDialog from "@/components/JobFormDialog";
import JobViewDialog from "@/components/JobViewDialog";

export default function AdminJobs() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("");
    const [experienceFilter, setExperienceFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(12);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

    // Dialog states
    const [jobFormOpen, setJobFormOpen] = useState(false);
    const [jobViewOpen, setJobViewOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    // Snackbar states
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    const jobTypes = [
        "full-time",
        "part-time",
        "contract",
        "internship",
        "temporary"
    ];

    const experienceLevels = [
        "entry",
        "mid",
        "senior",
        "executive"
    ];

    const getJobTypeColor = (jobType: string): "success" | "warning" | "error" | "default" | "info" => {
        switch (jobType) {
            case "full-time":
                return "success";
            case "part-time":
                return "info";
            case "contract":
                return "warning";
            case "internship":
                return "default";
            case "temporary":
                return "error";
            default:
                return "default";
        }
    };

    const getExperienceColor = (level: string): "success" | "warning" | "error" | "default" | "info" => {
        switch (level) {
            case "entry":
                return "success";
            case "mid":
                return "info";
            case "senior":
                return "warning";
            case "executive":
                return "error";
            default:
                return "default";
        }
    };

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
                isActive: statusFilter ? statusFilter === "active" : undefined,
            };

            console.log('Fetching jobs with params:', params);
            const response = await getAllJobsByAdmin(params);

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
    }, [currentPage, searchTerm, companyFilter, jobTypeFilter, experienceFilter, statusFilter]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleJobTypeFilter = (value: string) => {
        setJobTypeFilter(value);
        setCurrentPage(1);
    };

    const handleExperienceFilter = (value: string) => {
        setExperienceFilter(value);
        setCurrentPage(1);
    };


    const handleViewJob = (job: Job) => {
        setSelectedJob(job);
        setJobViewOpen(true);
    };

    const handleEditJob = (job: Job) => {
        setEditingJob(job);
        setJobFormOpen(true);
    };

    const handleDeleteJob = (job: Job) => {
        setJobToDelete(job);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!jobToDelete) return;
        setDeleteLoading(true);
        try {
            const success = await deleteJob(jobToDelete._id);
            if (success) {
                setSnackbar({
                    open: true,
                    message: "Job deleted successfully",
                    severity: "success",
                });
                fetchJobs();
            } else {
                setSnackbar({
                    open: true,
                    message: "Failed to delete job",
                    severity: "error",
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to delete job",
                severity: "error",
            });
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setJobToDelete(null);
        }
    };

    const handleJobFormClose = () => {
        setJobFormOpen(false);
        setEditingJob(null);
        fetchJobs();
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleJobSave = async (formData: any) => {
        try {
            if (editingJob) {
                // Update existing job
                await updateJob(editingJob._id, formData);
                setSnackbar({
                    open: true,
                    message: "Job updated successfully",
                    severity: "success",
                });
            }

            // Refresh the jobs list
            fetchJobs();

        } catch (error: any) {
            console.error('Error saving job:', error);
            setSnackbar({
                open: true,
                message: error.message || "Failed to save job",
                severity: "error",
            });
            throw error; // Re-throw to prevent dialog from closing on error
        }
    };

    const formatSalary = (salary: Job["salary"]) => {
        if (!salary) return "Not specified";
        const { min, max, currency, period } = salary;
        if (min && max) {
            return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`;
        } else if (min) {
            return `${currency} ${min.toLocaleString()}+ / ${period}`;
        }
        return "Not specified";
    };

    const formatLocation = (location: Job["location"]) => {
        if (location.type === "remote") return "Remote";
        const parts = [location.city, location.state, location.country].filter(Boolean);
        return parts.join(", ");
    };

    const formatDate = (date?: string | Date | null) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    const getCompanyLogo = (company: string | { _id: string; name: string; logo?: string } | undefined): string | null => {
        if (!company || typeof company === "string") return null;
        return company.logo || null;
    };

    const getCompanyName = (company: string | { _id: string; name: string; logo?: string } | undefined): string | null => {
        if (!company || typeof company === "string") return null;
        return company.name || null;
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
                                lineHeight: 1.2,
                            }}
                        >
                            Job Management
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
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                    <InputLabel>Job Type</InputLabel>
                                    <Select
                                        value={jobTypeFilter}
                                        onChange={(e) => handleJobTypeFilter(e.target.value)}
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
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                    <InputLabel>Experience</InputLabel>
                                    <Select
                                        value={experienceFilter}
                                        onChange={(e) => handleExperienceFilter(e.target.value)}
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

                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon fontSize={isMobile ? "small" : "medium"} />}
                                    onClick={fetchJobs}
                                    fullWidth
                                    size={isMobile ? "small" : "medium"}
                                >
                                    {isMobile ? "Refresh" : "Refresh"}
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
                                        border: `1px solid ${job.isActive ? '#4caf50' : '#f44336'}40`,
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 } }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: { xs: "column", sm: "row" },
                                                alignItems: { xs: "flex-start", sm: "center" },
                                                gap: { xs: 1, sm: 0 },
                                                minWidth: 0,
                                            }}
                                        >
                                            {/* Job Title + Company */}
                                            <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, width: "100%", mb: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                                                    <Avatar
                                                        sx={{
                                                            display: { xs: "none", sm: "none", md: "flex" }, // hidden on xs+sm
                                                            width: { sm: 48 },
                                                            height: { sm: 48 },
                                                            mr: 2,
                                                            bgcolor: "primary.main",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {getCompanyLogo(job.company) ? (
                                                            <Box
                                                                component="img"
                                                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${getCompanyLogo(job.company)}`}
                                                                alt={`${getCompanyName(job.company)}`}
                                                                sx={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover",
                                                                    borderRadius: "50%",
                                                                }}
                                                            />
                                                        ) : (
                                                            <BusinessIcon
                                                                sx={{
                                                                    fontSize: { sm: 30, md: 40 },
                                                                    color: "white",
                                                                }}
                                                            />
                                                        )}
                                                    </Avatar>

                                                    <Box sx={{ flex: 1, minWidth: 0, maxWidth : {xs : "180px", sm : "100%"}, ml: 1 }}>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 600,
                                                                mb: 0.5,
                                                                fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                lineHeight: 1.2,
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
                                                            title={typeof job.company === 'string' ? job.company : job.company.name}
                                                        >
                                                            {typeof job.company === 'string' ? job.company : job.company.name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            {/* Status Chip */}
                                            <Chip
                                                label={job.isActive ? "Active" : "Inactive"}
                                                color={job.isActive ? "success" : "error"}
                                                size="small"
                                                sx={{
                                                    flexShrink: 0,
                                                    ml: { xs: 0, sm: 1 },
                                                    mb: { xs: 1, sm: 0 },
                                                    fontSize: { xs: "0.625rem", sm: "0.75rem" },
                                                    height: { xs: 20, sm: 24 }
                                                }}
                                            />
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

                                        {/* Stats */}
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: { xs: 1.5, sm: 2 },
                                            gap: 1
                                        }}>
                                            <Box sx={{ textAlign: "center", flex: 1 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" } }}>
                                                    Applications
                                                </Typography>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 600,
                                                    fontSize: { xs: "0.875rem", sm: "1rem" }
                                                }}>
                                                    {job.applicationCount || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: "center", flex: 1 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" } }}>
                                                    Views
                                                </Typography>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 600,
                                                    fontSize: { xs: "0.875rem", sm: "1rem" }
                                                }}>
                                                    {job.viewCount || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{
                                        p: { xs: 1, sm: 1.5, md: 2 },
                                        pt: 0,
                                        justifyContent: "center"
                                    }}>
                                        <Box sx={{
                                            display: "flex",
                                            gap: { xs: 0.5, sm: 1 },
                                            width: "100%",
                                            justifyContent: "center"
                                        }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    onClick={() => handleViewJob(job)}
                                                    color="primary"
                                                    size={isMobile ? "small" : "medium"}
                                                >
                                                    <ViewIcon fontSize={isMobile ? "small" : "medium"} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Job">
                                                <IconButton
                                                    onClick={() => handleEditJob(job)}
                                                    color="primary"
                                                    size={isMobile ? "small" : "medium"}
                                                >
                                                    <EditIcon fontSize={isMobile ? "small" : "medium"} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Job">
                                                <IconButton
                                                    onClick={() => handleDeleteJob(job)}
                                                    color="error"
                                                    size={isMobile ? "small" : "medium"}
                                                >
                                                    <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
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
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                                    }
                                }}
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
                            <WorkIcon sx={{
                                fontSize: { xs: 40, sm: 48, md: 64 },
                                mb: 2,
                                opacity: 0.5
                            }} />
                            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                                No jobs found
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                                {searchTerm || jobTypeFilter || experienceFilter || statusFilter
                                    ? "Try adjusting your search criteria"
                                    : "Get started by adding your first job"}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Dialogs */}
            <JobFormDialog
                open={jobFormOpen}
                onSave={handleJobSave}
                onClose={handleJobFormClose}
                initialData={editingJob}
            />

            <JobViewDialog
                open={jobViewOpen}
                onClose={() => setJobViewOpen(false)}
                job={selectedJob}
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

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-dialog-title"
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        margin: { xs: 2, sm: 3 },
                        width: { xs: 'calc(100% - 32px)', sm: 'auto' }
                    }
                }}
            >
                <DialogTitle id="delete-dialog-title" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    Delete Job
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone!
                    </Alert>
                    <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                        Are you sure you want to delete the job{" "}
                        <strong>{jobToDelete?.title}</strong>?
                    </Typography>
                    <Typography color="error" fontWeight="bold" sx={{
                        mt: 2,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" }
                    }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 0 },
                    p: { xs: 2, sm: 3 }
                }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteLoading}
                        fullWidth={isMobile}
                        size={isMobile ? "small" : "medium"}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleteLoading}
                        startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                        fullWidth={isMobile}
                        size={isMobile ? "small" : "medium"}
                    >
                        {deleteLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}