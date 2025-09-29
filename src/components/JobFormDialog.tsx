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
import { jobCreationSchemaWithConditions, jobValidationSchema } from '@/lib/validation/jobAuthSchema';

interface JobFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (formData: any) => Promise<void>;
    initialData?: Job | null;
    companyId?: string; // Add this prop
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
    companyId, // Add this parameter
}: JobFormDialogProps) {
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        company: companyId || '', // Use companyId if provided
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
                    company: companyId || (typeof initialData.company === 'string' ? initialData.company : initialData.company._id),
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
                    },
                    responsibilities: initialData.responsibilities || [],
                    benefits: initialData.benefits || [],
                    applicationDeadline: formatDateForInput(initialData.applicationDeadline || ''),
                    startDate: formatDateForInput(initialData.startDate || ''),
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
                    company: companyId || '', // Use companyId if provided
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
    }, [open, initialData, companyId]);

    const getNestedProperty = (obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const validateField = (name: string, value: any): string => {
        const fieldSchema = getNestedProperty(jobValidationSchema, name);
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

        if (value && fieldSchema.validate && typeof fieldSchema.validate === 'function') {
            const validationResult = fieldSchema.validate(value);
            if (validationResult !== true && typeof validationResult === 'string') {
                return validationResult;
            }
        }

        // Fix: Handle numeric validation properly
        if (value !== null && value !== undefined && value !== '') {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                if (fieldSchema.min && numValue < fieldSchema.min.value) {
                    return fieldSchema.min.message;
                }

                if (fieldSchema.max && numValue > fieldSchema.max.value) {
                    return fieldSchema.max.message;
                }
            }
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

        // Validate optional fields if they have values
        if (formData.externalUrl) {
            const error = validateField('externalUrl', formData.externalUrl);
            if (error) newErrors.externalUrl = error;
        }

        if (formData.applicationInstructions) {
            const error = validateField('applicationInstructions', formData.applicationInstructions);
            if (error) newErrors.applicationInstructions = error;
        }

        if (formData.applicationDeadline) {
            const error = validateField('applicationDeadline', formData.applicationDeadline);
            if (error) newErrors.applicationDeadline = error;
        }

        if (formData.startDate) {
            const error = validateField('startDate', formData.startDate);
            if (error) newErrors.startDate = error;
            if (formData.applicationDeadline) {
                if (formData.startDate <= formData.applicationDeadline) {
                    newErrors.startDate = 'Start date cannot be earlier than application deadline'
                }

            }
        }



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Update the formatDateForInput function to handle more cases
    const formatDateForInput = (date: string | Date | null | undefined) => {
        if (!date) return "";

        // If it's already in yyyy-mm-dd format, return as is
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }

        // If it's in dd-mm-yyyy format, convert it
        if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
            const [day, month, year] = date.split('-');
            return `${year}-${month}-${day}`;
        }

        // For other formats, try to parse as Date
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return "";
        }

        return d.toISOString().split("T")[0]; // yyyy-MM-dd
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

    // Add this helper function to ensure dates are in correct format
    const ensureDateFormat = (date: string | undefined): string | undefined => {
        if (!date) return undefined;

        // If it's already in yyyy-mm-dd format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }

        // If it's in dd-mm-yyyy format, convert it
        if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
            const [day, month, year] = date.split('-');
            return `${year}-${month}-${day}`;
        }

        // For other formats, try to parse as Date and convert
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return undefined;
        }

        return d.toISOString().split("T")[0];
    };



    const handleSubmit = async () => {
        setSubmitError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // For editing jobs, send as regular object with proper nested structure
            if (initialData) {
                const jobData = {
                    title: formData.title,
                    description: formData.description,
                    company: formData.company,
                    jobType: formData.jobType,
                    experienceLevel: formData.experienceLevel,
                    isActive: formData.isActive,
                    isFeatured: formData.isFeatured,
                    // Ensure location object is properly structured
                    location: {
                        type: formData.location.type,
                        address: formData.location.address || '',
                        city: formData.location.city || '',
                        state: formData.location.state || '',
                        country: formData.location.country || '',
                        zipCode: formData.location.zipCode || ''
                    },
                    // Ensure salary object is properly structured
                    salary: {
                        min: formData.salary?.min || undefined,
                        max: formData.salary?.max || undefined,
                        currency: formData.salary?.currency || 'USD',
                        period: formData.salary?.period || 'yearly',
                        isNegotiable: formData.salary?.isNegotiable || false
                    },
                    // Ensure requirements object is properly structured
                    requirements: {
                        skills: formData.requirements?.skills || [],
                        education: formData.requirements?.education || '',
                        experience: formData.requirements?.experience || '',
                        certifications: formData.requirements?.certifications || []
                    },
                    responsibilities: formData.responsibilities || [],
                    benefits: formData.benefits || [],
                    tags: formData.tags || [],
                    // Ensure dates are in correct format
                    applicationDeadline: ensureDateFormat(formData.applicationDeadline),
                    startDate: ensureDateFormat(formData.startDate),
                    externalUrl: formData.externalUrl || undefined,
                    applicationInstructions: formData.applicationInstructions || undefined,
                };

                console.log('Sending job data for update:', jobData);
                await onSave(jobData);
            } else {
                // For creating jobs, send as FormData (existing logic)
                const submitData = new FormData();

                // Add form fields in the format expected by your backend
                submitData.append('title', formData.title);
                submitData.append('description', formData.description);
                submitData.append('company', formData.company);
                submitData.append('jobType', formData.jobType);
                submitData.append('experienceLevel', formData.experienceLevel);
                submitData.append('isActive', formData.isActive?.toString() || 'true');
                submitData.append('isFeatured', formData.isFeatured?.toString() || 'false');

                // Add date fields with proper formatting
                const formattedApplicationDeadline = ensureDateFormat(formData.applicationDeadline);
                if (formattedApplicationDeadline) {
                    submitData.append('applicationDeadline', formattedApplicationDeadline);
                }

                const formattedStartDate = ensureDateFormat(formData.startDate);
                if (formattedStartDate) {
                    submitData.append('startDate', formattedStartDate);
                }

                if (formData.externalUrl) {
                    submitData.append('externalUrl', formData.externalUrl);
                }

                if (formData.applicationInstructions) {
                    submitData.append('applicationInstructions', formData.applicationInstructions);
                }

                // Add location fields
                submitData.append('location.type', formData.location.type);

                if (formData.location.address) {
                    submitData.append('location.address', formData.location.address);
                }
                if (formData.location.city) {
                    submitData.append('location.city', formData.location.city);
                }
                if (formData.location.state) {
                    submitData.append('location.state', formData.location.state);
                }
                if (formData.location.country) {
                    submitData.append('location.country', formData.location.country);
                }
                if (formData.location.zipCode) {
                    submitData.append('location.zipCode', formData.location.zipCode);
                }

                // Add salary fields - only if they have valid positive values
                if (formData.salary?.min !== undefined && formData.salary?.min >= 0) {
                    submitData.append('salary.min', formData.salary.min.toString());
                }
                if (formData.salary?.max !== undefined && formData.salary?.max >= 0) {
                    submitData.append('salary.max', formData.salary.max.toString());
                }
                if (formData.salary?.currency) {
                    submitData.append('salary.currency', formData.salary.currency);
                }
                if (formData.salary?.period) {
                    submitData.append('salary.period', formData.salary.period);
                }
                if (formData.salary?.isNegotiable !== undefined) {
                    submitData.append('salary.isNegotiable', formData.salary.isNegotiable.toString());
                }

                // Add requirements fields
                if (formData.requirements?.education) {
                    submitData.append('requirements.education', formData.requirements.education);
                }
                if (formData.requirements?.experience) {
                    submitData.append('requirements.experience', formData.requirements.experience);
                }

                // Add arrays
                const skills = formData.requirements?.skills || [];
                skills.forEach((skill, index) => {
                    submitData.append(`requirements.skills[${index}]`, skill);
                });

                const certifications = formData.requirements?.certifications || [];
                certifications.forEach((cert, index) => {
                    submitData.append(`requirements.certifications[${index}]`, cert);
                });

                const responsibilities = formData.responsibilities || [];
                responsibilities.forEach((responsibility, index) => {
                    submitData.append(`responsibilities[${index}]`, responsibility);
                });

                const benefits = formData.benefits || [];
                benefits.forEach((benefit, index) => {
                    submitData.append(`benefits[${index}]`, benefit);
                });

                const tags = formData.tags || [];
                tags.forEach((tag, index) => {
                    submitData.append(`tags[${index}]`, tag);
                });

                await onSave(submitData);
            }

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
                            onChange={(e) => {
                                const value = e.target.value;
                                // Only allow positive numbers or empty string
                                if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
                                    handleInputChange('salary.min', value ? Number(value) : undefined);
                                }
                            }}
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
                            onChange={(e) => {
                                const value = e.target.value;
                                // Only allow positive numbers or empty string
                                if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
                                    handleInputChange('salary.max', value ? Number(value) : undefined);
                                }
                            }}
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
                                        if (target.value.trim()) {
                                            addArrayItem('requirements.skills', target.value);
                                            target.value = '';
                                        }
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
                                    if (input && input.value.trim()) {
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
                            type="date"
                            label="Application Deadline"
                            value={formatDateForInput(formData.applicationDeadline)}
                            onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                            error={!!errors['applicationDeadline']}
                            helperText={errors['applicationDeadline']}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={formatDateForInput(formData.startDate)}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                            error={!!errors['startDate']}
                            helperText={errors['startDate']}
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
                            error={!!errors['externalUrl']}
                            helperText={errors['externalUrl']}
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