"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  Link,
  Grid,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Link as LinkIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { Interview } from "@/types/Interview";

interface Props {
  open: boolean;
  onClose: () => void;
  interview: Interview;
  isAdmin?: boolean;
}

const InterviewDetailDialog: React.FC<Props> = ({ open, onClose, interview, isAdmin }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "info";
      case "confirmed":
        return "success";
      case "completed":
        return "default";
      case "cancelled":
        return "error";
      case "rescheduled":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Interview Details</Typography>
          <Chip
            label={interview.status.toUpperCase()}
            color={getStatusColor(interview.status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Job & Company */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {interview.job.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body1" color="text.secondary">
                {interview.company.name}
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Interview Type & Round */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{xs:12}}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Interview Type
              </Typography>
              <Chip
                label={interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={{xs:6}}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Round
              </Typography>
              <Chip label={`Round ${interview.round}`} variant="outlined" size="small" />
            </Grid>
          </Grid>

          {/* Date & Time */}
          <Box sx={{ mb: 3 }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">{formatDate(interview.scheduledDate)}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TimeIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(interview.scheduledDate)} ({interview.duration} minutes)
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Location */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <LocationIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Location
                </Typography>
                {interview.location.type === "remote" && (
                  <>
                    <Typography variant="body1" gutterBottom>
                      Remote / Video Call
                    </Typography>
                    {interview.location.meetingLink && (
                      <Link
                        href={interview.location.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <LinkIcon fontSize="small" />
                        {interview.location.meetingLink}
                      </Link>
                    )}
                  </>
                )}
                {interview.location.type === "office" && (
                  <Typography variant="body1">
                    {interview.location.address || "Office Location"}
                  </Typography>
                )}
                {interview.location.type === "phone" && (
                  <>
                    <Typography variant="body1" gutterBottom>
                      Phone Interview
                    </Typography>
                    {interview.location.phoneNumber && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PhoneIcon fontSize="small" />
                        <Link href={`tel:${interview.location.phoneNumber}`}>
                          {interview.location.phoneNumber}
                        </Link>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Interviewers */}
          {interview.interviewers.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Interviewers
                    </Typography>
                    {interview.interviewers.map((interviewer, index) => (
                      <Box key={index} sx={{ mb: 1.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {interviewer.name}
                        </Typography>
                        {interviewer.title && (
                          <Typography variant="body2" color="text.secondary">
                            {interviewer.title}
                          </Typography>
                        )}
                        {interviewer.email && (
                          <Link href={`mailto:${interviewer.email}`} variant="body2">
                            {interviewer.email}
                          </Link>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {/* Preparation Notes - Hide from Admin*/}
          {!isAdmin && interview.preparation?.notes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Preparation Notes
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {interview.preparation.notes}
                </Typography>
              </Box>
            </>
          )}

          {/* Next Steps */}
          {interview.nextSteps && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Next Steps
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {interview.nextSteps}
                </Typography>
              </Box>
            </>
          )}

          {/* Feedback (if completed) */}
          {interview.status === "completed" && interview.feedback && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Feedback
                </Typography>
                {interview.feedback.userNotes && (
                  <Typography variant="body2" paragraph>
                    {interview.feedback.userNotes}
                  </Typography>
                )}
                {interview.feedback.rating && (
                  <Typography variant="body2">
                    Rating: {interview.feedback.rating}/5
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewDetailDialog;