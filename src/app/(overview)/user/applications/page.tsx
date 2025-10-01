"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Fab, Paper } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import ApplicationFormDialog from "@/components/ApplicationFormDialog";
import ApplicationList from "@/components/ApplicationListComponent";

const ApplicationsPage: React.FC = () => {
    const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const handleOpenApplicationDialog = (job: any) => {
        setSelectedJob(job);
        setApplicationDialogOpen(true);
    };

    const handleCloseApplicationDialog = () => {
        setApplicationDialogOpen(false);
        setSelectedJob(null);
    };

    const handleApplicationSuccess = () => {
        // Refresh the application list
        window.location.reload(); // Or use a more sophisticated state management
    };

    return (
        <>
            <Box sx={{ position: "relative", zIndex: 2 }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 1.5, sm: 2, md: 3, lg: 4 },
                        borderRadius: { xs: 2, md: 3 },
                        backdropFilter: "blur(12px)",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                        boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                        mx: { xs: 1, sm: 2, md: 0 },
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                My Applications
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenApplicationDialog(null)}
                                sx={{
                                    background: "linear-gradient(135deg, #1976d2, #1565c0)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1565c0, #1976d2)",
                                    },
                                }}
                            >
                                New Application
                            </Button>
                        </Box>

                        <ApplicationList onRefresh={handleApplicationSuccess} />




                        <ApplicationFormDialog
                            open={applicationDialogOpen}
                            onClose={handleCloseApplicationDialog}
                            job={selectedJob}
                            onSuccess={handleApplicationSuccess}
                        />
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default ApplicationsPage;