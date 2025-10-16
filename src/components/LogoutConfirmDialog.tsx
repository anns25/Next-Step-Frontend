"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { ExitToApp as LogoutIcon, Cancel as CancelIcon } from "@mui/icons-material";

interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function LogoutConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backdropFilter: "blur(12px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,250,255,0.95) 100%)",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LogoutIcon color="error" />
          <Typography variant="h6" fontWeight={600}>
            Confirm Logout
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          Are you sure you want to log out? You&apos;ll need to sign in again to access your dashboard.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          startIcon={<CancelIcon />}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={<LogoutIcon />}
          sx={{ borderRadius: 2 }}
        >
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}