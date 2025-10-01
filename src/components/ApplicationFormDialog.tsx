"use client";

import React, { useState } from "react";
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
import { ApplicationFormData, Job } from "@/types/Job";
import { ApplicationApi } from "@/lib/api/applicationAPI";

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
    const [formData, setFormData] = useState<ApplicationFormData>({
        jobId: job?._id || "",
        coverLetter: "",
        notes: "",
        resume: undefined,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (field: keyof ApplicationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, resume: "Please select a PDF or DOC file" }));
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, resume: "File size must be less than 10MB" }));
                return;
            }

            handleChange("resume", file);
            setErrors(prev => ({ ...prev, resume: "" }));
        }
    };

    const handleRemoveFile = () => {
        handleChange("resume", null);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.jobId) {
            newErrors.jobId = "Job ID is required";
        }

        if (!formData.resume) {
            newErrors.resume = "Resume file is required";
        }
        if (formData.coverLetter) {
            if (formData.coverLetter.length > 2000) {
                newErrors.coverLetter = "Cover letter cannot exceed 2000 characters";
            }
        }
        if (formData.notes && formData.notes.length > 500) {
            newErrors.notes = "Notes cannot exceed 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append("jobId", formData.jobId);
            submitData.append("coverLetter", formData.coverLetter || '');
            submitData.append("notes", formData.notes || '');
            if (formData.resume) {
                submitData.append("resume", formData.resume);
            }

            await ApplicationApi.createApplication(submitData);

            setSuccessMessage("Application submitted successfully!");
            setTimeout(() => {
                setSuccessMessage("");
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    jobId: "",
                    coverLetter: "",
                    notes: "",
                    resume: undefined,
                });
            }, 2000);
        } catch (error) {
            console.error("Application submission failed:", error);
            setErrors({ general: error instanceof Error ? error.message : "Failed to submit application" });
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

    if (!job) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: "90vh",
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: "white",
                    px: 3,
                    py: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Apply for Position
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{ color: "white" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                {successMessage && (
                    <Alert severity="success" sx={{ m: 3, mb: 0 }}>
                        {successMessage}
                    </Alert>
                )}

                {errors.general && (
                    <Alert severity="error" sx={{ m: 3, mb: 0 }}>
                        {errors.general}
                    </Alert>
                )}

                <Box sx={{ p: 3 }}>
                    {/* Job Information */}
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

                    {/* Application Form */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* Resume Upload */}
                        <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Resume *
                            </Typography>
                            {formData.resume ? (
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
                                                {formData.resume.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {(formData.resume.size / 1024).toFixed(2)} KB
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={handleRemoveFile} color="error" size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                </Paper>
                            ) : (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<AttachFileIcon />}
                                    sx={{ width: "100%" }}
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
                            {errors.resume && (
                                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                                    {errors.resume}
                                </Typography>
                            )}
                        </Box>

                        {/* Cover Letter */}
                        <TextField
                            label="Cover Letter"
                            multiline
                            rows={6}
                            value={formData.coverLetter}
                            onChange={(e) => handleChange("coverLetter", e.target.value)}
                            error={!!errors.coverLetter}
                            helperText={errors.coverLetter || `${formData.coverLetter?.length}/2000 characters`}
                            fullWidth
                            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                        />

                        {/* Notes */}
                        <TextField
                            label="Additional Notes (Optional)"
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            error={!!errors.notes}
                            helperText={errors.notes || `${formData.notes?.length}/500 characters`}
                            fullWidth
                            placeholder="Any additional information you'd like to share..."
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.text.secondary,
                        "&:hover": {
                            backgroundColor: theme.palette.text.secondary,
                            color: "white",
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        "&:hover": {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        },
                    }}
                >
                    {loading ? "Submitting..." : "Submit Application"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApplicationFormDialog;