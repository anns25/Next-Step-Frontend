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
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Company, CompanyFormData } from '@/types/Company';
import { companyValidationSchema } from '@/lib/validation/companyAuthSchema';

interface CompanyFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  initialData?: Company | null;
}

interface ValidationRule {
  value: number | RegExp;
  message: string;
}

interface FieldValidationSchema {
  required?: string;
  minLength?: ValidationRule;
  maxLength?: ValidationRule;
  pattern?: ValidationRule;
  min?: ValidationRule;
  max?: ValidationRule;
}

const isFieldValidationSchema = (value: unknown): value is FieldValidationSchema => {
  return value !== null && typeof value === 'object';
};

const industries = [
  'Technology',
  'Healthcare',
  'Construction',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media',
  'Real Estate',
  'Other',
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'error' },
  { value: 'suspended', label: 'Suspended', color: 'warning' },
];

export default function CompanyFormDialog({
  open,
  onClose,
  onSave,
  initialData,
}: CompanyFormDialogProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    website: '',
    industry: '',
    location: {
      city: '',
      country: '',
      address: '',
      state: '',
      zipCode: '',
    },
    contact: {
      email: '',
      phone: '',
      linkedin: '',
      twitter: '',
    },
    benefits: [],
    culture: [],
    foundedYear: undefined,
    isRemoteFriendly: false,
    canPostJobs: true,
    maxJobs: 50,
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          website: initialData.website || '',
          industry: initialData.industry || '',
          location: {
            city: initialData.location?.city || '',
            country: initialData.location?.country || '',
            address: initialData.location?.address || '',
            state: initialData.location?.state || '',
            zipCode: initialData.location?.zipCode || '',
          },
          contact: {
            email: initialData.contact?.email || '',
            phone: initialData.contact?.phone || '',
            linkedin: initialData.contact?.linkedin || '',
            twitter: initialData.contact?.twitter || '',
          },
          benefits: initialData.benefits || [],
          culture: initialData.culture || [],
          foundedYear: initialData.foundedYear,
          isRemoteFriendly: initialData.isRemoteFriendly || false,
          canPostJobs: initialData.canPostJobs !== false,
          maxJobs: initialData.maxJobs || 50,
          status: initialData.status || 'active',
        });
        setLogoPreview(initialData.logo ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${initialData.logo}` : '');
      } else {
        // Reset form for new company
        setFormData({
          name: '',
          description: '',
          website: '',
          industry: '',
          location: {
            city: '',
            country: '',
            address: '',
            state: '',
            zipCode: '',
          },
          contact: {
            email: '',
            phone: '',
            linkedin: '',
            twitter: '',
          },
          benefits: [],
          culture: [],
          foundedYear: undefined,
          isRemoteFriendly: false,
          canPostJobs: true,
          maxJobs: 50,
          status: 'active',
        });
        setLogoPreview('');
        setLogoFile(null);
      }
      setErrors({});
      setSubmitError('');
    }
  }, [open, initialData]);


  const getNestedProperty = (obj: object, path: string): unknown => {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj as unknown);
  };


  const validateField = (name: string, value: unknown): string => {
    const fieldSchema = getNestedProperty(companyValidationSchema, name);

    if (!isFieldValidationSchema(fieldSchema)) return '';

    const stringValue = typeof value === 'string' ? value : String(value || '');

    if (fieldSchema.required && (!value || stringValue.trim() === '')) {
      return fieldSchema.required;
    }

    if (value && fieldSchema.minLength) {
      const valueLength = typeof value === 'string' ? value.length : stringValue.length;
      if (valueLength < (fieldSchema.minLength.value as number)) {
        return fieldSchema.minLength.message;
      }
    }

    if (value && fieldSchema.maxLength) {
      const valueLength = typeof value === 'string' ? value.length : stringValue.length;
      if (valueLength > (fieldSchema.maxLength.value as number)) {
        return fieldSchema.maxLength.message;
      }
    }

    if (value && fieldSchema.pattern) {
      const regex = fieldSchema.pattern.value;
      if (regex instanceof RegExp && !regex.test(stringValue)) {
        return fieldSchema.pattern.message;
      }
    }

    if (value && fieldSchema.min) {
      const minValue = fieldSchema.min.value;
      if (typeof minValue === 'number' && Number(value) < minValue) {
        return fieldSchema.min.message;
      }
    }

    if (value && fieldSchema.max) {
      const maxValue = fieldSchema.max.value;
      if (typeof maxValue === 'number' && Number(value) > maxValue) {
        return fieldSchema.max.message;
      }
    }

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    const requiredFields = [
      'name',
      'description',
      'industry',
      'location.city',
      'location.country',
      'contact.email',
    ];

    requiredFields.forEach(field => {
      const value = getNestedProperty(formData, field);
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate optional fields if they have values
    if (formData.website) {
      const error = validateField('website', formData.website);
      if (error) newErrors.website = error;
    }

    if (formData.foundedYear) {
      const error = validateField('foundedYear', formData.foundedYear);
      if (error) newErrors.foundedYear = error;
    }

    if (formData.maxJobs) {
      const error = validateField('maxJobs', formData.maxJobs);
      if (error) newErrors.maxJobs = error;
    }

    if (formData.contact.phone) {
      const error = validateField('contact.phone', formData.contact.phone);
      if (error) newErrors["contact.phone"] = error;
    }

    if (formData.contact.linkedin) {
      const error = validateField('contact.linkedin', formData.contact.linkedin);
      if (error) newErrors["contact.linkedin"] = error;
    }

    if (formData.contact.twitter) {
      const error = validateField('contact.twitter', formData.contact.twitter);
      if (error) newErrors["contact.twitter"] = error;
    }

    if (formData.status) {
      const error = validateField('status', formData.status);
      if (error) newErrors.status = error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Replace the handleInputChange function with this improved version:

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev };

      // Handle nested object updates safely
      if (field.includes('.')) {
        const keys = field.split('.');
        let current: Record<string, unknown> = newData as unknown as Record<string, unknown>;

        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]] as Record<string, unknown>;
        }

        // Set the final value
        current[keys[keys.length - 1]] = value;
      } else {
        // Handle top-level properties
        (newData as unknown as Record<string, unknown>)[field] = value;
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

  // Also update the addArrayItem and removeArrayItem functions to be more type-safe:

  const addArrayItem = (field: 'benefits' | 'culture', value: string) => {
    if (value.trim()) {
      setFormData(prev => {
        const currentArray = prev[field] || [];
        return {
          ...prev,
          [field]: [...currentArray, value.trim()]
        };
      });
    }
  };

  const removeArrayItem = (field: 'benefits' | 'culture', index: number) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      };
    });
  };



  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image file size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setSubmitError('');
    }
  };

  const handleSubmit = async () => {
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();

      // Add form fields in the format expected by your backend
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('industry', formData.industry);
      submitData.append('status', formData.status || 'active');

      // Add optional fields only if they have values
      if (formData.website) {
        submitData.append('website', formData.website);
      }

      if (formData.foundedYear) {
        submitData.append('foundedYear', formData.foundedYear.toString());
      }

      if (formData.maxJobs) {
        submitData.append('maxJobs', formData.maxJobs.toString());
      }

      submitData.append('isRemoteFriendly', formData.isRemoteFriendly?.toString() || 'false');
      submitData.append('canPostJobs', formData.canPostJobs?.toString() || 'true');

      // Add location fields
      submitData.append('location.city', formData.location.city);
      submitData.append('location.country', formData.location.country);

      if (formData.location.address) {
        submitData.append('location.address', formData.location.address);
      }
      if (formData.location.state) {
        submitData.append('location.state', formData.location.state);
      }
      if (formData.location.zipCode) {
        submitData.append('location.zipCode', formData.location.zipCode);
      }

      // Add contact fields

      submitData.append('contact.email', formData.contact.email);

      if (formData.contact.phone) {
        submitData.append('contact.phone', formData.contact.phone);
      }
      if (formData.contact.linkedin) {
        submitData.append('contact.linkedin', formData.contact.linkedin);
      }
      if (formData.contact.twitter) {
        submitData.append('contact.twitter', formData.contact.twitter);
      }

      // Add arrays - fix the undefined issue
      const benefits = formData.benefits || [];
      benefits.forEach((benefit, index) => {
        submitData.append(`benefits[${index}]`, benefit);
      });

      const culture = formData.culture || [];
      culture.forEach((cultureItem, index) => {
        submitData.append(`culture[${index}]`, cultureItem);
      });

      // Add logo file if selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      await onSave(submitData);
      onClose();
    } catch (error: unknown) {
      console.error('Error saving company:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to save company. Please try again.';
      setSubmitError(errorMessage);
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
  const getArrayItems = (field: 'benefits' | 'culture'): string[] => {
    return formData[field] || [];
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
            <BusinessIcon />
            <Typography variant="h6">
              {initialData ? 'Edit Company' : 'Add New Company'}
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
          {/* Company Logo */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={2}>
              {logoPreview && (
                <Box
                  component="img"
                  src={logoPreview}
                  alt="Logo preview"
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #ddd',
                  }}
                />
              )}
              <Button
                variant="outlined"
                component="label"
                disabled={loading}
                startIcon={<BusinessIcon />}
              >
                {logoPreview ? 'Change Logo' : 'Upload Logo'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Button>
              {logoPreview && (
                <Button
                  variant="text"
                  color="error"
                  onClick={() => {
                    setLogoPreview('');
                    setLogoFile(null);
                  }}
                  disabled={loading}
                >
                  Remove
                </Button>
              )}
            </Box>
          </Grid>

          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth error={!!errors.industry} required>
              <InputLabel>Industry</InputLabel>
              <Select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                label="Industry"
                disabled={loading}
              >
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.industry && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.industry}
              </Typography>
            )}
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
            <TextField
              fullWidth
              label="Website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              error={!!errors.website}
              helperText={errors.website}
              disabled={loading}
              placeholder="https://example.com"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Founded Year"
              value={formData.foundedYear || ''}
              onChange={(e) => handleInputChange('foundedYear', e.target.value ? parseInt(e.target.value) : undefined)}
              error={!!errors.foundedYear}
              helperText={errors.foundedYear}
              disabled={loading}
              inputProps={{ min: 1800, max: new Date().getFullYear() }}
            />
          </Grid>

          {/* Location Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
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
              label="City"
              value={formData.location.city}
              onChange={(e) => handleInputChange('location.city', e.target.value)}
              error={!!errors['location.city']}
              helperText={errors['location.city']}
              disabled={loading}
              required
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
              label="Country"
              value={formData.location.country}
              onChange={(e) => handleInputChange('location.country', e.target.value)}
              error={!!errors['location.country']}
              helperText={errors['location.country']}
              disabled={loading}
              required
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

          {/* Contact Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="email"
              label="Contact Email"
              value={formData.contact.email}
              onChange={(e) => handleInputChange('contact.email', e.target.value)}
              error={!!errors['contact.email']}
              helperText={errors['contact.email']}
              disabled={loading}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.contact.phone}
              onChange={(e) => handleInputChange('contact.phone', e.target.value)}
              error={!!errors["contact.phone"]}
              helperText={errors["contact.phone"]}
              disabled={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="LinkedIn"
              value={formData.contact.linkedin}
              onChange={(e) => handleInputChange('contact.linkedin', e.target.value)}
              disabled={loading}
              placeholder="https://linkedin.com/company/..."
              error={!!errors["contact.linkedin"]}
              helperText={errors["contact.linkedin"]}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Twitter"
              value={formData.contact.twitter}
              onChange={(e) => handleInputChange('contact.twitter', e.target.value)}
              disabled={loading}
              placeholder="https://twitter.com/company/..."
              error={!!errors["contact.twitter"]}
              helperText={errors["contact.twitter"]}
            />
          </Grid>

          {/* Company Settings */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Company Settings
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label="Status"
                disabled={loading}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Chip label={option.label} color={option.color as 'success' | 'error' | 'warning'} size="small" />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Max Jobs"
              value={formData.maxJobs}
              onChange={(e) => handleInputChange('maxJobs', parseInt(e.target.value) || 50)}
              error={!!errors.maxJobs}
              helperText={errors.maxJobs}
              disabled={loading}
              inputProps={{ min: 1, max: 1000 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" flexDirection="column" gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRemoteFriendly}
                    onChange={(e) => handleInputChange('isRemoteFriendly', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Remote Friendly"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.canPostJobs}
                    onChange={(e) => handleInputChange('canPostJobs', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Can Post Jobs"
              />
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

          {/* Culture */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Company Culture
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                size="small"
                placeholder="Add culture value..."
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    addArrayItem('culture', target.value);
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
                  const input = document.querySelector('input[placeholder="Add culture value..."]') as HTMLInputElement;
                  if (input) {
                    addArrayItem('culture', input.value);
                    input.value = '';
                  }
                }}
                disabled={loading}
              >
                Add
              </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {getArrayItems('culture').map((culture, index) => (
                <Chip
                  key={index}
                  label={culture}
                  onDelete={() => removeArrayItem('culture', index)}
                  disabled={loading}
                />
              ))}
            </Box>
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
          startIcon={loading ? <CircularProgress size={20} /> : <BusinessIcon />}
        >
          {loading ? 'Saving...' : initialData ? 'Update Company' : 'Create Company'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}