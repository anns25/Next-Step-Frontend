"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Avatar,
    Chip,
    CircularProgress,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Card,
    CardContent,
    CardActions,
    Button,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    Business as BusinessIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";

import { Company } from "@/types/Company";
import { useRouter } from "next/navigation";
import { getAllCompanies } from "@/lib/api/companyAPI";
import { getJobsByCompany } from "@/lib/api/jobAPI";
import UserCompanyViewDialog from "@/components/UserCompanyView";
import { Job } from "@/types/Job";


export default function UserCompanies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(12);
   
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
    const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(false)
    const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
    const router = useRouter();

    // Snackbar state
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

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                search: searchTerm || undefined,
                industry: industryFilter || undefined,
            };

            console.log('Fetching companies with params:', params);
            const response = await getAllCompanies(params);


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
    }, [currentPage, searchTerm, industryFilter]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleIndustryFilter = (value: string) => {
        setIndustryFilter(value);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearchTerm("");
        setIndustryFilter("");
        setCurrentPage(1);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const viewCompany = async (company: Company) => {
        setSelectedCompany(company);
        setCompanyDialogOpen(true);

        // Fetch company jobs
        setLoadingJobs(true);
        try {
            const jobsResponse = await getJobsByCompany(company._id);
            if (jobsResponse) {
                setCompanyJobs(jobsResponse.data || []);
            }
        } catch (error) {
            console.error("Error fetching company jobs:", error);
            setCompanyJobs([]);
        } finally {
            setLoadingJobs(false);
        }
    };
    const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
        setSnackbar({
            open: true,
            message: "Job removed from saved",
            severity: "info",
        });
    } else {
        newSaved.add(jobId);
        setSnackbar({
            open: true,
            message: "Job saved successfully",
            severity: "success",
        });
    }
    setSavedJobs(newSaved);
};

    const handleApplyToJob = (jobId: string) => {
        router.push(`/user/apply/${jobId}`);
    };

    const handleSaveJob = (jobId: string) => {
        toggleSaveJob(jobId);
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
                    {/* Header */}
                    <Box sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        mb: 3,
                        gap: { xs: 2, sm: 0 }
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" }
                            }}
                        >
                            Browse Companies
                        </Typography>
                    </Box>

                    {/* Search and Filters */}
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
                            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
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
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                            <Grid size={{ xs: 12, sm: 12, md: 3 }}>
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

                    {/* Results Summary */}
                    <Box sx={{
                        mb: 3,
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
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    mr: 2,
                                                    bgcolor: "primary.main",
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
                                                        }}
                                                    />
                                                ) : (
                                                    <BusinessIcon sx={{ fontSize: 30 }} />
                                                )}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {company.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {company.industry}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                        >
                                            📍 {company.location?.city}, {company.location?.country}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            📧 {company.contact?.email}
                                        </Typography>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Open Jobs
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {company.totalJobs || 0}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Applicants
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {company.totalApplications || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => viewCompany(company)}
                                        >
                                            View Details
                                        </Button>
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
                            <BusinessIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" gutterBottom>
                                No companies found
                            </Typography>
                            <Typography variant="body2">
                                {searchTerm || industryFilter
                                    ? "Try adjusting your search criteria"
                                    : "No companies available at the moment"}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Dialog */}


            <UserCompanyViewDialog
                open={companyDialogOpen}
                onClose={() => setCompanyDialogOpen(false)}
                company={selectedCompany}
                jobs={companyJobs}
                onApplyToJob={handleApplyToJob}
                savedJobs={savedJobs}
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
        </>
    );
}