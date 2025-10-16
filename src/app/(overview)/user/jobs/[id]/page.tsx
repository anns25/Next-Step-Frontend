"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Chip,
    Grid,
    Divider,
    Avatar,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Snackbar,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Work as WorkIcon,
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    CheckCircle as CheckIcon,
    AccessTime as TimeIcon,
    Public as PublicIcon,
    Home as HomeIcon,
    BusinessCenter as BusinessIcon2,
    Send as SendIcon,
} from '@mui/icons-material';
import { Job, JobCompany, JobSalary } from '@/types/Job';
import JobShareButtons from '@/components/JobShareButtons';

import ApplicationFormDialog from '@/components/ApplicationFormDialog';
import { getJobById } from '@/lib/api/jobAPI';



export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    useEffect(() => {
        if (params.id) {
            fetchJob(params.id as string);
        }
    }, [params.id]);

    const fetchJob = async (id: string) => {
        try {
            setLoading(true);
            const data = await getJobById(id);
            setJob(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatSalary = (salary: JobSalary | undefined) => {
        if (!salary) return 'Not specified';

        const { min, max, period, currency = 'USD' } = salary;
        const minFormatted = min?.toLocaleString();
        const maxFormatted = max?.toLocaleString();

        if (min && max) {
            return `${currency} ${minFormatted} - ${maxFormatted} ${period}`;
        } else if (min) {
            return `${currency} ${minFormatted}+ ${period}`;
        } else if (max) {
            return `Up to ${currency} ${maxFormatted} ${period}`;
        }

        return 'Not specified';
    };

    const getLocationIcon = (type: string) => {
        switch (type) {
            case 'remote':
                return <HomeIcon />;
            case 'on-site':
                return <BusinessIcon2 />;
            case 'hybrid':
                return <PublicIcon />;
            default:
                return <LocationIcon />;
        }
    };

    const getJobTypeColor = (type: string): "success" | "warning" | "error" | "default" | "info" | "primary" | "secondary" => {
        switch (type) {
            case 'full-time':
                return 'primary';
            case 'part-time':
                return 'secondary';
            case 'contract':
                return 'warning';
            case 'internship':
                return 'info';
            case 'temporary':
                return 'error';
            default:
                return 'default';
        }
    };

    const getIsActiveStatus = (isActive: boolean): {
        label: string;
        color: 'success' | 'default'
    } => {
        return isActive
            ? { label: "Active", color: "success" as const }
            : { label: "Inactive", color: "default" as const };
    };

    const getExperienceLevelColor = (level: string): "success" | "warning" | "error" | "default" | "info" => {
        switch (level) {
            case 'entry':
                return 'success';
            case 'mid':
                return 'info';
            case 'senior':
                return 'warning';
            case 'executive':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleApplicationSuccess = () => {
        setSnackbar({
            open: true,
            message: "Application submitted successfully!",
            severity: "success",
        });
    };

    const getCompanyName = (company: string | JobCompany | undefined): string => {
        if (!company) return 'Unknown Company';
        if (typeof company === 'string') return company;
        return company.name || 'Unknown Company';
    };

    const getCompanyLogo = (company: string | JobCompany | undefined): string | null => {
        if (!company || typeof company === "string") return null;
        return company.logo || null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !job) {
        return (
            <Box sx={{ position: "relative", zIndex: 2 }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 3, md: 6 },
                        borderRadius: { xs: 2, md: 3 },
                        backdropFilter: "blur(12px)",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                        boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                    }}
                >
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error || 'Job not found'}
                    </Alert>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                        variant="outlined"
                    >
                        Go Back
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ position: "relative", zIndex: 2 }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 2, sm: 3, md: 6 },
                        borderRadius: { xs: 2, md: 3 },
                        backdropFilter: "blur(12px)",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                        boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                    }}
                >

                    {/* Job Header */}
                    <Box sx={{ mb: 4 }}>
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                    src={getCompanyLogo(job.company) ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${getCompanyLogo(job.company)}` : undefined}
                                    sx={{ bgcolor: 'primary.main', width: { xs: 56, md: 72 }, height: { xs: 56, md: 72 } }}
                                >
                                    {!getCompanyLogo(job.company) && <WorkIcon sx={{ fontSize: { xs: 32, md: 40 } }} />}
                                </Avatar>

                                <Box>
                                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                                        {job.title}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                        {getCompanyName(job.company)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<SendIcon />}
                                onClick={() => setApplicationDialogOpen(true)}
                                sx={{ minWidth: { xs: '100%', sm: 200 } }}
                            >
                                Apply Now
                            </Button>

                            <JobShareButtons job={job} variant="menu" />

                        </Box>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={4}>
                        {/* Job Overview */}
                        <Grid size={{ xs: 12 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    backdropFilter: "blur(12px)",
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                    boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                }}
                            >
                                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                                    Job Overview
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <ScheduleIcon color="action" fontSize="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Job Type
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={job.jobType}
                                                color={getJobTypeColor(job.jobType)}
                                                size="small"
                                                variant="filled"
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <PersonIcon color="action" fontSize="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Experience Level
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={job.experienceLevel}
                                                color={getExperienceLevelColor(job.experienceLevel)}
                                                size="small"
                                                variant="filled"
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <MoneyIcon color="action" fontSize="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Salary Range
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" fontWeight="medium">
                                                {formatSalary(job.salary)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <TimeIcon color="action" fontSize="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Status
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={getIsActiveStatus(job.isActive).label}
                                                color={getIsActiveStatus(job.isActive).color}
                                                size="small"
                                                variant="filled"
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Location */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    backdropFilter: "blur(12px)",
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                    boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                    height: '100%',
                                }}
                            >
                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                    Location
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    {getLocationIcon(job.location?.type || 'on-site')}
                                    <Typography variant="body1" fontWeight="medium">
                                        {job.location?.type?.charAt(0).toUpperCase() + job.location?.type?.slice(1) || 'On-site'}
                                    </Typography>
                                </Box>
                                {job.location?.type !== 'remote' && (
                                    <Box>
                                        {job.location?.address && (
                                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                                                {job.location.address}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary">
                                            {[job.location?.city, job.location?.state, job.location?.country]
                                                .filter(Boolean)
                                                .join(', ')}
                                            {job.location?.zipCode && ` ${job.location.zipCode}`}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        {/* Additional Information */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    backdropFilter: "blur(12px)",
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                    boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                    height: '100%',
                                }}
                            >
                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                    Additional Information
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={1.5}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Posted by:</strong> {getCompanyName(job.company)}
                                        </Typography>
                                    </Box>
                                    {job.applicationDeadline && (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Application Deadline:</strong> {formatDate(job.applicationDeadline)}
                                            </Typography>
                                        </Box>
                                    )}
                                    {job.startDate && (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Start Date:</strong> {formatDate(job.startDate)}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Description */}
                        <Grid size={{ xs: 12 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    backdropFilter: "blur(12px)",
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                    boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                }}
                            >
                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                    Job Description
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                                    {job.description}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Requirements */}
                        {job.requirements && (
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        backdropFilter: "blur(12px)",
                                        background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                                        boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Requirements
                                    </Typography>

                                    {job.requirements.skills && job.requirements.skills.length > 0 && (
                                        <Box mb={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" mb={1.5}>
                                                Required Skills:
                                            </Typography>
                                            <Box display="flex" flexWrap="wrap" gap={1}>
                                                {job.requirements.skills.map((skill, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={skill}
                                                        size="medium"
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {job.requirements.education && (
                                        <Box mb={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                                                Education:
                                            </Typography>
                                            <Typography variant="body1">
                                                {job.requirements.education}
                                            </Typography>
                                        </Box>
                                    )}

                                    {job.requirements.experience && (
                                        <Box mb={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                                                Experience:
                                            </Typography>
                                            <Typography variant="body1">
                                                {job.requirements.experience}
                                            </Typography>
                                        </Box>
                                    )}

                                    {job.requirements.certifications && job.requirements.certifications.length > 0 && (
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                                                Certifications:
                                            </Typography>
                                            <List dense>
                                                {job.requirements.certifications.map((cert, index) => (
                                                    <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                                            <CheckIcon color="success" fontSize="small" />
                                                        </ListItemIcon>
                                                        <ListItemText primary={cert} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        )}
                    </Grid>

                    {/* Bottom Action Buttons */}
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SendIcon />}
                            onClick={() => setApplicationDialogOpen(true)}
                            sx={{ minWidth: { xs: '100%', sm: 200 } }}
                        >
                            Apply for this Job
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => router.push("/user/jobs")}
                            sx={{ minWidth: { xs: '100%', sm: 200 } }}
                        >
                            Back to Jobs
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* Application Dialog */}
            <ApplicationFormDialog
                open={applicationDialogOpen}
                onClose={() => setApplicationDialogOpen(false)}
                job={job}
                onSuccess={handleApplicationSuccess}
            />

            {/* Snackbar */}
            < Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })
                }
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar >
        </>
    );
}