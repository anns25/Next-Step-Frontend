"use client";

import React from "react";
import {
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Skeleton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Stack,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

export function JobAlertsSkeleton() {
    return (
        <Box sx={{ position: "relative", zIndex: 2 }}>
            <Paper
                elevation={6}
                sx={{
                    p: { xs: 2, sm: 3, md: 6 },
                    borderRadius: { xs: 2, md: 3 },
                    backdropFilter: "blur(12px)",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                    boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                }}
            >
                {/* Header Skeleton */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                            <Skeleton variant="text" width={200} height={40} />
                            <Skeleton variant="text" width={250} height={20} sx={{ mt: 1 }} />
                        </Box>
                    </Box>
                    <Skeleton variant="rounded" width={150} height={40} />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Stats Skeleton */}
                <Box sx={{ mb: 3 }}>
                    <Skeleton variant="text" width={300} height={20} />
                </Box>

                {/* Alerts List Skeleton */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[1, 2, 3].map((item) => (
                        <Accordion
                            key={item}
                            disabled
                            sx={{
                                borderRadius: 2,
                                background: "rgba(255,255,255,0.3)",
                                boxShadow: "0 4px 20px rgba(20,30,60,0.08)",
                                border: "2px solid rgba(158, 158, 158, 0.3)",
                                "&:before": { display: "none" },
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                    <Skeleton variant="text" width={200} height={28} sx={{ mb: 1 }} />
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <Skeleton variant="rounded" width={80} height={24} />
                                        <Skeleton variant="rounded" width={100} height={24} />
                                    </Box>
                                </Box>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Divider sx={{ mb: 2 }} />
                                <Skeleton variant="text" width={250} height={24} sx={{ mb: 2 }} />

                                <Grid container spacing={2}>
                                    {[1, 2].map((job) => (
                                        <Grid size={{ xs: 12 }} key={job}>
                                            <Card
                                                sx={{
                                                    borderRadius: 2,
                                                    background: "rgba(255,255,255,0.5)",
                                                }}
                                            >
                                                <CardContent>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Skeleton variant="text" width={300} height={28} sx={{ mb: 1 }} />
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                            <Skeleton variant="circular" width={20} height={20} />
                                                            <Skeleton variant="text" width={200} height={18} />
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                <Skeleton variant="circular" width={20} height={20} />
                                                                <Skeleton variant="text" width={100} height={18} />
                                                            </Box>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                <Skeleton variant="circular" width={20} height={20} />
                                                                <Skeleton variant="text" width={120} height={18} />
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Skeleton variant="rounded" width={80} height={24} />
                                                            <Skeleton variant="rounded" width={90} height={24} />
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                                <CardActions sx={{ px: 2, pb: 2 }}>
                                                    <Skeleton variant="rounded" width={120} height={36} />
                                                    <Skeleton variant="rounded" width={100} height={36} />
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
}

export function ProfileSkeleton() {
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
              <Skeleton variant="circular" width={96} height={96} />
            </Grid>
            <Grid>
              <Skeleton variant="text" width={250} height={44} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={200} height={20} sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="text" width={180} height={20} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
              <Box sx={{ width: "60%", minWidth: 160 }}>
                <Skeleton variant="text" width={140} height={18} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="100%" height={10} />
              </Box>
              <Skeleton variant="rounded" width={140} height={40} />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3}>
          {/* Left column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              {/* Basic Info Skeleton */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {[1, 2, 3, 4].map((item) => (
                    <Box key={item} display="flex" justifyContent="space-between">
                      <Skeleton variant="text" width={100} height={18} />
                      <Skeleton variant="text" width={120} height={18} />
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Skills Skeleton */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Skeleton variant="text" width={100} height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} variant="rounded" width={80} height={32} />
                  ))}
                </Box>
              </Paper>

              {/* Education Skeleton */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {[1, 2].map((item) => (
                    <Box key={item}>
                      <Skeleton variant="text" width={200} height={20} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width={220} height={18} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width={180} height={16} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Right column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              {/* Experience Skeleton */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Skeleton variant="text" width={130} height={28} sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {[1, 2].map((item) => (
                    <Box
                      key={item}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      py={1}
                    >
                      <Box flex={1}>
                        <Skeleton variant="text" width={150} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width={120} height={18} />
                      </Box>
                      <Skeleton variant="text" width={120} height={18} />
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Preferences Skeleton */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Skeleton variant="text" width={130} height={28} sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {[1, 2, 3].map((item) => (
                    <Box key={item} display="flex" justifyContent="space-between">
                      <Skeleton variant="text" width={100} height={18} />
                      <Skeleton variant="text" width={140} height={18} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}