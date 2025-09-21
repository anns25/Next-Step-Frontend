"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

import { useAuth } from '@/contexts/authContext';
import AdminLayout from '@/components/AdminLayout';

// Define the proper type for stats
interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  color: string;
}

// Mock data with proper typing
const stats: StatItem[] = [
  {
    title: 'Total Companies',
    value: '24',
    change: '+12%',
    icon: <BusinessIcon />,
    color: '#1976d2',
  },
  {
    title: 'Pending Approvals',
    value: '5',
    change: '+2',
    icon: <PendingIcon />,
    color: '#ed6c02',
  },
  {
    title: 'Active Jobs',
    value: '156',
    change: '+8%',
    icon: <WorkIcon />,
    color: '#2e7d32',
  },
  {
    title: 'Total Applications',
    value: '3,456',
    change: '+23%',
    icon: <AssignmentIcon />,
    color: '#9c27b0',
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatItem[]>(stats);

  useEffect(() => {
    // Fetch dashboard stats from API
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // const response = await fetch('/api/admin/dashboard/stats');
      // const data = await response.json();
      // setStatsData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Admin Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid size={{xs: 12, sm : 6, md : 3}} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}20`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: stat.color + '20',
                        color: stat.color,
                        mr: 2,
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#2e7d32', mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                      {stat.change} from last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Rest of your component */}
      </Box>
    </AdminLayout>
  );
}