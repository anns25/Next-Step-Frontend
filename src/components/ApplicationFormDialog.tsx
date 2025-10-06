"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    IconButton,
    Paper,
    Chip,
    Stack,
    Grid,
    FormControl,
    FormLabel,
    FormHelperText,
} from "@mui/material";
import {
    Close as CloseIcon,
    AttachFile as AttachFileIcon,
    Delete as DeleteIcon,
    Work as WorkIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { parse, ValiError } from 'valibot';
import { ApplicationFormData, Job } from "@/types/Job";
import { applicationCreationSchema } from "@/lib/validation/applicationAuthSchema";
import { createApplication } from "@/lib/api/applicationAPI";

interface Props {
    open: boolean;
    onClose: () => void;
    job: Job | null;
    onSuccess: () => void;
}

const ApplicationFormDialog: React.FC<Props> = ({
    open,
    onClose,
    job,
    onSuccess,
}) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [generalError, setGeneralError] = useState("");
    const [formData, setFormData] = useState<ApplicationFormData>({
        jobId: job?._id || "",
        coverLetter: "",
        notes: "",
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Initialize form data when dialog opens
    useEffect(() => {
        if (open) {
            setFormData({
                jobId: job?._id || "",
                coverLetter: "",
                notes: "",
            });
            setResumeFile(null);
            setFieldErrors({});
            setGeneralError("");
            setSuccessMessage("");
        }
    }, [open, job]);

    const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: "" }));
        }
        if (generalError) {
            setGeneralError("");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResumeFile(file);
            // Clear resume error when user selects a file
            if (fieldErrors.resume) {
                setFieldErrors(prev => ({ ...prev, resume: "" }));
            }
            if (generalError) {
                setGeneralError("");
            }
        }
    };

    const handleRemoveFile = () => {
        setResumeFile(null);
        if (fieldErrors.resume) {
            setFieldErrors(prev => ({ ...prev, resume: "" }));
        }
    };

    const validateForm = (): boolean => {
        try {
            const dataToValidate = { 
                ...formData, 
                resume: resumeFile 
            };
            parse(applicationCreationSchema, dataToValidate);
            setFieldErrors({});
            return true;
        } catch (error) {
            if (error instanceof ValiError) {
                const errors: Record<string, string> = {};
                error.issues.forEach(issue => {
                    if (issue.path) {
                        const fieldName = issue.path[0].key as string;
                        errors[fieldName] = issue.message;
                    }
                });
                setFieldErrors(errors);
            }
            return false;
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError("");
        
        try {
            // Validate the form data with valibot
            if (!validateForm()) {
                setGeneralError("Please fix the validation errors below");
                return;
            }

            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append("jobId", formData.jobId);
            formDataToSend.append("coverLetter", formData.coverLetter || '');
            formDataToSend.append("notes", formData.notes || '');
            if (resumeFile) {
                formDataToSend.append("resume", resumeFile);
            }

            await createApplication(formDataToSend);

            setSuccessMessage("Application submitted successfully!");
            setTimeout(() => {
                setSuccessMessage("");
                onSuccess();
                onClose();
                // Reset form
                setFormData({ jobId: job?._id || "", coverLetter: "", notes: "" });
                setResumeFile(null);
                setFieldErrors({});
            }, 2000);
        } catch (error) {
            console.error("Application submission failed:", error);
            setGeneralError(error instanceof Error ? error.message : "Failed to submit application");
        } finally {
            setLoading(false);
        }
    };

    const formatSalary = (salary?: Job["salary"]) => {
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

    const getCompanyName = (company: Job["company"]) => {
        if (typeof company === "string") {
            return "Company"; // Fallback if company is just an ID
        }
        return company?.name || "Company";
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!job) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            fullScreen={window.innerWidth < 768}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: "90vh",
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <WorkIcon />
                        <Typography variant="h6">
                            Apply for Position
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose} disabled={loading}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                {generalError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {generalError}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Job Information */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Job Information
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: 2,
                                background: "rgba(25, 118, 210, 0.05)",
                                border: "1px solid rgba(25, 118, 210, 0.1)",
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                {job.title}
                            </Typography>

                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                <Chip
                                    icon={<BusinessIcon />}
                                    label={getCompanyName(job.company)}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                />
                                <Chip
                                    icon={<WorkIcon />}
                                    label={`${job.jobType} • ${job.experienceLevel}`}
                                    color="secondary"
                                    variant="outlined"
                                    size="small"
                                />
                                <Chip
                                    icon={<LocationIcon />}
                                    label={formatLocation(job.location)}
                                    color="default"
                                    variant="outlined"
                                    size="small"
                                />
                            </Stack>

                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                💰 {formatSalary(job.salary)}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Application Form */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            Application Details
                        </Typography>
                    </Grid>

                    {/* Resume Upload */}
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth error={!!fieldErrors.resume}>
                            <FormLabel component="legend" sx={{ mb: 1 }}>
                                Resume *
                            </FormLabel>
                            {resumeFile ? (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        border: "1px solid #ddd",
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <AttachFileIcon color="primary" />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {resumeFile.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {(resumeFile.size / 1024).toFixed(2)} KB
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton 
                                        onClick={handleRemoveFile} 
                                        color="error" 
                                        size="small"
                                        disabled={loading}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Paper>
                            ) : (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<AttachFileIcon />}
                                    sx={{ width: "100%" }}
                                    disabled={loading}
                                >
                                    Upload Resume (PDF, DOC, DOCX)
                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                            )}
                            {fieldErrors.resume && (
                                <FormHelperText>{fieldErrors.resume}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    {/* Cover Letter */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            value={formData.coverLetter}
                            onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                            label="Cover Letter"
                            multiline
                            rows={6}
                            error={!!fieldErrors.coverLetter}
                            helperText={fieldErrors.coverLetter || `${formData.coverLetter?.length || 0}/2000 characters`}
                            fullWidth
                            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                            disabled={loading}
                        />
                    </Grid>

                    {/* Notes */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            label="Additional Notes (Optional)"
                            multiline
                            rows={3}
                            error={!!fieldErrors.notes}
                            helperText={fieldErrors.notes || `${formData.notes?.length || 0}/500 characters`}
                            fullWidth
                            placeholder="Any additional information you'd like to share..."
                            disabled={loading}
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
                    onClick={onSubmit}
                    disabled={loading || !resumeFile}
                    startIcon={loading ? <CircularProgress size={20} /> : <WorkIcon />}
                >
                    {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApplicationFormDialog;