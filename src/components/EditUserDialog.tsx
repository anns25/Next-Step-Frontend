"use client";

import { useState } from "react";
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
} from "@mui/material";
import { Add, Delete, PhotoCamera } from "@mui/icons-material";
import { User } from "@/types/User";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User;
  values: Partial<User>;
  setValues: React.Dispatch<React.SetStateAction<Partial<User>>>;
  onSave: (file?: File | null) => void;
}

const EditUserDialog: React.FC<Props> = ({ open, onClose, values, setValues, onSave }) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof User, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
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
      setErrors(prev => {
        const { image, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent dividers>
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
                src={preview // if new file chosen → show preview
                  ? preview
                  : values.profilePicture // otherwise show existing
                    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${values.profilePicture}`
                    : undefined}
                sx={{ width: 64, height: 64 }}
              />
              {imageFile ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, mb: 2 }}>
                  <Typography variant="body2" color={theme.palette.text.primary}>
                    {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                  </Typography>
                  <IconButton
                    color="error"
                    onClick={handleRemoveImage}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mt: 2, gap: 1 }}>

                  <Button
                    variant='outlined'
                    component="label"
                    color="primary"
                    startIcon={<PhotoCamera />}
                    sx={{ minWidth: 200 }}>
                    Change Image
                    <input type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                </Box>
              )}

              {errors.profilePicture && (
                <Typography variant="caption" color="error">
                  {errors.profilePicture}
                </Typography>
              )}
            </Box>
            <TextField
              label="First Name"
              value={values.firstName ?? ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={values.lastName ?? ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              fullWidth
            />
            <TextField label="Email" value={values.email ?? ""} disabled fullWidth />
            <TextField
              label="Resume Headline"
              value={values.resumeHeadline ?? ""}
              onChange={(e) => handleChange("resumeHeadline", e.target.value)}
              fullWidth
            />
            <TextField
              label="Skills (comma separated)"
              value={values.skills?.join(", ") ?? ""}
              onChange={(e) =>
                handleChange(
                  "skills",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
              fullWidth
            />
            <TextField
              select
              label="Work Status"
              value={values.workStatus ?? "fresher"}
              onChange={(e) => handleChange("workStatus", e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="fresher">Fresher</option>
              <option value="experienced">Experienced</option>
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
                  }}
                  fullWidth
                />
                <TextField
                  label="Position"
                  value={exp.position ?? ""}
                  onChange={(e) => {
                    const updated = [...(values.experience || [])];
                    updated[i].position = e.target.value;
                    handleChange("experience", updated);
                  }}
                  fullWidth
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
                  }}
                  fullWidth
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
                  }}
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
                  }}
                  fullWidth
                />
                <TextField
                  label="Degree"
                  value={edu.degree ?? ""}
                  onChange={(e) => {
                    const updated = [...(values.education || [])];
                    updated[i].degree = e.target.value;
                    handleChange("education", updated);
                  }}
                  fullWidth
                />
                <TextField
                  label="Field of Study"
                  value={edu.fieldOfStudy ?? ""}
                  onChange={(e) => {
                    const updated = [...(values.education || [])];
                    updated[i].fieldOfStudy = e.target.value;
                    handleChange("education", updated);
                  }}
                  fullWidth
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
                  }}
                  fullWidth
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
                  }}
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
          </Box>
        )}

        {/* PREFERENCES */}
        {tab === 3 && (
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Job Types (comma separated)"
              value={values.preferences?.jobTypes?.join(", ") ?? ""}
              onChange={(e) =>
                handleNestedChange(
                  "preferences.jobTypes",
                  e.target.value.split(",").map((j) => j.trim())
                )
              }
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                type="number"
                label="Min Salary"
                value={values.preferences?.salaryRange?.min ?? ""}
                onChange={(e) =>
                  handleNestedChange("preferences.salaryRange.min", +e.target.value)
                }
                fullWidth
              />
              <TextField
                type="number"
                label="Max Salary"
                value={values.preferences?.salaryRange?.max ?? ""}
                onChange={(e) =>
                  handleNestedChange("preferences.salaryRange.max", +e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Currency"
                value={values.preferences?.salaryRange?.currency ?? ""}
                onChange={(e) =>
                  handleNestedChange("preferences.salaryRange.currency", e.target.value)
                }
                fullWidth
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={values.preferences?.remoteWork ?? false}
                  onChange={(e) =>
                    handleNestedChange("preferences.remoteWork", e.target.checked)
                  }
                />
              }
              label="Remote Work"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={values.preferences?.notifications?.email ?? false}
                  onChange={(e) =>
                    handleNestedChange("preferences.notifications.email", e.target.checked)
                  }
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={values.preferences?.notifications?.push ?? false}
                  onChange={(e) =>
                    handleNestedChange("preferences.notifications.push", e.target.checked)
                  }
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
              fullWidth
            />
            <TextField
              label="State"
              value={values.location?.state ?? ""}
              onChange={(e) => handleNestedChange("location.state", e.target.value)}
              fullWidth
            />
            <TextField
              label="Country"
              value={values.location?.country ?? ""}
              onChange={(e) => handleNestedChange("location.country", e.target.value)}
              fullWidth
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={async () => {
            try {
              onSave(imageFile); // pass file along with values
              onClose();
            } catch (err) {
              console.error("Update failed:", err);
            }
          }}
          variant="contained"
          color="primary"
        >
          Save Changes
        </Button>

      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
