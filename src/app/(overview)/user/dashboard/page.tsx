"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  useTheme,
  Stack,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  EventAvailable as EventAvailableIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";

import { useAuth } from "@/contexts/authContext";

// Define stats interface
interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  color: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  // Mock stats data - replace with API calls later
  const statsData: StatItem[] = [
    {
      title: "Total Applications",
      value: "12",
      change: "3 this week",
      icon: <AssignmentIcon />,
      color: "#1976d2",
    },
    {
      title: "Active Applications",
      value: "8",
      change: "67% of total",
      icon: <WorkIcon />,
      color: "#2e7d32",
    },
    {
      title: "Interviews Scheduled",
      value: "3",
      change: "2 this week",
      icon: <EventAvailableIcon />,
      color: "#ed6c02",
    },
    {
      title: "Saved Jobs",
      value: "15",
      change: "5 new matches",
      icon: <BookmarkIcon />,
      color: "#9c27b0",
    },
    {
      title: "Pending Responses",
      value: "5",
      change: "Avg 7 days",
      icon: <ScheduleIcon />,
      color: "#f57c00",
    },
    {
      title: "Offers Received",
      value: "1",
      change: "8% conversion",
      icon: <CheckCircleIcon />,
      color: "#4caf50",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

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
        {/* Profile Header */}
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }} container spacing={2} alignItems="center">
            <Grid>
              <Avatar
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${user?.profilePicture}`}
                sx={{ width: 96, height: 96, bgcolor: theme.palette.secondary.main }}
              >
                {user?.firstName?.[0] ?? "U"}
              </Avatar>
            </Grid>
            <Grid>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Welcome {user?.firstName}
              </Typography>
              <Typography variant="body2" color="#3a4b59">
                {user?.email}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                {user?.location?.city && (
                  <Typography variant="body2" color="#3a4b59">
                    {user?.location.city}, {user?.location.country}
                  </Typography>
                )}
                {user?.emailVerified && (
                  <Chip label="Verified" size="small" color="primary" sx={{ ml: 1 }} />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Your Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={index}>
              <Paper
                elevation={6}
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: 3,
                  backdropFilter: "blur(12px)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                  boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                  border: `1px solid ${stat.color}40`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: stat.color + "22",
                      color: stat.color,
                      mr: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: "#2e7d32", mr: 0.5 }} />
                  <Typography variant="body2" sx={{ color: "#2e7d32", fontWeight: 500 }}>
                    {stat.change}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Application Progress Section */}
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 3,
            backdropFilter: "blur(12px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
            boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Application Progress
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Applied
              </Typography>
              <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>12 applications</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Under Review
              </Typography>
              <LinearProgress variant="determinate" value={66} sx={{ height: 8, borderRadius: 4, mb: 1 }} color="warning" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>8 applications</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Interview
              </Typography>
              <LinearProgress variant="determinate" value={33} sx={{ height: 8, borderRadius: 4, mb: 1 }} color="info" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>4 applications</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Offers
              </Typography>
              <LinearProgress variant="determinate" value={8} sx={{ height: 8, borderRadius: 4, mb: 1 }} color="success" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>1 offer</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Paper>
    </Box>
  );
}