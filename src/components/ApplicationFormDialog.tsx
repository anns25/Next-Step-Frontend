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
import { CheckCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [generalError, setGeneralError] = useState("");
    const [alreadyApplied, setAlreadyApplied] = useState(false);
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
        setAlreadyApplied(false);

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
        } catch (error: unknown) {
            // Type guard to check if error is an object with expected properties
            const isAxiosError = (err: unknown): err is {
                response?: {
                    data?: {
                        message?: string;
                        errors?: Record<string, string>;
                        [key: string]: unknown;
                    };
                    status?: number;
                    statusText?: string;
                };
                message?: string;
            } => {
                return typeof err === 'object' && err !== null;
            };

            if (!isAxiosError(error)) {
                setGeneralError("An unexpected error occurred. Please try again.");
                return;
            }

            // Get the error message from various possible locations
            const responseData = error?.response?.data;
            // Extract backend message as string
            let backendMessage = '';
            if (typeof responseData === 'string') {
                backendMessage = responseData;
            } else if (responseData?.message && typeof responseData.message === 'string') {
                backendMessage = responseData.message;
            }
            const errorMessage = error?.message?.toLowerCase() || '';
            const backendMessageLower = backendMessage.toLowerCase();
            if (
                backendMessageLower.includes('already applied') ||
                errorMessage.includes('already applied') ||
                backendMessageLower.includes('duplicate') ||
                error?.response?.status === 400
            ) {
                setGeneralError("");
                setAlreadyApplied(true);
            }
            else if (error?.response?.status === 401) {
                setGeneralError("You must be logged in to apply for jobs");
            } else if (error?.response?.status === 404) {
                setGeneralError("Job not found or no longer available");
            } else {
                setGeneralError(
                    backendMessage ||
                    error?.message ||
                    "Failed to submit application. Please try again."
                );
            }
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
                    borderRadius: { xs: 0, sm: 3 },
                    maxHeight: "90vh",
                    width: { xs: '100%', sm: 'auto' },
                    height: { xs: '100%', sm: 'auto' }
                }
            }}
        >
            <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, minWidth: 0 }}>
                        <WorkIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                            Apply for Position
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose} disabled={loading} sx={{ ml: 1, flexShrink: 0 }}>
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
                {/* User-friendly duplicate application alert */}
                {alreadyApplied && (
                    <Alert

                        severity="info"
                        icon={<CheckCircleIcon />}
                        sx={{
                            mb: 2,
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderLeft: '4px solid #2196f3',
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            You&apos;ve Already Applied! 🎉
                        </Typography>
                        <Typography variant="body2">
                            Good news! You&apos;e already submitted an application for this position.
                            The employer has received your information and will review it soon.
                            You can track your application status in your dashboard.
                        </Typography>
                        <Box sx={{
                            mt: 1.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 1
                        }}>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => router.push('/user/applications')}
                                sx={{
                                    mr: { xs: 0, sm: 1 },
                                    width: { xs: '100%', sm: 'auto' }
                                }}
                            >
                                View My Applications
                            </Button>
                            <Button
                                size="small"
                                onClick={handleClose}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                                Close
                            </Button>
                        </Box>
                    </Alert>
                )}

                {generalError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {generalError}
                    </Alert>
                )}

                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {/* Job Information */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                            Job Information
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                mb: 3,
                                borderRadius: 2,
                                background: "rgba(25, 118, 210, 0.05)",
                                border: "1px solid rgba(25, 118, 210, 0.1)",
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    color: theme.palette.primary.main,
                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                    wordBreak: 'break-word'
                                }}>
                                {job.title}
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: "row" }} spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
                                <Chip
                                    icon={<BusinessIcon />}
                                    label={getCompanyName(job.company)}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        width: { xs: 'fit-content', sm: 'auto' },
                                        '& .MuiChip-label': {
                                            fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                                        }
                                    }}
                                />
                                <Chip
                                    icon={<WorkIcon />}
                                    label={`${job.jobType} • ${job.experienceLevel}`}
                                    color="secondary"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        width: { xs: 'fit-content', sm: 'auto' },
                                        '& .MuiChip-label': {
                                            fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                                        }
                                    }}
                                />
                                <Chip
                                    icon={<LocationIcon />}
                                    label={formatLocation(job.location)}
                                    color="default"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        width: { xs: 'fit-content', sm: 'auto' },
                                        '& .MuiChip-label': {
                                            fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                                        }
                                    }}
                                />
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
                            >
                                💰 {formatSalary(job.salary)}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Application Form */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                            Application Details
                        </Typography>
                    </Grid>

                    {/* Resume Upload */}
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth error={!!fieldErrors.resume}>
                            <FormLabel component="legend" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
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
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: { xs: 1, sm: 0 }
                                    }}
                                >
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        flex: 1,
                                        minWidth: 0
                                    }}>
                                        <AttachFileIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {resumeFile.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' } }}>
                                                {(resumeFile.size / 1024).toFixed(2)} KB
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton
                                        onClick={handleRemoveFile}
                                        color="error"
                                        size="small"
                                        disabled={loading}
                                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Paper>
                            ) : (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<AttachFileIcon />}
                                    sx={{
                                        width: "100%",
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        py: { xs: 1, sm: 1.5 }
                                    }}
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
                                <FormHelperText sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}>
                                    {fieldErrors.resume}
                                </FormHelperText>
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
                            rows={4}
                            error={!!fieldErrors.coverLetter}
                            helperText={fieldErrors.coverLetter || `${formData.coverLetter?.length || 0}/2000 characters`}
                            fullWidth
                            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                            disabled={loading}
                            sx={{
                                '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                },
                                '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.75rem', sm: '0.75rem' }
                                },
                                '& .MuiInputBase-root': {
                                    minHeight: { xs: '120px', sm: '150px' }
                                }
                            }}
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
                            sx={{
                                '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                },
                                '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.75rem', sm: '0.75rem' }
                                },
                                '& .MuiInputBase-root': {
                                    minHeight: { xs: '90px', sm: '120px' }
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{
                p: { xs: 2, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
            }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    sx={{
                        width: { xs: '100%', sm: 'auto' },
                        order: { xs: 2, sm: 1 }
                    }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={loading || !resumeFile}
                    startIcon={loading ? <CircularProgress size={20} /> : <WorkIcon />}
                    sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        order: { xs: 1, sm: 2 }
                    }}
                >
                    {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApplicationFormDialog;