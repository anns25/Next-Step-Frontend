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
} from "@mui/material";
import {
    Close as CloseIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Language as WebsiteIcon,
    Work as WorkIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LinkedIn as LinkedInIcon,
    Twitter as TwitterIcon,
    CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { Company } from "@/types/Company";
import { useTheme } from "@mui/material/styles";
import { Job } from "@/types/Job";

type Props = {
    open: boolean;
    onClose: () => void;
    company: Company | null;
    jobs?: Job[];
    onAddJob?: () => void;
    onEditJob?: (job: Job) => void;
    onDeleteJob?: (jobId: string) => void;
};

const CompanyViewDialog: React.FC<Props> = ({
    open,
    onClose,
    company,
    jobs = [],
    onAddJob,
    onEditJob,
    onDeleteJob
}) => {
    const theme = useTheme();
    const [activeSection, setActiveSection] = useState<"details" | "jobs">("details");

    if (!company) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "success";
            case "pending":
                return "warning";
            case "suspended":
                return "error";
            default:
                return "default";
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
                    color: theme.palette.getContrastText(theme.palette.text.secondary),
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
                                bgcolor: theme.palette.primary.main,
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
                                <BusinessIcon sx={{ fontSize: 28 }} />
                            )}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                {company.name}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                <Chip
                                    label={company.status}
                                    color={getStatusColor(company.status)}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                                <Typography variant="body2" color="background.default">
                                    {company.industry}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(10px)",
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.2)",
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
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
                                        backgroundColor: activeSection === "details" ? theme.palette.primary.dark : "rgba(255,255,255,0.1)",
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
                                        backgroundColor: activeSection === "jobs" ? theme.palette.primary.dark : "rgba(255,255,255,0.1)",
                                    }
                                }}
                            >
                                Jobs ({jobs.length})
                            </Button>
                        </Box>
                    </Box>

                    {/* Content Area */}
                    <Box sx={{ flex: 1, overflow: "hidden" }}>
                        {activeSection === "details" && (
                            <Box sx={{ height: "100%", overflow: "auto" }}>
                                <Grid container spacing={3} sx={{ height: "100%" }}>
                                    {/* Left column */}
                                    <Grid size={{xs:12, md:8}}>
                                        <Stack spacing={3} sx={{ height: "100%" }}>
                                            {/* Company Information */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    background: "rgba(255,255,255,0.85)",
                                                    backdropFilter: "blur(12px)",
                                                    border: "1px solid rgba(255,255,255,0.2)",
                                                    flex: 1,
                                                }}
                                            >
                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Company Information
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
                                                        background: "rgba(255,255,255,0.85)",
                                                        backdropFilter: "blur(12px)",
                                                        border: "1px solid rgba(255,255,255,0.2)",
                                                    }}
                                                >
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                        Benefits
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
                                                        background: "rgba(255,255,255,0.85)",
                                                        backdropFilter: "blur(12px)",
                                                        border: "1px solid rgba(255,255,255,0.2)",
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
                                        </Stack>
                                    </Grid>

                                    {/* Right column */}
                                    <Grid size={{xs:12, md:4}}>
                                        <Stack spacing={3} sx={{ height: "100%" }}>
                                            {/* Contact Information */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    background: "rgba(255,255,255,0.85)",
                                                    backdropFilter: "blur(12px)",
                                                    border: "1px solid rgba(255,255,255,0.2)",
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
                                                    background: "rgba(255,255,255,0.85)",
                                                    backdropFilter: "blur(12px)",
                                                    border: "1px solid rgba(255,255,255,0.2)",
                                                }}
                                            >
                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Company Stats
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Total Jobs
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                                                            {company.totalJobs || 0}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Total Applications
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                                                            {company.totalApplications || 0}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Max Jobs Allowed
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                                                            {company.maxJobs || 50}
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
                                        Company Jobs
                                    </Typography>
                                    {onAddJob && (
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={onAddJob}
                                            sx={{ 
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                boxShadow: "0px 4px 10px rgba(25, 118, 210, 0.3)",
                                                "&:hover": {
                                                    boxShadow: "0px 6px 14px rgba(25, 118, 210, 0.4)",
                                                },
                                            }}
                                        >
                                            Add Job
                                        </Button>
                                    )}
                                </Box>

                                <Box sx={{ flex: 1, overflow: "auto" }}>
                                    {jobs.length === 0 ? (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                textAlign: "center",
                                                borderRadius: 2,
                                                background: "rgba(255,255,255,0.85)",
                                                backdropFilter: "blur(12px)",
                                                border: "1px solid rgba(255,255,255,0.2)",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <WorkIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }} />
                                            <Typography variant="h6" gutterBottom>
                                                No jobs posted yet
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                This company hasn&apos;t posted any job openings
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {jobs.map((job) => (
                                                <Grid size={{xs:12, sm:6, md:4}} key={job._id}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 2,
                                                            background: "rgba(255,255,255,0.85)",
                                                            backdropFilter: "blur(12px)",
                                                            border: "1px solid rgba(255,255,255,0.2)",
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
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                                {job.title}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                {job.jobType} • {job.experienceLevel}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                📍 {formatLocation(job.location)}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                💰 {formatSalary(job.salary)}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                📅 Posted {formatDate(job.createdAt)}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                                                            <Chip
                                                                label={job.isActive ? "Active" : "Inactive"}
                                                                color={job.isActive ? "success" : "default"}
                                                                size="small"
                                                            />
                                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                                {onEditJob && (
                                                                    <Tooltip title="Edit Job">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => onEditJob(job)}
                                                                            sx={{ color: "primary.main" }}
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {onDeleteJob && (
                                                                    <Tooltip title="Delete Job">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => onDeleteJob(job._id)}
                                                                            sx={{ color: "error.main" }}
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Paper>
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
                background: `linear-gradient(135deg, ${theme.palette.text.secondary}, ${theme.palette.background.default})`,
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
                        boxShadow: "0px 4px 10px rgba(25, 118, 210, 0.3)",
                        "&:hover": {
                            boxShadow: "0px 6px 14px rgba(25, 118, 210, 0.4)",
                        },
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CompanyViewDialog;