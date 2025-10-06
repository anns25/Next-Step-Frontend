"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Avatar,
  useTheme,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import { Add, Delete, PhotoCamera, DeleteForever } from "@mui/icons-material";
import { User } from "@/types/User";
import { JobPreferences } from "./JobPreferences";
import { safeParse } from "valibot";
import { profileUpdateSchemaWithConditions } from "@/lib/validation/authSchema";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User;
  values: Partial<User>;
  setValues: React.Dispatch<React.SetStateAction<Partial<User>>>;
  onSave: (file?: File | null) => void;
  onDeleteAccount?: () => Promise<void>;
}

interface ValidationErrors {
  [key: string]: string;
}

const EditUserDialog: React.FC<Props> = ({
  open,
  onClose,
  values,
  setValues,
  onSave,
  onDeleteAccount
}) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newSkill, setNewSkill] = useState("");

  // Date boundaries
  const getCurrentYear = () => new Date().getFullYear();
  const getMinBirthYear = () => getCurrentYear() - 80;
  const getMaxStartYear = () => getCurrentYear() + 2;
  const getMinStartYear = () => getCurrentYear() - 60;

  // Clear error for a specific field when user starts typing
  const clearFieldError = (fieldPath: string) => {
    setErrors(prev => {
      const { [fieldPath]: _, ...rest } = prev;
      return rest;
    });
  };

  const validateForm = () => {
    try {
      const result = safeParse(profileUpdateSchemaWithConditions, values);
      let newErrors: ValidationErrors = {};

      // Collect schema errors first
      if (!result.success) {
        result.issues.forEach(issue => {
          const path = issue.path?.map(p => p.key).join('.') || 'general';
          newErrors[path] = issue.message;
        });
      }

      // ---- Custom validation for EXPERIENCE ----
      values.experience?.forEach((exp, i) => {
        if (exp.company || exp.position || exp.startDate || exp.endDate) {
          // Require both start and end dates
          if (!exp.startDate) {
            newErrors[`experience.${i}.startDate`] = "Start date is required";
          }
          if (!exp.endDate) {
            newErrors[`experience.${i}.endDate`] = "End date is required";
          }
          // Compare dates if both present
          if (exp.startDate && exp.endDate && new Date(exp.startDate) > new Date(exp.endDate)) {
            newErrors[`experience.${i}.endDate`] = "End date must be after start date";
          }
        }
      });

      // ---- Custom validation for EDUCATION ----
      values.education?.forEach((edu, i) => {
        if (edu.institution || edu.degree || edu.fieldOfStudy || edu.startDate || edu.endDate) {
          if (!edu.startDate) {
            newErrors[`education.${i}.startDate`] = "Start date is required";
          }
          if (!edu.endDate) {
            newErrors[`education.${i}.endDate`] = "End date is required";
          }
          if (edu.startDate && edu.endDate && new Date(edu.startDate) > new Date(edu.endDate)) {
            newErrors[`education.${i}.endDate`] = "End date must be after start date";
          }
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      if (err instanceof Error) {
        setErrors({ general: err.message });
      }
      return false;
    }
  };



  const handleChange = (field: keyof User, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    clearFieldError(field.toString());
  };

  const handleNestedChange = (path: string, value: any) => {
    const keys = path.split(".");
    const updated: any = { ...values };
    let curr = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      curr[keys[i]] = curr[keys[i]] ?? {};
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = value;
    setValues(updated);
    // Clear error for this field when user starts typing
    clearFieldError(path);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Please select an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size must be less than 5MB" }));
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      // Clear image error when user selects a valid file
      clearFieldError('image');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
    // Clear image error when user removes image
    clearFieldError('image');
  };

  const addSkill = () => {
    if (newSkill.trim() && !values.skills?.includes(newSkill.trim())) {
      const updatedSkills = [...(values.skills || []), newSkill.trim()];
      handleChange("skills", updatedSkills);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = values.skills?.filter(skill => skill !== skillToRemove) || [];
    handleChange("skills", updatedSkills);
  };

  const handleSave = async () => {
    const isValid = validateForm();
    if (!isValid) {
      // Decide which tab to show based on first error key
      const firstErrorKey = Object.keys(errors)[0];

      if (firstErrorKey) {
        if (['firstName', 'lastName', 'email', 'resumeHeadline', 'skills', 'workStatus'].includes(firstErrorKey)) {
          setTab(0);
        } else if (firstErrorKey.startsWith('experience')) {
          setTab(1);
        } else if (firstErrorKey.startsWith('education')) {
          setTab(2);
        } else if (firstErrorKey.startsWith('preferences')) {
          setTab(3);
        } else if (firstErrorKey.startsWith('location')) {
          setTab(4);
        }
      }
      return;
    }

    try {
      onSave(imageFile);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };


  const handleDeleteConfirm = async () => {
    if (!onDeleteAccount) return;

    setDeleteLoading(true);
    try {
      await onDeleteAccount();
      setDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get date input props with sensible boundaries
  const getDateInputProps = (type: 'birth' | 'start' | 'end') => {
    const currentYear = getCurrentYear();
    switch (type) {
      case 'birth':
        return {
          min: `${getMinBirthYear()}-01-01`,
          max: `${currentYear - 16}-12-31`
        };
      case 'start':
        return {
          min: `${getMinStartYear()}-01-01`,
          max: `${getMaxStartYear()}-12-31`
        };
      case 'end':
        return {
          min: `${getMinStartYear()}-01-01`,
          max: `${getMaxStartYear()}-12-31`
        };
      default:
        return {};
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Profile
        </DialogTitle>

        <DialogContent dividers>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Basic Info" />
            <Tab label="Experience" />
            <Tab label="Education" />
            <Tab label="Preferences" />
            <Tab label="Location" />
          </Tabs>

          {/* BASIC INFO */}
          {tab === 0 && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={preview || (values.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${values.profilePicture}` : undefined)}
                  sx={{ width: 64, height: 64 }}
                />
                {imageFile ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, mb: 2 }}>
                    <Typography variant="body2" color={theme.palette.text.primary}>
                      {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                    </Typography>
                    <IconButton color="error" onClick={handleRemoveImage} size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mt: 2, gap: 1 }}>
                    <Button variant='outlined' component="label" color="primary" startIcon={<PhotoCamera />} sx={{ minWidth: 200 }}>
                      Change Image
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                  </Box>
                )}
                {errors.image && (
                  <Typography variant="caption" color="error">
                    {errors.image}
                  </Typography>
                )}
              </Box>

              <TextField
                label="First Name"
                value={values.firstName ?? ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                fullWidth
                required
              />

              <TextField
                label="Last Name"
                value={values.lastName ?? ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                fullWidth
                required
              />

              <TextField
                label="Email"
                value={values.email ?? ""}
                disabled
                fullWidth
              />

              <TextField
                label="Resume Headline"
                value={values.resumeHeadline ?? ""}
                onChange={(e) => handleChange("resumeHeadline", e.target.value)}
                error={!!errors.resumeHeadline}
                helperText={errors.resumeHeadline}
                multiline
                rows={3}
                fullWidth
              />

              {/* Skills with chips */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                  {values.skills?.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => removeSkill(skill)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button variant="outlined" onClick={addSkill}>
                    Add Skill
                  </Button>
                </Stack>
                {errors.skills && (
                  <Typography variant="caption" color="error">
                    {errors.skills}
                  </Typography>
                )}
              </Box>

              <TextField
                select
                label="Work Status"
                value={values.workStatus ?? "fresher"}
                onChange={(e) => handleChange("workStatus", e.target.value)}
                error={!!errors.workStatus}
                helperText={errors.workStatus}
                fullWidth
                required
              >
                <MenuItem value="fresher">Fresher</MenuItem>
                <MenuItem value="experienced">Experienced</MenuItem>
              </TextField>
            </Box>
          )}

          {/* EXPERIENCE */}
          {tab === 1 && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
              {values.experience?.map((exp, i) => (
                <Box key={i} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Company"
                    value={exp.company ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.experience || [])];
                      updated[i].company = e.target.value;
                      handleChange("experience", updated);
                      // Clear specific field error
                      clearFieldError(`experience.${i}.company`);
                    }}
                    error={!!errors[`experience.${i}.company`]}
                    helperText={errors[`experience.${i}.company`]}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Position"
                    value={exp.position ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.experience || [])];
                      updated[i].position = e.target.value;
                      handleChange("experience", updated);
                      // Clear specific field error
                      clearFieldError(`experience.${i}.position`);
                    }}
                    error={!!errors[`experience.${i}.position`]}
                    helperText={errors[`experience.${i}.position`]}
                    fullWidth
                    required
                  />
                  <TextField
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    value={exp.startDate?.toString().slice(0, 10) ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.experience || [])];
                      updated[i].startDate = e.target.value;
                      handleChange("experience", updated);
                      // Clear specific field error
                      clearFieldError(`experience.${i}.startDate`);
                    }}
                    error={!!errors[`experience.${i}.startDate`]}
                    helperText={errors[`experience.${i}.startDate`]}
                    inputProps={getDateInputProps('start')}
                    fullWidth
                    required
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                    value={exp.endDate?.toString().slice(0, 10) ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.experience || [])];
                      updated[i].endDate = e.target.value;
                      handleChange("experience", updated);
                      // Clear specific field error
                      clearFieldError(`experience.${i}.endDate`);
                    }}
                    error={!!errors[`experience.${i}.endDate`]}
                    helperText={errors[`experience.${i}.endDate`]}
                    inputProps={getDateInputProps('end')}
                    fullWidth
                  />
                  <IconButton
                    color="error"
                    onClick={() => {
                      const updated = [...(values.experience || [])];
                      updated.splice(i, 1);
                      handleChange("experience", updated);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() =>
                  handleChange("experience", [
                    ...(values.experience || []),
                    { company: "", position: "", startDate: "", endDate: "" },
                  ])
                }
              >
                Add Experience
              </Button>
              {errors.experience && (
                <Typography variant="caption" color="error">
                  {errors.experience}
                </Typography>
              )}
            </Box>
          )}

          {/* EDUCATION */}
          {tab === 2 && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
              {values.education?.map((edu, i) => (
                <Box key={i} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Institution"
                    value={edu.institution ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.education || [])];
                      updated[i].institution = e.target.value;
                      handleChange("education", updated);
                      // Clear specific field error
                      clearFieldError(`education.${i}.institution`);
                    }}
                    error={!!errors[`education.${i}.institution`]}
                    helperText={errors[`education.${i}.institution`]}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Degree"
                    value={edu.degree ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.education || [])];
                      updated[i].degree = e.target.value;
                      handleChange("education", updated);
                      // Clear specific field error
                      clearFieldError(`education.${i}.degree`);
                    }}
                    error={!!errors[`education.${i}.degree`]}
                    helperText={errors[`education.${i}.degree`]}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Field of Study"
                    value={edu.fieldOfStudy ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.education || [])];
                      updated[i].fieldOfStudy = e.target.value;
                      handleChange("education", updated);
                      // Clear specific field error
                      clearFieldError(`education.${i}.fieldOfStudy`);
                    }}
                    error={!!errors[`education.${i}.fieldOfStudy`]}
                    helperText={errors[`education.${i}.fieldOfStudy`]}
                    fullWidth
                    required
                  />
                  <TextField
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    value={edu.startDate?.toString().slice(0, 10) ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.education || [])];
                      updated[i].startDate = e.target.value;
                      handleChange("education", updated);
                      // Clear specific field error
                      clearFieldError(`education.${i}.startDate`);
                    }}
                    error={!!errors[`education.${i}.startDate`]}
                    helperText={errors[`education.${i}.startDate`]}
                    inputProps={getDateInputProps('start')}
                    fullWidth
                    required
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                    value={edu.endDate?.toString().slice(0, 10) ?? ""}
                    onChange={(e) => {
                      const updated = [...(values.education || [])];
                      updated[i].endDate = e.target.value;
                      handleChange("education", updated);
                      // Clear specific field error
                      clearFieldError(`education.${i}.endDate`);
                    }}
                    error={!!errors[`education.${i}.endDate`]}
                    helperText={errors[`education.${i}.endDate`]}
                    inputProps={getDateInputProps('end')}
                    fullWidth
                  />
                  <IconButton
                    color="error"
                    onClick={() => {
                      const updated = [...(values.education || [])];
                      updated.splice(i, 1);
                      handleChange("education", updated);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() =>
                  handleChange("education", [
                    ...(values.education || []),
                    { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" },
                  ])
                }
              >
                Add Education
              </Button>
              {errors.education && (
                <Typography variant="caption" color="error">
                  {errors.education}
                </Typography>
              )}
            </Box>
          )}

          {/* PREFERENCES */}
          {tab === 3 && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="h6" gutterBottom>
                Job Preferences
              </Typography>

              <JobPreferences
                preferences={values.preferences?.jobTypes || []}
                onChange={(jobTypes) => handleNestedChange("preferences.jobTypes", jobTypes)}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Salary & Other Preferences
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  type="number"
                  label="Min Salary"
                  value={values.preferences?.salaryRange?.min ?? ""}
                  onChange={(e) => handleNestedChange("preferences.salaryRange.min", +e.target.value)}
                  error={!!errors['preferences.salaryRange.min']}
                  helperText={errors['preferences.salaryRange.min']}
                  fullWidth
                />
                <TextField
                  type="number"
                  label="Max Salary"
                  value={values.preferences?.salaryRange?.max ?? ""}
                  onChange={(e) => handleNestedChange("preferences.salaryRange.max", +e.target.value)}
                  error={!!errors['preferences.salaryRange.max']}
                  helperText={errors['preferences.salaryRange.max']}
                  fullWidth
                />
                <TextField
                  label="Currency"
                  value={values.preferences?.salaryRange?.currency ?? "USD"}
                  onChange={(e) => handleNestedChange("preferences.salaryRange.currency", e.target.value)}
                  error={!!errors['preferences.salaryRange.currency']}
                  helperText={errors['preferences.salaryRange.currency']}
                  fullWidth
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={values.preferences?.remoteWork ?? false}
                    onChange={(e) => handleNestedChange("preferences.remoteWork", e.target.checked)}
                  />
                }
                label="Remote Work"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={values.preferences?.notifications?.email ?? false}
                    onChange={(e) => handleNestedChange("preferences.notifications.email", e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={values.preferences?.notifications?.push ?? false}
                    onChange={(e) => handleNestedChange("preferences.notifications.push", e.target.checked)}
                  />
                }
                label="Push Notifications"
              />
            </Box>
          )}

          {/* LOCATION */}
          {tab === 4 && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="City"
                value={values.location?.city ?? ""}
                onChange={(e) => handleNestedChange("location.city", e.target.value)}
                error={!!errors['location.city']}
                helperText={errors['location.city']}
                fullWidth
                required
              />
              <TextField
                label="State"
                value={values.location?.state ?? ""}
                onChange={(e) => handleNestedChange("location.state", e.target.value)}
                error={!!errors['location.state']}
                helperText={errors['location.state']}
                fullWidth
                required
              />
              <TextField
                label="Country"
                value={values.location?.country ?? ""}
                onChange={(e) => handleNestedChange("location.country", e.target.value)}
                error={!!errors['location.country']}
                helperText={errors['location.country']}
                fullWidth
                required
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", mt: 3, mb: 3, ml: 3, mr: 3 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              color: "#455463",
              borderColor: "#455463",
              "&:hover": {
                backgroundColor: "#455463",
                color: "#fff",
              },
            }}
          >
            Cancel
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            {onDeleteAccount && (
              <Button
                color="error"
                variant="outlined"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            )}
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
            >
              Save Changes
            </Button>
          </Box>
        </DialogActions>

      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete your account? This action will permanently remove all your data including:
          </Typography>
          <ul>
            <li>Profile information</li>
            <li>Job applications</li>
            <li>Saved preferences</li>
            <li>All other associated data</li>
          </ul>
          <Typography color="error" fontWeight="bold">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteForever />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditUserDialog;