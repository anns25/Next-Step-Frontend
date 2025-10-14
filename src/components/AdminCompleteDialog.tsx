"use client";

import React, { useState } from "react";
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
  Rating,
  Chip,
} from "@mui/material";
import { AssignmentTurnedIn as CompleteIcon, Add as AddIcon } from "@mui/icons-material";
import { Interview } from "@/types/Interview";
import { completeInterviewAdmin } from "@/lib/api/interviewAPI";
import { AxiosError } from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
  interview: Interview;
  onSuccess: () => void;
}

const AdminCompleteInterviewDialog: React.FC<Props> = ({ open, onClose, interview, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    outcome: "pending" as "pending" | "passed" | "failed" | "cancelled",
    userNotes: "",
    interviewerFeedback: "",
    rating: 0,
    strengths: [] as string[],
    areasForImprovement: [] as string[],
    nextSteps: "",
  });
  const [newStrength, setNewStrength] = useState("");
  const [newImprovement, setNewImprovement] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const feedback = {
        userNotes: formData.userNotes,
        interviewerFeedback: formData.interviewerFeedback,
        rating: formData.rating,
        strengths: formData.strengths,
        areasForImprovement: formData.areasForImprovement,
      };

      await completeInterviewAdmin(interview._id, {
        feedback,
        outcome: formData.outcome,
        nextSteps: formData.nextSteps,
      });

      onSuccess();
      handleClose();
    } catch (error: unknown) { 
    if (error instanceof AxiosError) {
      setError(error.response?.data?.message || error.message || "Failed to complete interview");
    } else if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Failed to complete interview");
    }
  } finally {
    setLoading(false);
  }
  };

  const handleClose = () => {
    setFormData({
      outcome: "pending",
      userNotes: "",
      interviewerFeedback: "",
      rating: 0,
      strengths: [],
      areasForImprovement: [],
      nextSteps: "",
    });
    setNewStrength("");
    setNewImprovement("");
    setError("");
    onClose();
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData({
        ...formData,
        strengths: [...formData.strengths, newStrength.trim()],
      });
      setNewStrength("");
    }
  };

  const removeStrength = (index: number) => {
    setFormData({
      ...formData,
      strengths: formData.strengths.filter((_, i) => i !== index),
    });
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFormData({
        ...formData,
        areasForImprovement: [...formData.areasForImprovement, newImprovement.trim()],
      });
      setNewImprovement("");
    }
  };

  const removeImprovement = (index: number) => {
    setFormData({
      ...formData,
      areasForImprovement: formData.areasForImprovement.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CompleteIcon color="primary" />
        Complete Interview
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          {/* Interview Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "rgba(25, 118, 210, 0.1)", borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Interview:
            </Typography>
            <Typography variant="body2">
              {interview.job.title} - {interview.user.firstName} {interview.user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(interview.scheduledDate).toLocaleString()}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Outcome */}
            <Grid size={{xs:12, sm:6}}>
              <FormControl fullWidth required>
                <InputLabel>Outcome</InputLabel>
                <Select
                  value={formData.outcome}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outcome: e.target.value as typeof formData.outcome,
                    })
                  }
                  label="Outcome"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="passed">Passed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Rating */}
            <Grid size={{xs:12, sm:6}}>
              <Box>
                <Typography component="legend" variant="body2" gutterBottom>
                  Overall Rating
                </Typography>
                <Rating
                  value={formData.rating}
                  onChange={(_, value) => setFormData({ ...formData, rating: value || 0 })}
                  size="large"
                />
              </Box>
            </Grid>

            {/* User Notes */}
            <Grid size={{xs:12}}>
              <TextField
                label="Interview Notes"
                fullWidth
                multiline
                rows={3}
                value={formData.userNotes}
                onChange={(e) => setFormData({ ...formData, userNotes: e.target.value })}
                placeholder="Overall observations about the interview..."
              />
            </Grid>

            {/* Interviewer Feedback */}
            <Grid size={{xs:12}}>
              <TextField
                label="Interviewer Feedback"
                fullWidth
                multiline
                rows={3}
                value={formData.interviewerFeedback}
                onChange={(e) =>
                  setFormData({ ...formData, interviewerFeedback: e.target.value })
                }
                placeholder="Feedback from the interviewer(s)..."
              />
            </Grid>

            {/* Strengths */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Strengths
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                {formData.strengths.map((strength, index) => (
                  <Chip
                    key={index}
                    label={strength}
                    onDelete={() => removeStrength(index)}
                    color="success"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add a strength..."
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addStrength();
                    }
                  }}
                />
                <Button variant="outlined" onClick={addStrength} disabled={!newStrength.trim()}>
                  <AddIcon />
                </Button>
              </Box>
            </Grid>

            {/* Areas for Improvement */}
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Areas for Improvement
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                {formData.areasForImprovement.map((area, index) => (
                  <Chip
                    key={index}
                    label={area}
                    onDelete={() => removeImprovement(index)}
                    color="warning"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add an area for improvement..."
                  value={newImprovement}
                  onChange={(e) => setNewImprovement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImprovement();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={addImprovement}
                  disabled={!newImprovement.trim()}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Grid>

            {/* Next Steps */}
            <Grid size={{xs:12}}>
              <TextField
                label="Next Steps"
                fullWidth
                multiline
                rows={3}
                value={formData.nextSteps}
                onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                placeholder="What are the next steps after this interview..."
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            This will mark the interview as completed and update the application status.
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CompleteIcon />}
        >
          {loading ? "Completing..." : "Mark as Completed"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminCompleteInterviewDialog;