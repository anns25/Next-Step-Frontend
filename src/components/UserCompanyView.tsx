"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Stack,
    Chip,
    Typography,
    Grid,
    Avatar,
    Divider,
    Paper,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    CardActions,
} from "@mui/material";
import {
    Close as CloseIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Language as WebsiteIcon,
    Work as WorkIcon,
    CalendarToday as CalendarIcon,
    LinkedIn as LinkedInIcon,
    Twitter as TwitterIcon,
    Send as SendIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";
import { Company } from "@/types/Company";
import { Job } from "@/types/Job";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";

interface UserCompanyViewDialogProps {
    open: boolean;
    onClose: () => void;
    company: Company | null;
    jobs?: Job[];
    onApplyToJob?: (jobId: string) => void;
    onSaveJob?: (jobId: string) => void;
    onSaveCompany?: (companyId: string) => void;
    savedJobs?: Set<string>;
    savedCompanies?: Set<string>;
}

const UserCompanyViewDialog: React.FC<UserCompanyViewDialogProps> = ({
    open,
    onClose,
    company,
    jobs = [],
    onApplyToJob,
    onSaveJob,
    onSaveCompany,
    savedJobs = new Set(),
    savedCompanies = new Set(),
}) => {
    const theme = useTheme();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<"details" | "jobs">("details");

    if (!company) return null;

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

    const getJobTypeColor = (jobType: string) => {
        switch (jobType) {
            case "full-time": return "success";
            case "part-time": return "info";
            case "contract": return "warning";
            case "internship": return "default";
            case "temporary": return "error";
            default: return "default";
        }
    };

    const getExperienceColor = (level: string) => {
        switch (level) {
            case "entry": return "success";
            case "mid": return "info";
            case "senior": return "warning";
            case "executive": return "error";
            default: return "default";
        }
    };

    const handleApplyToJob = (jobId: string) => {
        if (onApplyToJob) {
            onApplyToJob(jobId);
        } else {
            router.push(`/user/apply/${jobId}`);
        }
    };

    const handleSaveJob = (jobId: string) => {
        if (onSaveJob) {
            onSaveJob(jobId);
        }
    };

    const handleSaveCompany = (companyId: string) => {
        if (onSaveCompany) {
            onSaveCompany(companyId);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: "90vh",
                    height: "90vh",
                    borderRadius: 3,
                    overflow: "hidden",
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.text.secondary}, ${theme.palette.background.default})`,
                    color: theme.palette.text.primary,
                    px: 3,
                    py: 2,
                    borderBottom: `1px solid rgba(255,255,255,0.2)`,
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: "rgba(255,255,255,0.2)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                            }}
                        >
                            {company.logo ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${company.logo}`}
                                    alt={company.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <BusinessIcon sx={{ fontSize: 28, color: "white" }} />
                            )}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {company.name}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                                    {company.industry}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Tooltip title={savedCompanies.has(company._id) ? "Remove from saved" : "Save company"}>
                            <IconButton
                                onClick={() => handleSaveCompany(company._id)}
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    backdropFilter: "blur(10px)",
                                    color: "white",
                                    "&:hover": {
                                        bgcolor: "rgba(255,255,255,0.2)",
                                    }
                                }}
                            >
                                {savedCompanies.has(company._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                            </IconButton>
                        </Tooltip>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                bgcolor: "rgba(255,255,255,0.1)",
                                backdropFilter: "blur(10px)",
                                color: "white",
                                "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.2)",
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    p: 0,
                    background: `linear-gradient(135deg, ${theme.palette.text.secondary}, ${theme.palette.background.default})`,
                    height: "calc(100% - 120px)",
                    overflow: "hidden",
                }}
            >
                <Box sx={{
                    p: 3,
                    height: "100%",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}>
                    {/* Section Navigation */}
                    <Box sx={{ mb: 3, flexShrink: 0 }}>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                                variant={activeSection === "details" ? "contained" : "text"}
                                onClick={() => setActiveSection("details")}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    backgroundColor: activeSection === "details" ? theme.palette.primary.main : "transparent",
                                    color: activeSection === "details" ? "white" : theme.palette.text.primary,
                                    "&:hover": {
                                        backgroundColor: activeSection === "details" ? theme.palette.primary.dark : "rgba(0,0,0,0.04)",
                                    }
                                }}
                            >
                                Company Details
                            </Button>
                            <Button
                                variant={activeSection === "jobs" ? "contained" : "text"}
                                onClick={() => setActiveSection("jobs")}
                                startIcon={<WorkIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    backgroundColor: activeSection === "jobs" ? theme.palette.primary.main : "transparent",
                                    color: activeSection === "jobs" ? "white" : theme.palette.text.primary,
                                    "&:hover": {
                                        backgroundColor: activeSection === "jobs" ? theme.palette.primary.dark : "rgba(0,0,0,0.04)",
                                    }
                                }}
                            >
                                Available Jobs ({jobs.length})
                            </Button>
                        </Box>
                    </Box>

                    {/* Content Area */}
                    <Box sx={{ flex: 1, overflow: "hidden" }}>
                        {activeSection === "details" && (
                            <Box sx={{ height: "100%", overflow: "auto" }}>
                                <Grid container spacing={3} sx={{ height: "100%" }}>
                                    {/* Left column */}
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Stack spacing={3} sx={{ height: "100%" }}>
                                            {/* Company Information */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    background: "rgba(255,255,255,0.8)",
                                                    backdropFilter: "blur(12px)",
                                                    border: "1px solid rgba(255,255,255,0.3)",
                                                    flex: 1,
                                                }}
                                            >
                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                    About {company.name}
                                                </Typography>
                                                <Typography variant="body1" paragraph sx={{ lineHeight: 1.6, mb: 3 }}>
                                                    {company.description || "No description provided"}
                                                </Typography>

                                                <Stack spacing={2}>
                                                    {company.website && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <WebsiteIcon color="primary" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                Website:
                                                            </Typography>
                                                            <Typography
                                                                component="a"
                                                                href={company.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                sx={{
                                                                    color: "primary.main",
                                                                    textDecoration: "none",
                                                                    "&:hover": { textDecoration: "underline" },
                                                                }}
                                                            >
                                                                {company.website}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {company.foundedYear && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <CalendarIcon color="primary" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                Founded:
                                                            </Typography>
                                                            <Typography variant="body2">{company.foundedYear}</Typography>
                                                        </Box>
                                                    )}
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <LocationIcon color="primary" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Location:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {company.location?.city}, {company.location?.country}
                                                        </Typography>
                                                    </Box>
                                                    {company.isRemoteFriendly && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <WorkIcon color="primary" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                Remote Friendly:
                                                            </Typography>
                                                            <Chip label="Yes" size="small" color="success" />
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Paper>

                                            {/* Benefits */}
                                            {company.benefits && company.benefits.length > 0 && (
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        borderRadius: 2,
                                                        background: "rgba(255,255,255,0.8)",
                                                        backdropFilter: "blur(12px)",
                                                        border: "1px solid rgba(255,255,255,0.3)",
                                                    }}
                                                >
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                        Employee Benefits
                                                    </Typography>
                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                        {company.benefits.map((benefit, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={benefit}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: 'primary.light',
                                                                        color: 'white',
                                                                    },
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Paper>
                                            )}

                                            {/* Culture */}
                                            {company.culture && company.culture.length > 0 && (
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        borderRadius: 2,
                                                        background: "rgba(255,255,255,0.8)",
                                                        backdropFilter: "blur(12px)",
                                                        border: "1px solid rgba(255,255,255,0.3)",
                                                    }}
                                                >
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                        Company Culture
                                                    </Typography>
                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                        {company.culture.map((culture, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={culture}
                                                                size="small"
                                                                color="secondary"
                                                                variant="outlined"
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: 'secondary.light',
                                                                        color: 'white',
                                                                    },
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Paper>
                                            )}
                                        </Stack>
                                    </Grid>

                                    {/* Right column */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Stack spacing={3} sx={{ height: "100%" }}>
                                            {/* Contact Information */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    background: "rgba(255,255,255,0.8)",
                                                    backdropFilter: "blur(12px)",
                                                    border: "1px solid rgba(255,255,255,0.3)",
                                                    flex: 1,
                                                }}
                                            >
                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Contact Information
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <EmailIcon color="primary" />
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Email
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {company.contact?.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    {company.contact?.phone && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <PhoneIcon color="primary" />
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Phone
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {company.contact.phone}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    {company.contact?.linkedin && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <LinkedInIcon color="primary" />
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    LinkedIn
                                                                </Typography>
                                                                <Typography
                                                                    component="a"
                                                                    href={company.contact.linkedin}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{
                                                                        color: "primary.main",
                                                                        textDecoration: "none",
                                                                        "&:hover": { textDecoration: "underline" },
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    View Profile
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    {company.contact?.twitter && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <TwitterIcon color="primary" />
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Twitter
                                                                </Typography>
                                                                <Typography
                                                                    component="a"
                                                                    href={company.contact.twitter}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{
                                                                        color: "primary.main",
                                                                        textDecoration: "none",
                                                                        "&:hover": { textDecoration: "underline" },
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    @{company.contact.twitter.split('/').pop()}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Paper>

                                            {/* Company Stats */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    background: "rgba(255,255,255,0.8)",
                                                    backdropFilter: "blur(12px)",
                                                    border: "1px solid rgba(255,255,255,0.3)",
                                                }}
                                            >
                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Company Stats
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Open Positions
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                                                            {company.totalJobs || 0}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Total Applicants
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                                                            {company.totalApplications || 0}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {activeSection === "jobs" && (
                            <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexShrink: 0 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Available Positions at {company.name}
                                    </Typography>
                                </Box>

                                <Box sx={{ flex: 1, overflow: "auto" }}>
                                    {jobs.length === 0 ? (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                textAlign: "center",
                                                borderRadius: 2,
                                                background: "rgba(255,255,255,0.8)",
                                                backdropFilter: "blur(12px)",
                                                border: "1px solid rgba(255,255,255,0.3)",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <WorkIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }} />
                                            <Typography variant="h6" gutterBottom>
                                                No open positions
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                This company doesn&apos;t have any open positions at the moment
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {jobs.map((job) => (
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={job._id}>
                                                    <Card
                                                        elevation={0}
                                                        sx={{
                                                            borderRadius: 2,
                                                            background: "rgba(255,255,255,0.8)",
                                                            backdropFilter: "blur(12px)",
                                                            border: "1px solid rgba(255,255,255,0.3)",
                                                            height: "100%",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                                            "&:hover": {
                                                                transform: "translateY(-2px)",
                                                                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                                                            },
                                                        }}
                                                    >
                                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                                    {job.title}
                                                                </Typography>

                                                                <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                                                                    <Chip
                                                                        label={job.jobType}
                                                                        color={getJobTypeColor(job.jobType)}
                                                                        size="small"
                                                                    />
                                                                    <Chip
                                                                        label={job.experienceLevel}
                                                                        color={getExperienceColor(job.experienceLevel)}
                                                                        size="small"
                                                                    />
                                                                </Box>

                                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                    📍 {formatLocation(job.location)}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                    💰 {formatSalary(job.salary)}
                                                                </Typography>
                                                            </Box>
                                                        </CardContent>

                                                        <CardActions sx={{ p: 2, pt: 0 }}>
                                                            <Button
                                                                variant="contained"
                                                                fullWidth
                                                                startIcon={<SendIcon />}
                                                                onClick={() => handleApplyToJob(job._id)}
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    textTransform: "none",
                                                                    fontWeight: 600,
                                                                    mb: 1,
                                                                }}
                                                            >
                                                                Apply Now
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                fullWidth
                                                                startIcon={savedJobs.has(job._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                                                onClick={() => handleSaveJob(job._id)}
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    textTransform: "none",
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {savedJobs.has(job._id) ? "Saved" : "Save Job"}
                                                            </Button>
                                                        </CardActions>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backdropFilter: "blur(8px)",
                p: 2,
                borderTop: `1px solid rgba(255,255,255,0.2)`,
            }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.3)",
                        },
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserCompanyViewDialog;