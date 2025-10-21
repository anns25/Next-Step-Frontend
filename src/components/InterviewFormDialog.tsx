"use client";

import React, { useState, useEffect } from "react";
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
    IconButton,
    CircularProgress,
    Autocomplete,
    Alert,
    FormHelperText,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Interview, CreateInterviewData } from "@/types/Interview";
import { createInterviewAdmin, updateInterviewAdmin } from "@/lib/api/interviewAPI";
import { getUserApplications } from "@/lib/api/applicationAPI";
import { Application } from "@/types/Application";
import { getAllUsersByAdmin, getUserApplicationsByAdmin } from "@/lib/api/adminAPI";
import { User } from "@/types/User";
import { AxiosError } from "axios";
import { safeParse } from "valibot";
import { createInterviewSchema } from "@/lib/validation/interviewSchema";

interface Props {
    open: boolean;
    onClose: () => void;
    interview?: Interview | null;
    onSuccess: () => void;
}

const AdminInterviewFormDialog: React.FC<Props> = ({ open, onClose, interview, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        userId: "",
        applicationId: "",
        type: "video" as Interview["type"],
        round: 1,
        scheduledDate: "",
        duration: 60,
        locationType: "remote" as "office" | "remote" | "phone",
        address: "",
        meetingLink: "",
        phoneNumber: "",
        nextSteps: "",
    });
    const [interviewers, setInterviewers] = useState<
        Array<{ name: string; email: string; title: string; linkedin: string }>
    >([{ name: "", email: "", title: "", linkedin: "" }]);

    useEffect(() => {
        if (open) {
            fetchUsers();
            if (interview) {
                // Edit mode
                setFormData({
                    userId: interview.user._id,
                    applicationId: interview.application._id,
                    type: interview.type,
                    round: interview.round,
                    scheduledDate: new Date(interview.scheduledDate).toISOString().slice(0, 16),
                    duration: interview.duration,
                    locationType: interview.location.type,
                    address: interview.location.address || "",
                    meetingLink: interview.location.meetingLink || "",
                    phoneNumber: interview.location.phoneNumber || "",
                    nextSteps: interview.nextSteps || "",
                });
                if (interview.interviewers.length > 0) {
                    setInterviewers(
                        interview.interviewers.map((i) => ({
                            name: i.name,
                            email: i.email || "",
                            title: i.title || "",
                            linkedin: i.linkedin || "",
                        }))
                    );
                }
            }
        }
    }, [open, interview]);

    const fetchUsers = async () => {
        try {
            const response = await getAllUsersByAdmin({ limit: 100 });
            if (response) {
                setUsers(response.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const fetchUserApplications = async (userId: string) => {
        try {
            const response = await getUserApplicationsByAdmin(userId, {
                limit: 100
            });

            if (response) {
                // Filter out applications with certain statuses
                const filteredApplications = response.applications.filter(
                    (app: Application) =>
                        !['rejected', 'interviewed', 'interview-scheduled', 'withdrawn'].includes(app.status)
                );
                setApplications(filteredApplications);
            } else {
                setApplications([]);
            }
        } catch (error) {
            console.error("Failed to fetch applications:", error);
            setApplications([]);
        }
    };

    useEffect(() => {
        if (selectedUser) {
            fetchUserApplications(selectedUser._id);
        }
    }, [selectedUser]);

    const validateField = (fieldName: string, value: string | number) => {
        // Build a complete object for validation
        const testData = {
            userId: formData.userId,
            applicationId: formData.applicationId,
            type: formData.type,
            round: formData.round,
            scheduledDate: formData.scheduledDate,
            duration: formData.duration,
            location: {
                type: formData.locationType,
                ...(formData.locationType === "office" && formData.address && { address: formData.address }),
                ...(formData.locationType === "remote" && formData.meetingLink && { meetingLink: formData.meetingLink }),
                ...(formData.locationType === "phone" && formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
            },
            interviewers: interviewers.filter((i) => i.name.trim() !== ""),
            nextSteps: formData.nextSteps,
            [fieldName]: value, // Override with the new value
        };

        const result = safeParse(createInterviewSchema, testData);

        if (!result.success) {
            // Find error for this specific field
            const fieldError = result.issues.find((issue) => {
                const path = issue.path?.map(p => p.key).join('.');
                return path === fieldName || path?.startsWith(`${fieldName}.`);
            });

            if (fieldError) {
                let errorMessage = fieldError.message;
                // Handle specific validation errors
                if (fieldName === 'round' && (
                    errorMessage.toLowerCase().includes('nan') ||
                    errorMessage.toLowerCase().includes('expected number') ||
                    errorMessage.toLowerCase().includes('invalid type')
                )) {
                    errorMessage = 'Please enter a valid number for the interview round';
                }

                if (fieldName === 'duration' && errorMessage.includes('minimum')) {
                    errorMessage = 'Duration must be at least 15 minutes';
                }

                if (fieldName === 'duration' && errorMessage.includes('maximum')) {
                    errorMessage = 'Duration must not exceed 480 minutes (8 hours)';
                }

                if (fieldName === 'address' && errorMessage.includes('minimum')) {
                    errorMessage = 'Address must be at least 3 characters long';
                }

                if (fieldName === 'meetingLink' && errorMessage.includes('url')) {
                    errorMessage = 'Please enter a valid meeting link (e.g., https://zoom.us/j/123456789)';
                }

                if (fieldName === 'scheduledDate' && errorMessage.includes('future')) {
                    errorMessage = 'Interview date must be in the future';
                }

                setFieldErrors(prev => ({
                    ...prev,
                    [fieldName]: errorMessage
                }));
            } else {
                // Clear error if no longer present
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }
        } else {
            // Clear error if validation passed
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const validateLocationField = (locationType: string, fieldName: string, value: string) => {
        const testData = {
            userId: formData.userId,
            applicationId: formData.applicationId,
            type: formData.type,
            round: formData.round,
            scheduledDate: formData.scheduledDate,
            duration: formData.duration,
            location: {
                type: locationType,
                [fieldName]: value,
            },
            interviewers: interviewers.filter((i) => i.name.trim() !== ""),
            nextSteps: formData.nextSteps,
        };

        const result = safeParse(createInterviewSchema, testData);

        if (!result.success) {
            const fieldError = result.issues.find((issue) => {
                const path = issue.path?.map(p => p.key).join('.');
                return path === `location.${fieldName}`;
            });

            if (fieldError) {
                let errorMessage = fieldError.message;
                // Customize error messages for location fields
                if (fieldName === 'address' && errorMessage.includes('minimum')) {
                    errorMessage = 'Address must be at least 3 characters long';
                }

                if (fieldName === 'meetingLink' && errorMessage.includes('url')) {
                    errorMessage = 'Please enter a valid meeting link (e.g., https://zoom.us/j/123456789)';
                }

                if (fieldName === 'phoneNumber' && errorMessage.includes('regex')) {
                    errorMessage = 'Please enter a valid phone number (e.g., +1 (555) 123-4567)';
                }

                setFieldErrors(prev => ({
                    ...prev,
                    [`location.${fieldName}`]: errorMessage
                }));
            } else {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`location.${fieldName}`];
                    return newErrors;
                });
            }
        } else {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`location.${fieldName}`];
                return newErrors;
            });
        }
    };

    // Handle form field changes with validation
    const handleFieldChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validate after a short delay (debounce)
        setTimeout(() => {
            validateField(field, value);
        }, 300);
    };

    // Add specific handler for location fields
    const handleLocationFieldChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validate location-specific fields
        setTimeout(() => {
            validateLocationField(formData.locationType, field, value);
        }, 300);
    };

    // Add validation for interviewers
    const validateInterviewers = () => {
        const validInterviewers = interviewers.filter((i) => i.name.trim() !== "");

        if (validInterviewers.length === 0) {
            setFieldErrors(prev => ({
                ...prev,
                interviewers: 'At least one interviewer is required'
            }));
            return false;
        }

        // Validate each interviewer
        for (let i = 0; i < validInterviewers.length; i++) {
            const interviewer = validInterviewers[i];

            if (interviewer.name.length < 2) {
                setFieldErrors(prev => ({
                    ...prev,
                    interviewers: `Interviewer ${i + 1}: Name must be at least 2 characters`
                }));
                return false;
            }

            if (interviewer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interviewer.email)) {
                setFieldErrors(prev => ({
                    ...prev,
                    interviewers: `Interviewer ${i + 1}: Please enter a valid email address`
                }));
                return false;
            }
        }
        // Clear interviewer errors if validation passes
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.interviewers;
            return newErrors;
        });

        return true;
    };


    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");

            // Validate all required fields
            if (!formData.userId) {
                setError("Please select a user");
                return;
            }

            if (!formData.applicationId) {
                setError("Please select an application");
                return;
            }

            if (!formData.scheduledDate) {
                setError("Please select a date and time for the interview");
                return;
            }

            // Validate interviewers
            if (!validateInterviewers()) {
                return;
            }

            const location = {
                type: formData.locationType,
                ...(formData.locationType === "office" && formData.address && { address: formData.address }),
                ...(formData.locationType === "remote" && formData.meetingLink && { meetingLink: formData.meetingLink }),
                ...(formData.locationType === "phone" && formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
            };


            const validInterviewers = interviewers.filter((i) => i.name.trim() !== "");
            const dataToValidate = {
                userId: formData.userId,
                applicationId: formData.applicationId,
                type: formData.type,
                round: formData.round,
                scheduledDate: formData.scheduledDate,
                duration: formData.duration,
                location,
                interviewers: validInterviewers,
                nextSteps: formData.nextSteps,
            };

            // Final validation before submitting
            const validationResult = safeParse(createInterviewSchema, dataToValidate);

            if (!validationResult.success) {
                // Show all validation errors
                const errors: Record<string, string> = {};
                validationResult.issues.forEach((issue) => {
                    const fieldName = issue.path?.map(p => p.key).join('.') || 'form';
                    errors[fieldName] = issue.message;
                });
                setFieldErrors(errors);
                setError("Please fix the errors in the form");
                return;
            }
            if (interview) {
                // Update existing interview
                await updateInterviewAdmin(interview._id, {
                    type: formData.type,
                    round: formData.round,
                    scheduledDate: formData.scheduledDate,
                    duration: formData.duration,
                    location,
                    interviewers: validInterviewers,
                    nextSteps: formData.nextSteps,
                });
            } else {
                // Create new interview
                await createInterviewAdmin({
                    userId: formData.userId,
                    applicationId: formData.applicationId,
                    type: formData.type,
                    round: formData.round,
                    scheduledDate: new Date(formData.scheduledDate).toISOString(),
                    duration: formData.duration,
                    location,
                    interviewers: validInterviewers,
                    nextSteps: formData.nextSteps,
                });
            }

            onSuccess();
            handleClose();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data?.message || error.message || "Failed to save interview");
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to save interview");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            userId: "",
            applicationId: "",
            type: "video",
            round: 1,
            scheduledDate: "",
            duration: 60,
            locationType: "remote",
            address: "",
            meetingLink: "",
            phoneNumber: "",
            nextSteps: "",
        });
        setInterviewers([{ name: "", email: "", title: "", linkedin: "" }]);
        setSelectedUser(null);
        setSelectedApplication(null);
        setError("");
        onClose();
    };

    const addInterviewer = () => {
        setInterviewers([...interviewers, { name: "", email: "", title: "", linkedin: "" }]);
    };

    const removeInterviewer = (index: number) => {
        setInterviewers(interviewers.filter((_, i) => i !== index));
    };

    const updateInterviewer = (index: number, field: string, value: string) => {
        const updated = [...interviewers];
        updated[index] = { ...updated[index], [field]: value };
        setInterviewers(updated);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {interview ? "Edit Interview" : "Schedule New Interview"}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        {/* User Selection (only for create) */}
                        {!interview && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <Autocomplete
                                        options={users}
                                        getOptionLabel={(option) =>
                                            `${option.firstName} ${option.lastName} (${option.email})`
                                        }
                                        value={selectedUser}
                                        onChange={(_, value) => {
                                            setSelectedUser(value);
                                            handleFieldChange('userId', value?._id || "");
                                            setSelectedApplication(null);
                                            setFormData(prev => ({ ...prev, applicationId: "" }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select User *"
                                                required
                                                error={!!fieldErrors.userId}
                                                helperText={fieldErrors.userId}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Application Selection */}
                                <Grid size={{ xs: 12 }}>
                                    <Autocomplete
                                        options={applications}
                                        getOptionLabel={(option) =>
                                            `${option.job.title} at ${option.company.name}`
                                        }
                                        value={selectedApplication}
                                        onChange={(_, value) => {
                                            setSelectedApplication(value);
                                            handleFieldChange('applicationId', value?._id || "");
                                        }}
                                        disabled={!selectedUser}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Application *"
                                                required
                                                error={!!fieldErrors.applicationId}
                                                helperText={
                                                    fieldErrors.applicationId ||
                                                    (!selectedUser
                                                        ? "Select a user first"
                                                        : applications.length === 0
                                                            ? "No eligible applications found for this user"
                                                            : "")
                                                }
                                            />
                                        )}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Interview Type */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth required error={!!fieldErrors.type}>
                                <InputLabel>Interview Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    onChange={(e) =>
                                        handleFieldChange('type', e.target.value as Interview["type"])
                                    }
                                    label="Interview Type"
                                >
                                    <MenuItem value="phone">Phone</MenuItem>
                                    <MenuItem value="video">Video</MenuItem>
                                    <MenuItem value="in-person">In-Person</MenuItem>
                                    <MenuItem value="technical">Technical</MenuItem>
                                    <MenuItem value="panel">Panel</MenuItem>
                                    <MenuItem value="hr">HR</MenuItem>
                                    <MenuItem value="final">Final</MenuItem>
                                </Select>
                                {fieldErrors.type && <FormHelperText>{fieldErrors.type}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        {/* Round */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Round"
                                type="number"
                                fullWidth
                                required
                                value={formData.round || ""}
                                onChange={(e) => handleFieldChange('round', parseInt(e.target.value))}
                                inputProps={{ min: 1 }}
                                error={!!fieldErrors.round}
                                helperText={fieldErrors.round}
                            />
                        </Grid>

                        {/* Scheduled Date */}
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField
                                label="Scheduled Date & Time"
                                type="datetime-local"
                                fullWidth
                                required
                                value={formData.scheduledDate}
                                onChange={(e) => handleFieldChange('scheduledDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={!!fieldErrors.scheduledDate}
                                helperText={fieldErrors.scheduledDate}
                            />
                        </Grid>

                        {/* Duration */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="Duration (mins)"
                                type="number"
                                fullWidth
                                required
                                value={formData.duration || ""}
                                onChange={(e) => handleFieldChange('duration', parseInt(e.target.value))}
                                inputProps={{ min: 15, max: 480, step: 15 }}
                                error={!!fieldErrors.duration}
                                helperText={fieldErrors.duration}
                            />
                        </Grid>

                        {/* Location Type */}
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Location Type</InputLabel>
                                <Select
                                    value={formData.locationType}
                                    onChange={(e) =>
                                        handleFieldChange('locationType', e.target.value as "office" | "remote" | "phone")
                                    }
                                    label="Location Type"
                                >
                                    <MenuItem value="remote">Remote / Video</MenuItem>
                                    <MenuItem value="office">Office / In-Person</MenuItem>
                                    <MenuItem value="phone">Phone</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Location Details */}
                        {formData.locationType === "office" && (
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Office Address"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) => handleLocationFieldChange('address', e.target.value)}
                                    placeholder="123 Main St, City, State, ZIP"
                                    error={!!fieldErrors['location.address']}
                                    helperText={fieldErrors['location.address']}
                                />
                            </Grid>
                        )}

                        {formData.locationType === "remote" && (
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Meeting Link"
                                    fullWidth
                                    value={formData.meetingLink}
                                    onChange={(e) => handleLocationFieldChange('meetingLink', e.target.value)}
                                    placeholder="https://zoom.us/j/123456789"
                                    error={!!fieldErrors['location.meetingLink']}
                                    helperText={fieldErrors['location.meetingLink']}
                                />
                            </Grid>
                        )}
                        {formData.locationType === "phone" && (
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Phone Number"
                                    fullWidth
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleLocationFieldChange('phoneNumber', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    error={!!fieldErrors['location.phoneNumber']}
                                    helperText={fieldErrors['location.phoneNumber']}
                                />
                            </Grid>
                        )}

                        {/* Interviewers */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                Interviewers
                            </Typography>
                            {interviewers.map((interviewer, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Name"
                                                fullWidth
                                                size="small"
                                                value={interviewer.name}
                                                onChange={(e) => updateInterviewer(index, "name", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Email"
                                                type="email"
                                                fullWidth
                                                size="small"
                                                value={interviewer.email}
                                                onChange={(e) => updateInterviewer(index, "email", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 5 }}>
                                            <TextField
                                                label="Title"
                                                fullWidth
                                                size="small"
                                                value={interviewer.title}
                                                onChange={(e) => updateInterviewer(index, "title", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 5 }}>
                                            <TextField
                                                label="LinkedIn URL"
                                                fullWidth
                                                size="small"
                                                value={interviewer.linkedin}
                                                onChange={(e) => updateInterviewer(index, "linkedin", e.target.value)}
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            {interviewers.length > 1 && (
                                                <IconButton
                                                    onClick={() => removeInterviewer(index)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addInterviewer}
                                size="small"
                                variant="outlined"
                            >
                                Add Interviewer
                            </Button>
                            {fieldErrors.interviewers && (
                                <Alert severity="error" sx={{ mt: 1 }}>
                                    {fieldErrors.interviewers}
                                </Alert>
                            )}
                        </Grid>

                        {/* Next Steps */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Next Steps"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.nextSteps}
                                onChange={(e) => handleFieldChange('nextSteps', e.target.value)}
                                placeholder="What happens after this interview..."
                                error={!!fieldErrors.nextSteps}
                                helperText={fieldErrors.nextSteps || `${formData.nextSteps.length}/500 characters`}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !formData.applicationId || !formData.scheduledDate}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? "Saving..." : interview ? "Update Interview" : "Schedule Interview"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdminInterviewFormDialog;