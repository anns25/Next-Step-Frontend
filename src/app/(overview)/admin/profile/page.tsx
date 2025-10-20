"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Chip,
  Divider,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { useTheme } from "@mui/material/styles";
import { User } from "@/types/User";
import { deleteUserAccount, getMyProfile, updateMyProfile } from "@/lib/api/userAPI";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import AdminLayout from "../layout";

const AdminProfilePage = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePictureDialogOpen, setProfilePictureDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Add these missing state variables
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getMyProfile();
      if (profile) {
        setUser(profile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleProfilePictureChange = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      const updated = await updateMyProfile({}, selectedFile);
      if (updated) {
        setUser(updated);
        setSnackbar({
          open: true,
          message: "Profile picture updated successfully",
          severity: "success",
        });
        setProfilePictureDialogOpen(false);
        setSelectedFile(null);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update profile picture",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Fix the handleDeleteAccount function
  const handleDeleteAccount = () => {
    if (user) {
      setUserToDelete(user);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserAccount();
      deleteCookie('token');
      deleteCookie('userData');
      logout();
      router.push('/login');
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete account",
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) return <Typography>Loading profile...</Typography>;
  if (!user) return <Typography>Error loading profile</Typography>;

  return (
    <>
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: { xs: 2, md: 3 },
            backdropFilter: "blur(12px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
            boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
          }}
        >
          {/* Profile Header */}
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }} container spacing={3} alignItems="center">
              <Grid>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${user.profilePicture}`}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: theme.palette.text.primary,
                      border: `4px solid ${theme.palette.text.secondary}`,
                    }}
                  >
                    {user.firstName?.[0] ?? "A"}
                  </Avatar>
                  <IconButton
                    onClick={() => setProfilePictureDialogOpen(true)}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: theme.palette.text.secondary,
                      color: "white",
                      "&:hover": {
                        bgcolor: theme.palette.secondary.dark,
                      },
                    }}
                    size="small"
                  >
                    <CameraIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid>
                <Stack spacing={1}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AdminIcon color="primary" />
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      Administrator
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body1" color="text.secondary">
                      {user.email}
                    </Typography>
                    {user.emailVerified && (
                      <Chip
                        icon={<VerifiedIcon />}
                        label="Verified"
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>

            {/* <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteAccount}
                  sx={{ minWidth: 120 }}
                >
                  Delete Account
                </Button>
              </Box>
            </Grid> */}
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Admin Information Cards */}
          <Grid container spacing={3}>
            {/* Account Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${theme.palette.primary.light}20`,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  Account Information
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip
                      label="Administrator"
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Account Activity */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${theme.palette.primary.light}20`,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  Account Activity
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(user.updatedAt)}
                    </Typography>
                  </Box>

                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Admin Permissions Section */}
          {user.adminPermissions && (
            <>
              <Divider sx={{ my: 4 }} />
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${theme.palette.primary.light}20`,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  Admin Permissions
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Manage Companies
                      </Typography>
                      <Chip
                        label={user.adminPermissions.canManageCompanies ? "Yes" : "No"}
                        color={user.adminPermissions.canManageCompanies ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Manage Users
                      </Typography>
                      <Chip
                        label={user.adminPermissions.canManageUsers ? "Yes" : "No"}
                        color={user.adminPermissions.canManageUsers ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Manage Jobs
                      </Typography>
                      <Chip
                        label={user.adminPermissions.canManageJobs ? "Yes" : "No"}
                        color={user.adminPermissions.canManageJobs ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        View Analytics
                      </Typography>
                      <Chip
                        label={user.adminPermissions.canViewAnalytics ? "Yes" : "No"}
                        color={user.adminPermissions.canViewAnalytics ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </Paper>

        {/* Profile Picture Change Dialog */}
        <Dialog
          open={profilePictureDialogOpen}
          onClose={() => setProfilePictureDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Profile Picture</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Avatar
                src={selectedFile ? URL.createObjectURL(selectedFile) : `${process.env.NEXT_PUBLIC_API_URL}/uploads/images${user.profilePicture}`}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: theme.palette.primary.main,
                  mx: "auto",
                  mb: 2
                }}
              >
                {user.firstName?.[0] ?? "A"}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="profile-picture-input">
                <Button variant="outlined" component="span" startIcon={<CameraIcon />}>
                  Choose New Picture
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProfilePictureDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProfilePictureChange}
              variant="contained"
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Update Picture"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 2, sm: 3 },
              width: { xs: 'calc(100% - 32px)', sm: 'auto' }
            }
          }}
        >
          <DialogTitle id="delete-dialog-title" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Delete Account
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone!
            </Alert>
            <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Are you sure you want to delete your account{" "}
              <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
            </Typography>
            <Typography color="error" fontWeight="bold" sx={{
              mt: 2,
              fontSize: { xs: "0.75rem", sm: "0.875rem" }
            }}>
              This will permanently remove your account and all your data.
            </Typography>
          </DialogContent>
          <DialogActions sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            p: { xs: 2, sm: 3 }
          }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
              fullWidth={false}
              size="medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleteLoading}
              startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
              fullWidth={false}
              size="medium"
            >
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default AdminProfilePage;