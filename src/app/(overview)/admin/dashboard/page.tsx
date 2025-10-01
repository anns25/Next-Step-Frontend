'use client'
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Pending as PendingIcon,
  PersonAdd as PersonAddIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from '@mui/icons-material';

import { useAuth } from '@/contexts/authContext';
import AdminLayout from '@/components/AdminSidebarLayout';
import { getAdminDashboardStats } from '@/lib/api/adminAPI';


// Define the backend response type
interface AdminStats {
  totalCompanies: number;
  activeCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
  totalApplications: number;
  recentApplications: number;
}

// Define the proper type for stats
interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  color: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatItem[]>([]);
  const [backendStats, setBackendStats] = useState<AdminStats | null>(null);
  const theme = useTheme();

  useEffect(() => {
    // Fetch dashboard stats from API
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardStats();
      
      if (data) {
        setBackendStats(data);
        // Transform backend data to match your current UI structure
        const transformedStats: StatItem[] = [
          {
            title: 'Total Companies',
            value: data.totalCompanies.toString(),
            change: `${data.activeCompanies}/${data.totalCompanies} active`,
            icon: <BusinessIcon />,
            color: '#1976d2',
          },
          {
            title: 'Active Companies',
            value: data.activeCompanies.toString(),
            change:  data.totalCompanies > 0 ? `${Math.round((data.activeCompanies / data.totalCompanies) * 100)}% active` : '0% active',
            icon: <PendingIcon />,
            color: '#ed6c02',
          },
          {
            title: 'Total Jobs',
            value: data.totalJobs.toString(),
            change: `${data.activeJobs}/${data.totalJobs} active`,
            icon: <WorkIcon />,
            color: '#2e7d32',
          },
          {
            title: 'Active Jobs',
            value: data.activeJobs.toString(),
            change: data.totalJobs > 0 ? `${Math.round((data.activeJobs / data.totalJobs) * 100)}% of total` : '0% of total',
            icon: <AssignmentTurnedInIcon />,
            color: '#4caf50',
          },
          {
            title: 'Total Users',
            value: data.totalUsers.toString(),
            change:  `${data.totalApplications}/${data.totalUsers} avg applications`,
            icon: <PeopleIcon />,
            color: '#9c27b0',
          },
          {
            title: 'Total Applications',
            value: data.totalApplications.toString(),
            change: `${data.recentApplications} this week`,
            icon: <AssignmentIcon />,
            color: '#f57c00',
          },
          {
            title: 'Recent Applications',
            value: data.recentApplications.toString(),
            change: data.totalApplications > 0 ? `${Math.round((data.recentApplications / data.totalApplications) * 100)}% of total` : '0% of total',
            icon: <ScheduleIcon />,
            color: '#e91e63',
          },
        ];
        setStatsData(transformedStats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
        {/* ✅ Profile Header */}
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }} container spacing={2} alignItems="center">
            <Grid>
              <Avatar
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${user?.profilePicture}`}
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
          Admin Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} key={index}>
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
      </Paper>
    </Box>
  );
}