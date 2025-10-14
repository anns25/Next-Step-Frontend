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
  CircularProgress,
  Alert,
} from "@mui/material";
import { EventRepeat as RescheduleIcon } from "@mui/icons-material";
import { Interview } from "@/types/Interview";
import { rescheduleInterviewAdmin } from "@/lib/api/interviewAPI";
import { AxiosError } from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
  interview: Interview;
  onSuccess: () => void;
}

const AdminRescheduleDialog: React.FC<Props> = ({ open, onClose, interview, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    scheduledDate: "",
    duration: 60,
    locationType: "remote" as "office" | "remote" | "phone",
    address: "",
    meetingLink: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (open && interview) {
      setFormData({
        scheduledDate: new Date(interview.scheduledDate).toISOString().slice(0, 16),
        duration: interview.duration,
        locationType: interview.location.type,
        address: interview.location.address || "",
        meetingLink: interview.location.meetingLink || "",
        phoneNumber: interview.location.phoneNumber || "",
      });
    }
  }, [open, interview]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!formData.scheduledDate) {
        setError("Please select a new date and time");
        return;
      }

      const location = {
        type: formData.locationType,
        ...(formData.locationType === "office" && formData.address && { address: formData.address }),
        ...(formData.locationType === "remote" && formData.meetingLink && { meetingLink: formData.meetingLink }),
        ...(formData.locationType === "phone" && formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
      };

      await rescheduleInterviewAdmin(interview._id, {
        scheduledDate: formData.scheduledDate,
        duration: formData.duration,
        location,
      });

      onSuccess();
      handleClose();
    } catch (error: unknown) { 
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || error.message || "Failed to reschedule interview");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to reschedule interview");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <RescheduleIcon color="warning" />
        Reschedule Interview
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          {/* Current Interview Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "rgba(25, 118, 210, 0.1)", borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Schedule:
            </Typography>
            <Typography variant="body2">
              {interview.job.title} - {interview.user.firstName} {interview.user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(interview.scheduledDate).toLocaleString()}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* New Scheduled Date */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="New Date & Time"
                type="datetime-local"
                fullWidth
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                inputProps={{ min: 15, step: 15 }}
              />
            </Grid>

            {/* Location Type */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Location Type</InputLabel>
                <Select
                  value={formData.locationType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationType: e.target.value as "office" | "remote" | "phone",
                    })
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
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </Grid>
            )}

            {formData.locationType === "remote" && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Meeting Link"
                  fullWidth
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/j/123456789"
                />
              </Grid>
            )}

            {formData.locationType === "phone" && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </Grid>
            )}
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            The candidate will be notified of the new interview schedule.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={loading || !formData.scheduledDate}
          startIcon={loading ? <CircularProgress size={20} /> : <RescheduleIcon />}
        >
          {loading ? "Rescheduling..." : "Reschedule Interview"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminRescheduleDialog;