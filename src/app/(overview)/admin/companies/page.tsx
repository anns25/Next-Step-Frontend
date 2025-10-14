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
} from "@mui/material";
import {
    Business as BusinessIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    Add as AddIcon,
    Work as WorkIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
} from "@mui/icons-material";

import { Company, CompanyListResponse, CompanyStatus } from "@/types/Company";
import AdminLayout from "@/components/AdminSidebarLayout";
import {
    getAllCompaniesByAdmin,
    deleteCompany,
    deleteJob,
    createCompany,
    updateCompany,
    createJob,
} from "@/lib/api/adminAPI";

import CompanyViewDialog from "@/components/CompanyViewDialog";
import CompanyFormDialog from "@/components/CompanyFormDialog";
import JobFormDialog from "@/components/JobFormDialog";
import { Job, JobFormData } from "@/types/Job";
import { useAuth } from "@/contexts/authContext";
import { getJobsByCompany } from "@/lib/api/jobAPI";
import { AxiosError } from "axios";

export default function AdminCompanies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(12);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

    // Dialog states
    const [companyFormOpen, setCompanyFormOpen] = useState(false);
    const [companyViewOpen, setCompanyViewOpen] = useState(false);
    const [jobFormOpen, setJobFormOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [companyJobs, setCompanyJobs] = useState<Job[]>([]);

    const { user } = useAuth();

    // Snackbar states
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    const industries = [
        "Technology",
        "Healthcare",
        "Finance",
        "Education",
        "Manufacturing",
        "Retail",
        "Consulting",
        "Media",
        "Real Estate",
        "Other",
    ];

    const getStatusColor = (status: CompanyStatus): "success" | "warning" | "error" | "default" => {
        switch (status) {
            case "active":
                return "success";
            case "inactive":
                return "error";
            case "suspended":
                return "warning";
            default:
                return "default";
        }
    };

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                search: searchTerm || undefined,
                industry: industryFilter || undefined,
                status: statusFilter || undefined,
            };

            console.log('Fetching companies with params:', params);
            const response = await getAllCompaniesByAdmin(params);


            if (response) {
                setCompanies(response.companies);
                setTotalPages(response.totalPages);
                setTotal(response.total);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
            setSnackbar({
                open: true,
                message: "Failed to fetch companies",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [currentPage, searchTerm, industryFilter, statusFilter]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleIndustryFilter = (value: string) => {
        setIndustryFilter(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleViewCompany = async (company: Company) => {
        setSelectedCompany(company);
        setCompanyViewOpen(true);

        // Fetch company jobs
        try {
            const jobsResponse = await getJobsByCompany(company._id, { page: 1, limit: 10 });
            if (jobsResponse) {
                setCompanyJobs(jobsResponse.data || []);
            }
        } catch (error) {
            console.error("Error fetching company jobs:", error);
        }
    };

    const handleEditCompany = (company: Company) => {
        setEditingCompany(company);
        setCompanyFormOpen(true);
    };

    const handleDeleteCompany = (company: Company) => {
        setCompanyToDelete(company);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!companyToDelete) return;
        setDeleteLoading(true);
        try {
            const success = await deleteCompany(companyToDelete._id);
            if (success) {
                setSnackbar({
                    open: true,
                    message: "Company deleted successfully",
                    severity: "success",
                });
                fetchCompanies();
            } else {
                setSnackbar({
                    open: true,
                    message: "Failed to delete company",
                    severity: "error",
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to delete company",
                severity: "error",
            });
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setCompanyToDelete(null);
        }
    };

    const handleAddJob = (company: Company) => {
        setSelectedCompany(company);
        setJobFormOpen(true);
    };

    const handleCompanyFormClose = () => {
        setCompanyFormOpen(false);
        setEditingCompany(null);
        fetchCompanies();
    };

    const handleJobFormClose = () => {
        setJobFormOpen(false);
        setSelectedCompany(null);
        if (companyViewOpen) {
            // Refresh jobs in view dialog
            handleViewCompany(selectedCompany!);
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    // Handle company form save
    // Update the handleCompanySave function in your companies page:

    const handleCompanySave = async (formData: FormData) => {
        try {
            if (editingCompany) {
                // Update existing company
                await updateCompany(editingCompany._id, formData);
                setSnackbar({
                    open: true,
                    message: "Company updated successfully",
                    severity: "success",
                });
            } else {
                // Create new company
                await createCompany(formData);
                setSnackbar({
                    open: true,
                    message: "Company created successfully",
                    severity: "success",
                });
            }

            // Refresh the companies list
            fetchCompanies();

        } catch (error: unknown) {
            console.error('Error saving company:', error);
            setSnackbar({
                open: true,
                message: error instanceof Error
                    ? error.message : "Failed to save company",
                severity: "error",
            });
            throw error; // Re-throw to prevent dialog from closing on error
        }
    };


    const handleJobSave = async (formData: FormData | JobFormData) => {
        try {
            if (!selectedCompany?._id) {
                throw new Error("No company selected to attach the job to");
            }

            if (!user?._id) {
                throw new Error("User is not logged in");
            }

            // Type guard: check if it's FormData
            const isFormData = formData instanceof FormData;
            if (isFormData) {
                // Add createdBy field
                formData.append('createdBy', user._id);

                console.log("formData", formData);

                // Pass companyId + formData to the API
                await createJob({
                    company: selectedCompany._id,
                    data: formData// Use the new FormData object
                });

                setSnackbar({
                    open: true,
                    message: "Job created successfully",
                    severity: "success",
                });
            } else {
                // Handle JobFormData (for future update functionality)
                throw new Error("Job update functionality not implemented yet");
            }
        } catch (error: unknown) { // ✅ Changed from error: any
            console.error("Error saving job:", error);

            const errorMessage = error instanceof AxiosError
                ? (error.response?.data?.message || error.message)
                : error instanceof Error
                    ? error.message
                    : "Failed to save job";

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error",
            });
            throw error; // keep dialog open on error
        }
    };

    // Add this function after your existing handlers
    const handleReset = () => {
        setSearchTerm("");
        setIndustryFilter("");
        setStatusFilter("");
        setCurrentPage(1);
        fetchCompanies();
    };


    return (
        <>
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
                    {/* Header - Made responsive */}
                    <Box sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        mb: 3,
                        mr: 3,
                        gap: { xs: 2, sm: 0 }
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" }
                            }}
                        >
                            Company Management
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCompanyFormOpen(true)}
                            sx={{
                                borderRadius: 2,
                                width: { xs: "100%", sm: "auto" },
                                minWidth: { xs: "auto", sm: "140px" }
                            }}
                        >
                            Add Company
                        </Button>
                    </Box>

                    {/* Search and Filters - Made responsive */}
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
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <TextField
                                    placeholder="Search companies..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Industry</InputLabel>
                                    <Select
                                        value={industryFilter}
                                        onChange={(e) => handleIndustryFilter(e.target.value)}
                                        label="Industry"
                                    >
                                        <MenuItem value="">All Industries</MenuItem>
                                        {industries.map((industry) => (
                                            <MenuItem key={industry} value={industry}>
                                                {industry}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => handleStatusFilter(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="">All Statuses</MenuItem>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                        <MenuItem value="suspended">Suspended</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleReset}
                                    fullWidth
                                >
                                    Reset
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Divider sx={{ mb: 3 }} />

                    {/* Results Summary - Made responsive */}
                    <Box sx={{
                        mb: 3,
                        mr: 3,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 1, sm: 0 }
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {companies.length} of {total} companies
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Page {currentPage} of {totalPages}
                        </Typography>
                    </Box>

                    {/* Companies Grid */}
                    <Grid container spacing={3}>
                        {companies.map((company) => (
                            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={company._id}>
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
                                        border: `1px solid ${getStatusColor(company.status)}40`,
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: { xs: "column", sm: "row" }, // ✅ stack on xs, row on sm+
                                                alignItems: { xs: "flex-start", sm: "center" },
                                                gap: { xs: 1, sm: 0 }, // space when stacked
                                                minWidth: 0,
                                            }}
                                        >
                                            {/* Avatar + Text */}
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
                                                    {company.logo ? (
                                                        <Box
                                                            component="img"
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${company.logo}`}
                                                            alt={company.name}
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

                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 0.5,
                                                            fontSize: { xs: "1rem", sm: "1.25rem" },
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                        title={company.name}
                                                    >
                                                        {company.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                        title={company.industry}
                                                    >
                                                        {company.industry}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Chip */}
                                            <Chip
                                                label={company.status}
                                                color={getStatusColor(company.status)}
                                                size="small"
                                                sx={{ flexShrink: 0, ml: { xs: 0, sm: 1 }, mb: { xs: 2 } }} // ✅ stacked on xs, inline on sm+
                                            />
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 1,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}
                                            title={`${company.location?.city}, ${company.location?.country}`}
                                        >
                                            📍 {company.location?.city}, {company.location?.country}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}
                                            title={company.contact?.email}
                                        >
                                            📧 {company.contact?.email}
                                        </Typography>

                                        <Box sx={{ display: "flex", justifyContent: { xs: "space-around", sm: "space-between" }, mb: 2 }}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Jobs
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {company.totalJobs || 0}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Applications
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {company.totalApplications || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
                                        <Box sx={{
                                            display: "flex",
                                            gap: { xs: 0.5, sm: 1 },
                                            width: "100%",
                                            justifyContent: { xs: "center", md: "start" }
                                        }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    onClick={() => handleViewCompany(company)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Company">
                                                <IconButton
                                                    onClick={() => handleEditCompany(company)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Add Job">
                                                <IconButton
                                                    onClick={() => handleAddJob(company)}
                                                    color="success"
                                                    size="small"
                                                >
                                                    <WorkIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Company">
                                                <IconButton
                                                    onClick={() => handleDeleteCompany(company)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
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
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {/* Empty State */}
                    {companies.length === 0 && !loading && (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 8,
                                color: "text.secondary",
                            }}
                        >
                            <BusinessIcon sx={{ fontSize: { xs: 48, sm: 64 }, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" gutterBottom>
                                No companies found
                            </Typography>
                            <Typography variant="body2">
                                {searchTerm || industryFilter || statusFilter
                                    ? "Try adjusting your search criteria"
                                    : "Get started by adding your first company"}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Dialogs */}
            <CompanyFormDialog
                open={companyFormOpen}
                onSave={handleCompanySave}
                onClose={handleCompanyFormClose}
                initialData={editingCompany}
            />

            <CompanyViewDialog
                open={companyViewOpen}
                onClose={() => setCompanyViewOpen(false)}
                company={selectedCompany}
                jobs={companyJobs}
                onAddJob={() => setJobFormOpen(true)}
                onEditJob={(job) => {
                    // Handle edit job
                    console.log("Edit job:", job);
                }}
                onDeleteJob={async (jobId) => {
                    try {
                        const success = await deleteJob(jobId);
                        if (success) {
                            setSnackbar({
                                open: true,
                                message: "Job deleted successfully",
                                severity: "success",
                            });
                            handleViewCompany(selectedCompany!);
                        }
                    } catch (error) {
                        setSnackbar({
                            open: true,
                            message: "Failed to delete job",
                            severity: "error",
                        });
                    }
                }}
            />

            <JobFormDialog
                open={jobFormOpen}
                onSave={handleJobSave}
                onClose={handleJobFormClose}
                initialData={editingJob}
                companyId={selectedCompany?._id} // Add this line
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
                <DialogTitle id="delete-dialog-title">Delete Company</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone!
                    </Alert>
                    <Typography>
                        Are you sure you want to delete{" "}
                        <strong>{companyToDelete?.name}</strong>? This will also deactivate all jobs associated with this company.
                    </Typography>
                    <Typography color="error" fontWeight="bold" sx={{ mt: 2 }}>
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
                        fullWidth={window.innerWidth < 600}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleteLoading}
                        startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                        fullWidth={window.innerWidth < 600}
                    >
                        {deleteLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}