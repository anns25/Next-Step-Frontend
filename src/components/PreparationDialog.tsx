"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Interview } from "@/types/Interview";
import { updatePreparation } from "@/lib/api/interviewAPI";

interface Props {
  open: boolean;
  onClose: () => void;
  interview: Interview;
  onSuccess: () => void;
}

const PreparationDialog: React.FC<Props> = ({ open, onClose, interview, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [research, setResearch] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    if (open && interview) {
      setNotes(interview.preparation?.notes || "");
      setResearch(interview.preparation?.research || "");
      setQuestions(interview.preparation?.questions || []);
    }
  }, [open, interview]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await updatePreparation(interview._id, {
        notes,
        research,
        questions,
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Failed to update preparation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNotes("");
    setResearch("");
    setQuestions([]);
    setNewQuestion("");
    onClose();
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Interview Preparation</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {interview.job.title} at {interview.company.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {new Date(interview.scheduledDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>

          {/* Notes */}
          <TextField
            label="Preparation Notes"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key points to remember, topics to review..."
            sx={{ mt: 3, mb: 2 }}
          />

          {/* Research */}
          <TextField
            label="Company Research"
            fullWidth
            multiline
            rows={4}
            value={research}
            onChange={(e) => setResearch(e.target.value)}
            placeholder="Company background, recent news, products..."
            sx={{ mb: 2 }}
          />

          {/* Questions to Ask */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
              Questions
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {questions.map((question, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    bgcolor: "rgba(0,0,0,0.03)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {question}
                  </Typography>
                  <IconButton size="small" onClick={() => removeQuestion(index)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a question to ask..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addQuestion();
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addQuestion}
                disabled={!newQuestion.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>
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
          startIcon={loading && <CircularProgress size={20} />}
        >
          Save Preparation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreparationDialog;