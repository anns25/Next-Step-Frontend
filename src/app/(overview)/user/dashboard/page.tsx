"use client";

import React, { Suspense } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Avatar,
  Chip,
  useTheme,
  Stack,
  Divider,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  EventAvailable as EventAvailableIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import useSWR from "swr";
import { useAuth } from "@/contexts/authContext";
import { Application, ApplicationStats } from "@/types/Application";
import { getApplicationStats, getUserApplications } from "@/lib/api/applicationAPI";
import DashboardSkeleton from "@/components/DashboardSkeleton";


// Define stats interface
interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  color: string;
}

// Separate component for dashboard content
function DashboardContent() {
  const { user } = useAuth();
  const theme = useTheme();

  // Fetch stats with SWR
  const { data: stats, error: statsError } = useSWR<ApplicationStats>(
    'application-stats',
    getApplicationStats,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  // Fetch recent applications with SWR
  const { data: applicationsData, error: applicationsError } = useSWR(
    'recent-applications',
    () => getUserApplications({ limit: 5, sortBy: 'applicationDate', sortOrder: 'desc' }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  );

  const recentApplications = applicationsData?.applications || [];
  const error = statsError || applicationsError;

  // Calculate derived stats
  const getStatsData = (): StatItem[] => {
    if (!stats) return [];

    const totalApplications = stats.totalApplications || 0;
    const activeApplications = (stats.underReview || 0) + (stats.shortlisted || 0) + (stats.interviewScheduled || 0) + (stats.interviewed || 0);
    const interviewsScheduled = stats.interviewScheduled || 0;
    const offersReceived = stats.accepted || 0;
    const pendingResponses = stats.applied || 0;
    const recentApps = stats.recentApplications || 0;

    return [
      {
        title: "Total Applications",
        value: totalApplications.toString(),
        change: `${recentApps} this month`,
        icon: <AssignmentIcon />,
        color: "#1976d2",
      },
      {
        title: "Active Applications",
        value: activeApplications.toString(),
        change: `${totalApplications > 0 ? Math.round((activeApplications / totalApplications) * 100) : 0}% of total`,
        icon: <WorkIcon />,
        color: "#2e7d32",
      },
      {
        title: "Interviews Scheduled",
        value: interviewsScheduled.toString(),
        change: interviewsScheduled > 0 ? "Great progress!" : "Keep applying",
        icon: <EventAvailableIcon />,
        color: "#ed6c02",
      },
      {
        title: "Offers Received",
        value: offersReceived.toString(),
        change: totalApplications > 0 ? `${Math.round((offersReceived / totalApplications) * 100)}% conversion` : "0% conversion",
        icon: <CheckCircleIcon />,
        color: "#4caf50",
      },
      {
        title: "Pending Responses",
        value: pendingResponses.toString(),
        change: `Avg ${stats.avgResponseTime ? Math.round(stats.avgResponseTime) : 0} days`,
        icon: <ScheduleIcon />,
        color: "#f57c00",
      },
      {
        title: "Recent Applications",
        value: recentApps.toString(),
        change: "This month",
        icon: <TrendingUpIcon />,
        color: "#9c27b0",
      },
    ];
  };

  // Calculate progress percentages
  const getProgressData = () => {
    if (!stats) return { applied: 0, underReview: 0, interview: 0, offers: 0 };

    const total = stats.totalApplications || 0;
    if (total === 0) return { applied: 0, underReview: 0, interview: 0, offers: 0 };

    return {
      applied: 100,
      underReview: Math.round(((stats.underReview || 0) / total) * 100),
      interview: Math.round(((stats.interviewScheduled || 0) + (stats.interviewed || 0)) / total * 100),
      offers: Math.round(((stats.accepted || 0) / total) * 100),
    };
  };

  if (error) {
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
          <Alert severity="error" icon={<ErrorIcon />}>
            {error instanceof Error ? error.message : 'Failed to load dashboard data'}
          </Alert>
        </Paper>
      </Box>
    );
  }

  const statsData = getStatsData();
  const progressData = getProgressData();

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
                src={user?.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${user.profilePicture}` : undefined}
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
              <LinearProgress 
                variant="determinate" 
                value={progressData.applied} 
                sx={{ height: 8, borderRadius: 4, mb: 1 }} 
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {stats?.totalApplications || 0} applications
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Under Review
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progressData.underReview} 
                sx={{ height: 8, borderRadius: 4, mb: 1 }} 
                color="warning" 
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {stats?.underReview || 0} applications
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Interview
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progressData.interview} 
                sx={{ height: 8, borderRadius: 4, mb: 1 }} 
                color="info" 
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {(stats?.interviewScheduled || 0) + (stats?.interviewed || 0)} applications
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Offers
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progressData.offers} 
                sx={{ height: 8, borderRadius: 4, mb: 1 }} 
                color="success" 
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {stats?.accepted || 0} offers
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Applications Section */}
        {recentApplications.length > 0 && (
          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderRadius: 3,
              backdropFilter: "blur(12px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
              boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Recent Applications
            </Typography>
            <Stack spacing={2}>
              {recentApplications.slice(0, 3).map((application) => (
                <Box key={application._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {application.job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.company.name} • Applied {new Date(application.applicationDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip 
                    label={application.status.replace('-', ' ').toUpperCase()} 
                    size="small" 
                    color={application.status === 'accepted' ? 'success' : application.status === 'rejected' ? 'error' : 'primary'}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        )}
      </Paper>
    </Box>
  );
}

// Main component with Suspense
export default function UserDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}