"use client";

import React from "react";
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Divider,
} from "@mui/material";

export default function DashboardSkeleton() {
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
        {/* Profile Header Skeleton */}
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }} container spacing={2} alignItems="center">
            <Grid>
              <Skeleton variant="circular" width={96} height={96} />
            </Grid>
            <Grid>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={250} height={20} />
              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <Skeleton variant="text" width={150} height={20} />
                <Skeleton variant="rounded" width={70} height={24} />
              </Stack>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Skeleton variant="text" width={180} height={36} sx={{ mb: 3 }} />

        {/* Stats Cards Skeleton */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={item}>
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
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Skeleton variant="rounded" width={56} height={56} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={80} height={40} />
                    <Skeleton variant="text" width={120} height={20} />
                  </Box>
                </Box>
                <Skeleton variant="text" width={150} height={20} />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Application Progress Skeleton */}
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
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid size={{ xs: 12, md: 3 }} key={item}>
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="rounded" width="100%" height={8} sx={{ mb: 1, borderRadius: 4 }} />
                <Skeleton variant="text" width={120} height={20} />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Recent Applications Skeleton */}
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
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {[1, 2, 3].map((item) => (
              <Box
                key={item}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.5)",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width={250} height={24} />
                  <Skeleton variant="text" width={300} height={20} />
                </Box>
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Paper>
    </Box>
  );
}