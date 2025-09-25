"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Box,
    Typography,
    Chip,
    IconButton,
    Alert,
    FormControlLabel,
    Switch,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Work as WorkIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { Job, JobFormData } from '@/types/Job';
import { jobCreationSchemaWithConditions } from '@/lib/validation/jobAuthSchema';

interface JobFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (formData: any) => Promise<void>;
    initialData?: Job | null;
}

const jobTypes = [
    'full-time',
    'part-time',
    'contract',
    'internship',
    'temporary'
];

const experienceLevels = [
    'entry',
    'mid',
    'senior',
    'executive'
];

const locationTypes = [
    'remote',
    'on-site',
    'hybrid'
];

const salaryPeriods = [
    'hourly',
    'monthly',
    'yearly'
];

const currencies = [
    'RUP',
    'USD',
    'EUR',
    'GBP',
    'CAD'
];

export default function JobFormDialog({
    open,
    onClose,
    onSave,
    initialData,
}: JobFormDialogProps) {
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        company: '',
        location: {
            type: 'remote',
            address: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        },
        jobType: 'full-time',
        experienceLevel: 'entry',
        salary: {
            min: undefined,
            max: undefined,
            currency: 'USD',
            period: 'yearly',
            isNegotiable: false
        },
        requirements: {
            skills: [],
            education: '',
            experience: '',
            certifications: [],
            languages: []
        },
        responsibilities: [],
        benefits: [],
        applicationDeadline: '',
        startDate: '',
        isActive: true,
        isFeatured: false,
        tags: [],
        externalUrl: '',
        applicationInstructions: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');

    // Initialize form data when dialog opens
    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    company: typeof initialData.company === 'string' ? initialData.company : initialData.company._id,
                    location: {
                        type: initialData.location?.type || 'remote',
                        address: initialData.location?.address || '',
                        city: initialData.location?.city || '',
                        state: initialData.location?.state || '',
                        country: initialData.location?.country || '',
                        zipCode: initialData.location?.zipCode || ''
                    },
                    jobType: initialData.jobType || 'full-time',
                    experienceLevel: initialData.experienceLevel || 'entry',
                    salary: {
                        min: initialData.salary?.min,
                        max: initialData.salary?.max,
                        currency: initialData.salary?.currency || 'USD',
                        period: initialData.salary?.period || 'yearly',
                        isNegotiable: initialData.salary?.isNegotiable || false
                    },
                    requirements: {
                        skills: initialData.requirements?.skills || [],
                        education: initialData.requirements?.education || '',
                        experience: initialData.requirements?.experience || '',
                        certifications: initialData.requirements?.certifications || [],
                        languages: initialData.requirements?.languages || []
                    },
                    responsibilities: initialData.responsibilities || [],
                    benefits: initialData.benefits || [],
                    applicationDeadline: initialData.applicationDeadline || '',
                    startDate: initialData.startDate || '',
                    isActive: initialData.isActive !== false,
                    isFeatured: initialData.isFeatured || false,
                    tags: initialData.tags || [],
                    externalUrl: initialData.externalUrl || '',
                    applicationInstructions: initialData.applicationInstructions || ''
                });
            } else {
                // Reset form for new job
                setFormData({
                    title: '',
                    description: '',
                    company: '',
                    location: {
                        type: 'remote',
                        address: '',
                        city: '',
                        state: '',
                        country: '',
                        zipCode: ''
                    },
                    jobType: 'full-time',
                    experienceLevel: 'entry',
                    salary: {
                        min: undefined,
                        max: undefined,
                        currency: 'USD',
                        period: 'yearly',
                        isNegotiable: false
                    },
                    requirements: {
                        skills: [],
                        education: '',
                        experience: '',
                        certifications: [],
                        languages: []
                    },
                    responsibilities: [],
                    benefits: [],
                    applicationDeadline: '',
                    startDate: '',
                    isActive: true,
                    isFeatured: false,
                    tags: [],
                    externalUrl: '',
                    applicationInstructions: ''
                });
            }
            setErrors({});
            setSubmitError('');
        }
    }, [open, initialData]);

    const getNestedProperty = (obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const validateField = (name: string, value: any): string => {
        const fieldSchema = getNestedProperty(jobCreationSchemaWithConditions, name);
        if (!fieldSchema) return '';

        if (fieldSchema.required && (!value || value.toString().trim() === '')) {
            return fieldSchema.required;
        }

        if (value && fieldSchema.minLength && value.length < fieldSchema.minLength.value) {
            return fieldSchema.minLength.message;
        }

        if (value && fieldSchema.maxLength && value.length > fieldSchema.maxLength.value) {
            return fieldSchema.maxLength.message;
        }

        if (value && fieldSchema.pattern && !fieldSchema.pattern.value.test(value)) {
            return fieldSchema.pattern.message;
        }

        if (value && fieldSchema.min && Number(value) < fieldSchema.min.value) {
            return fieldSchema.min.message;
        }

        if (value && fieldSchema.max && Number(value) > fieldSchema.max.value) {
            return fieldSchema.max.message;
        }

        return '';
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate required fields
        const requiredFields = [
            'title',
            'description',
            'company',
            'location.type',
            'jobType',
            'experienceLevel',
        ];

        requiredFields.forEach(field => {
            const value = getNestedProperty(formData, field);
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
            }
        });

        // Validate location requirements for non-remote positions
        if (formData.location.type !== 'remote') {
            if (!formData.location.city) {
                newErrors['location.city'] = 'City is required for non-remote positions';
            }
            if (!formData.location.country) {
                newErrors['location.country'] = 'Country is required for non-remote positions';
            }
        }

        // Validate salary range
        if (formData.salary?.min && formData.salary?.max) {
            if (formData.salary.min > formData.salary.max) {
                newErrors['salary.max'] = 'Maximum salary must be greater than minimum salary';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev };

            // Handle nested object updates safely
            if (field.includes('.')) {
                const keys = field.split('.');
                let current = newData as any;

                // Navigate to the parent object
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }

                // Set the final value
                current[keys[keys.length - 1]] = value;
            } else {
                // Handle top-level properties
                (newData as any)[field] = value;
            }

            return newData;
        });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        if (submitError) {
            setSubmitError('');
        }
    };

    const addArrayItem = (field: string, value: string) => {
        if (value.trim()) {
            setFormData(prev => {
                const keys = field.split('.');
                let current = prev as any;

                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }

                const arrayField = keys[keys.length - 1];
                if (!current[arrayField]) {
                    current[arrayField] = [];
                }
                current[arrayField] = [...current[arrayField], value.trim()];
                return { ...prev };
            });
        }
    };

    const removeArrayItem = (field: string, index: number) => {
        setFormData(prev => {
            const keys = field.split('.');
            let current = prev as any;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            const arrayField = keys[keys.length - 1];
            current[arrayField] = current[arrayField].filter((_: any, i: number) => i !== index);
            return { ...prev };
        });
    };

    const handleSubmit = async () => {
        setSubmitError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error: any) {
            console.error('Error saving job:', error);
            setSubmitError(error.message || 'Failed to save job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    // Helper function to get array items safely
    const getArrayItems = (field: string): string[] => {
        const keys = field.split('.');
        let current = formData as any;
        for (const key of keys) {
            current = current?.[key];
        }
        return current || [];
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            fullScreen={window.innerWidth < 768}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <WorkIcon />
                        <Typography variant="h6">
                            {initialData ? 'Edit Job' : 'Add New Job'}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose} disabled={loading}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {submitError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {submitError}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Job Title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            error={!!errors.title}
                            helperText={errors.title}
                            disabled={loading}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description}
                            disabled={loading}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth error={!!errors.jobType} required>
                            <InputLabel>Job Type</InputLabel>
                            <Select
                                value={formData.jobType}
                                onChange={(e) => handleInputChange('jobType', e.target.value)}
                                label="Job Type"
                                disabled={loading}
                            >
                                {jobTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {errors.jobType && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                {errors.jobType}
                            </Typography>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth error={!!errors.experienceLevel} required>
                            <InputLabel>Experience Level</InputLabel>
                            <Select
                                value={formData.experienceLevel}
                                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                                label="Experience Level"
                                disabled={loading}
                            >
                                {experienceLevels.map((level) => (
                                    <MenuItem key={level} value={level}>
                                        {level}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {errors.experienceLevel && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                {errors.experienceLevel}
                            </Typography>
                        )}
                    </Grid>

                    {/* Location Information */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Location
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth error={!!errors['location.type']} required>
                            <InputLabel>Location Type</InputLabel>
                            <Select
                                value={formData.location.type}
                                onChange={(e) => handleInputChange('location.type', e.target.value)}
                                label="Location Type"
                                disabled={loading}
                            >
                                {locationTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {errors['location.type'] && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                {errors['location.type']}
                            </Typography>
                        )}
                    </Grid>

                    {formData.location.type !== 'remote' && (
                        <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="City"
                                    value={formData.location.city}
                                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                                    error={!!errors['location.city']}
                                    helperText={errors['location.city']}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Country"
                                    value={formData.location.country}
                                    onChange={(e) => handleInputChange('location.country', e.target.value)}
                                    error={!!errors['location.country']}
                                    helperText={errors['location.country']}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="State/Province"
                                    value={formData.location.state}
                                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={formData.location.address}
                                    onChange={(e) => handleInputChange('location.address', e.target.value)}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="ZIP/Postal Code"
                                    value={formData.location.zipCode}
                                    onChange={(e) => handleInputChange('location.zipCode', e.target.value)}
                                    disabled={loading}
                                />
                            </Grid>
                        </>
                    )}

                    {/* Salary Information */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Salary Information
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Min Salary"
                            value={formData.salary?.min || ''}
                            onChange={(e) => handleInputChange('salary.min', e.target.value ? Number(e.target.value) : undefined)}
                            error={!!errors['salary.min']}
                            helperText={errors['salary.min']}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Max Salary"
                            value={formData.salary?.max || ''}
                            onChange={(e) => handleInputChange('salary.max', e.target.value ? Number(e.target.value) : undefined)}
                            error={!!errors['salary.max']}
                            helperText={errors['salary.max']}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Currency</InputLabel>
                            <Select
                                value={formData.salary?.currency || 'USD'}
                                onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                                label="Currency"
                                disabled={loading}
                            >
                                {currencies.map((currency) => (
                                    <MenuItem key={currency} value={currency}>
                                        {currency}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Period</InputLabel>
                            <Select
                                value={formData.salary?.period || 'yearly'}
                                onChange={(e) => handleInputChange('salary.period', e.target.value)}
                                label="Period"
                                disabled={loading}
                            >
                                {salaryPeriods.map((period) => (
                                    <MenuItem key={period} value={period}>
                                        {period}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.salary?.isNegotiable || false}
                                    onChange={(e) => handleInputChange('salary.isNegotiable', e.target.checked)}
                                    disabled={loading}
                                />
                            }
                            label="Salary is negotiable"
                        />
                    </Grid>

                    {/* Requirements */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Requirements
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Skills
                        </Typography>
                        <Box display="flex" gap={1} mb={2}>
                            <TextField
                                size="small"
                                placeholder="Add skill..."
                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const target = e.target as HTMLInputElement;
                                        addArrayItem('requirements.skills', target.value);
                                        target.value = '';
                                    }
                                }}
                                disabled={loading}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add skill..."]') as HTMLInputElement;
                                    if (input) {
                                        addArrayItem('requirements.skills', input.value);
                                        input.value = '';
                                    }
                                }}
                                disabled={loading}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {getArrayItems('requirements.skills').map((skill, index) => (
                                <Chip
                                    key={index}
                                    label={skill}
                                    onDelete={() => removeArrayItem('requirements.skills', index)}
                                    disabled={loading}
                                />
                            ))}
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Education"
                            value={formData.requirements?.education || ''}
                            onChange={(e) => handleInputChange('requirements.education', e.target.value)}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Experience"
                            value={formData.requirements?.experience || ''}
                            onChange={(e) => handleInputChange('requirements.experience', e.target.value)}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Responsibilities */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Responsibilities
                        </Typography>
                        <Box display="flex" gap={1} mb={2}>
                            <TextField
                                size="small"
                                placeholder="Add responsibility..."
                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const target = e.target as HTMLInputElement;
                                        addArrayItem('responsibilities', target.value);
                                        target.value = '';
                                    }
                                }}
                                disabled={loading}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add responsibility..."]') as HTMLInputElement;
                                    if (input) {
                                        addArrayItem('responsibilities', input.value);
                                        input.value = '';
                                    }
                                }}
                                disabled={loading}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {getArrayItems('responsibilities').map((responsibility, index) => (
                                <Chip
                                    key={index}
                                    label={responsibility}
                                    onDelete={() => removeArrayItem('responsibilities', index)}
                                    disabled={loading}
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Benefits */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Benefits
                        </Typography>
                        <Box display="flex" gap={1} mb={2}>
                            <TextField
                                size="small"
                                placeholder="Add benefit..."
                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const target = e.target as HTMLInputElement;
                                        addArrayItem('benefits', target.value);
                                        target.value = '';
                                    }
                                }}
                                disabled={loading}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add benefit..."]') as HTMLInputElement;
                                    if (input) {
                                        addArrayItem('benefits', input.value);
                                        input.value = '';
                                    }
                                }}
                                disabled={loading}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {getArrayItems('benefits').map((benefit, index) => (
                                <Chip
                                    key={index}
                                    label={benefit}
                                    onDelete={() => removeArrayItem('benefits', index)}
                                    disabled={loading}
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Additional Information */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Additional Information
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Application Deadline"
                            value={formData.applicationDeadline || ''}
                            onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={formData.startDate || ''}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="External Application URL"
                            value={formData.externalUrl || ''}
                            onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                            disabled={loading}
                            placeholder="https://company.com/apply"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Application Instructions"
                            value={formData.applicationInstructions || ''}
                            onChange={(e) => handleInputChange('applicationInstructions', e.target.value)}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Job Settings */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Job Settings
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                    disabled={loading}
                                />
                            }
                            label="Job is active"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isFeatured}
                                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                                    disabled={loading}
                                />
                            }
                            label="Featured job"
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <WorkIcon />}
                >
                    {loading ? 'Saving...' : initialData ? 'Update Job' : 'Create Job'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}