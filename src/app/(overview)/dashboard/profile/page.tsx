"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";


import { useTheme } from "@mui/material/styles";
import { User } from "@/types/User";
import { deleteUserAccount, getMyProfile, updateMyProfile } from "@/lib/api/userAPI";
import EditUserDialog from "@/components/EditUserDialog";
import { useAuth } from "@/contexts/authContext";
import { Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";



// Define a type for applications
type Application = {
  id: string;
  title: string;
  company: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  dateApplied: string;
  notes?: string;
};

// Mock data
const mockApplications: Application[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Google",
    status: "Interview",
    dateApplied: "2025-09-05",
    notes: "Prepare for React & system design.",
  },
  {
    id: "2",
    title: "Backend Engineer",
    company: "Amazon",
    status: "Applied",
    dateApplied: "2025-09-10",
  },
  {
    id: "3",
    title: "Fullstack Developer",
    company: "Microsoft",
    status: "Rejected",
    dateApplied: "2025-08-28",
    notes: "Rejected after online test.",
  },
  {
    id: "4",
    title: "Software Engineer Intern",
    company: "OpenAI",
    status: "Offer",
    dateApplied: "2025-09-01",
    notes: "Offer received 🎉",
  },
];



const ProfilePage = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [editOpen, setEditOpen] = useState(false);
  const [editValues, setEditValues] = useState<Partial<User>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [notesValue, setNotesValue] = useState("");
  const router = useRouter();


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


  const openEdit = () => {
    if (!user) return; // stop if null
    setEditValues(user);
    setAvatarPreview(user.profilePicture ?? null);
    setEditOpen(true);
  };


  const formatDate = (date?: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };


  const closeEdit = () => {
    if (!user) return; // stop if null
    setEditOpen(false);
    setAvatarPreview(user.profilePicture ?? null);
  }

  const handleSaveProfile = async (file?: File | null) => {
    try {
      const updated = await updateMyProfile(editValues, file ?? undefined);
      if (updated) {
        setUser(updated);
      }
    } finally {
      setEditOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount();

      deleteCookie('token');
      deleteCookie('userData');
      router.push('/login');

    } catch (error) {
      console.error('Delete account failed', error);
    }
  }



  const completion = useMemo(() => {
    if (!user) return 0;
    const weightedFields = [
      { value: !!user.firstName, weight: 1 },
      { value: !!user.lastName, weight: 1 },
      { value: !!user.email, weight: 1 },
      { value: !!user.profilePicture, weight: 2 },   // profile picture more important
      { value: !!user.resumeHeadline, weight: 2 },
      { value: !!(user.skills?.length), weight: 3 },
      { value: !!(user.experience?.length), weight: 3 },
      { value: !!(user.education?.length), weight: 2 },
      { value: !!user.location?.city, weight: 2 },
      { value: !!user.preferences?.jobTypes?.length, weight: 2 },
    ];

    const totalWeight = weightedFields.reduce((sum, f) => sum + f.weight, 0);
    const achieved = weightedFields.reduce((sum, f) => sum + (f.value ? f.weight : 0), 0);

    const completion = Math.round((achieved / totalWeight) * 100);
    return completion;

  }, [user]);

  // --- safe conditional UI handling ---
  if (loading) return <Typography>Loading profile...</Typography>;
  if (!user) return <Typography>Error loading profile</Typography>;


  return (

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
        {/* ✅ Profile Header */}
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }} container spacing={2} alignItems="center">
            <Grid>
              <Avatar
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.profilePicture}`}
                sx={{ width: 96, height: 96, bgcolor: theme.palette.secondary.main }}
              >
                {user.firstName?.[0] ?? "U"}
              </Avatar>
            </Grid>
            <Grid>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="#3a4b59">
                {user.email}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                {user.location?.city && (
                  <Typography variant="body2" color="#3a4b59">
                    {user.location.city}, {user.location.country}
                  </Typography>
                )}
                {user.emailVerified && (
                  <Chip label="Verified" size="small" color="primary" sx={{ ml: 1 }} />
                )}
              </Stack>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
              <Box sx={{ width: "60%", minWidth: 160 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Profile Completion
                </Typography>
                <Box sx={{ height: 10, background: "#e9eef5", borderRadius: 6, mt: 1, overflow: "hidden" }}>
                  <Box
                    sx={{
                      height: "100%",
                      width: `${completion}%`,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || "#0b5dc7"})`,
                    }}
                  />
                </Box>
              </Box>
              <Button variant="contained" startIcon={<EditIcon />} onClick={openEdit}>
                Edit Profile
              </Button>
            </Box>
          </Grid>
        </Grid>


        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3}>
          {/* Left column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>

              {/* Basic Info */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Stack spacing={1}>
                  {/* Info rows */}
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      First Name
                    </Typography>
                    <Typography>{user.firstName}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Last Name
                    </Typography>
                    <Typography>{user.lastName}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Work Status
                    </Typography>
                    <Typography>{user.workStatus}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Resume Headline
                    </Typography>
                    <Typography sx={{ maxWidth: 160, textAlign: "right" }}>
                      {user.resumeHeadline}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Skills Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Skills
                </Typography>
                {user.skills && user.skills.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {user.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{
                          mb: 1,
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No skills added yet
                  </Typography>
                )}
              </Paper>



              {/* Education */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Education
                </Typography>
                {(user.education || []).map((edu, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{edu.institution}</Typography>
                    <Typography variant="body2">
                      {edu.degree} - {edu.fieldOfStudy}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                    >
                      {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Stack>
          </Grid>

          {/* Right column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              {/* Experience */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Experience
                </Typography>
                <Stack spacing={1}>
                  {(user.experience || []).map((exp, idx) => (
                    <Box
                      key={idx}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                    >
                      <Box>
                        <Typography variant="subtitle2">{exp.position}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exp.company}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(exp.startDate)} –{" "}
                        {formatDate(exp.endDate) || "Present"}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Preferences */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Preferences
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Job Types
                    </Typography>
                    <Typography>
                      {user.preferences?.jobTypes?.length
                        ? user.preferences?.jobTypes.join(", ")
                        : "Not Specified"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Salary Range
                    </Typography>
                    <Typography>
                      {user.preferences?.salaryRange?.min &&
                        user.preferences?.salaryRange?.max
                        ? `${user.preferences.salaryRange.currency} ${user.preferences.salaryRange.min?.toLocaleString()} - ${user.preferences.salaryRange.max?.toLocaleString()}`
                        : "Not Specified"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Remote
                    </Typography>
                    <Typography>
                      {user.preferences?.remoteWork ? "Yes" : "No"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

      </Paper>

      {/* Edit Profile Dialog */}
      <EditUserDialog open={editOpen} onClose={closeEdit} user={user} values={editValues} setValues={setEditValues} onSave={handleSaveProfile} onDeleteAccount={handleDeleteAccount} />
    </Box>

  );
}

export default ProfilePage;
