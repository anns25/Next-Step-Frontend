"use client";

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
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
    IconButton,
} from '@mui/material';
import {
    Close as CloseIcon,
    Work as WorkIcon,
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    AccessTime as TimeIcon,
    Public as PublicIcon,
    Home as HomeIcon,
    BusinessCenter as BusinessIcon2,
} from '@mui/icons-material';
import { Job, JobCompany } from '@/types/Job';

interface JobViewDialogProps {
    open: boolean;
    onClose: () => void;
    job: Job | null;
}

const JobViewDialog: React.FC<JobViewDialogProps> = ({ open, onClose, job }) => {
    if (!job) return null;

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatSalary = (salary: any) => {
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

    const getJobTypeColor = (type: string) => {
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
                return 'default';
            default:
                return 'default';
        }
    };

    const getIsActiveStatus = (isActive: boolean) => {
        return isActive ? { label: "Active", color: "success" } : { label: "Inactive", color: "default" };
    };

    const getExperienceLevelColor = (level: string) => {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'default';
            case 'draft':
                return 'warning';
            case 'expired':
                return 'error';
            default:
                return 'default';
        }
    };

    // Helper function to get company name
    const getCompanyName = (company: string | JobCompany | undefined): string => {
        if (!company) return 'Unknown Company';
        if (typeof company === 'string') return company;
        return company.name || 'Unknown Company';
    };

    const getCompanyLogo = (company: string | JobCompany | undefined): string | null => {
        if (!company || typeof company === "string") return null;
        return company.logo || null;
    };


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2, maxHeight: '90vh' }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${getCompanyLogo(job.company)}`}
                            sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}
                        >
                            {!getCompanyLogo(job.company) && <WorkIcon />}
                        </Avatar>

                        <Box>
                            <Typography variant="h5" component="h2" fontWeight="bold">
                                {job.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {getCompanyName(job.company)}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Job Overview */}
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Job Overview
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <ScheduleIcon color="action" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            Job Type:
                                        </Typography>
                                        <Chip
                                            label={job.jobType}
                                            color={getJobTypeColor(job.jobType)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <PersonIcon color="action" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            Experience:
                                        </Typography>
                                        <Chip
                                            label={job.experienceLevel}
                                            color={getExperienceLevelColor(job.experienceLevel)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <MoneyIcon color="action" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            Salary:
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatSalary(job.salary)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <TimeIcon color="action" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            Status:
                                        </Typography>
                                        <Chip
                                            label={getIsActiveStatus(job.isActive).label}
                                            color={getIsActiveStatus(job.isActive).color as any}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Grid>

                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Location */}
                    <Grid size={{ xs: 12 }}>
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
                    </Grid>

                    {/* Description */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Description
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {job.description}
                        </Typography>
                    </Grid>

                    {/* Requirements */}
                    {job.requirements && (
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Requirements
                            </Typography>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                {job.requirements.skills && job.requirements.skills.length > 0 && (
                                    <Box mb={2}>
                                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                            Skills Required:
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            {job.requirements.skills.map((skill, index) => (
                                                <Chip
                                                    key={index}
                                                    label={skill}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {job.requirements.education && (
                                    <Box mb={2}>
                                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                            Education:
                                        </Typography>
                                        <Typography variant="body2">
                                            {job.requirements.education}
                                        </Typography>
                                    </Box>
                                )}

                                {job.requirements.experience && (
                                    <Box mb={2}>
                                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                            Experience:
                                        </Typography>
                                        <Typography variant="body2">
                                            {job.requirements.experience}
                                        </Typography>
                                    </Box>
                                )}

                                {job.requirements.certifications && job.requirements.certifications.length > 0 && (
                                    <Box mb={2}>
                                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
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

                    {/* Additional Information */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Additional Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Posted by:</strong> {getCompanyName(job.company)}
                                </Typography>

                            </Grid>
                            {job.applicationDeadline && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Application Deadline:</strong> {formatDate(job.applicationDeadline)}
                                    </Typography>
                                </Grid>
                            )}
                            {job.startDate && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Start Date:</strong> {formatDate(job.startDate)}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JobViewDialog;