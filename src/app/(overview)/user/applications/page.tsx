"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Fab, Paper } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import ApplicationFormDialog from "@/components/ApplicationFormDialog";
import ApplicationList from "@/components/ApplicationListComponent";
import { Job } from "@/types/Job";

const ApplicationsPage: React.FC = () => {
    const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const handleOpenApplicationDialog = (job: Job | null) => {
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
            <Box sx={{ 
                position: "relative", 
                zIndex: 2,
                width: '100%',
                minHeight: '100vh',
                p: { xs: 0, sm: 1, md: 2 },
                boxSizing: 'border-box'
            }}>
                <Paper
                    elevation={6}
                    sx={{
                        width: '100%',
                        minHeight: { xs: '100vh', sm: 'auto' },
                        borderRadius: { xs: 0, sm: 2, md: 3 },
                        backdropFilter: "blur(12px)",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                        boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        // Custom breakpoints for very small screens
                        '@media (max-width: 480px)': {
                            borderRadius: 0,
                            minHeight: '100vh',
                            boxShadow: 'none'
                        },
                        '@media (max-width: 240px)': {
                            borderRadius: 0,
                            minHeight: '100vh',
                            boxShadow: 'none',
                            background: 'rgba(255,255,255,0.95)'
                        }
                    }}
                >
                    {/* Header Section */}
                    <Box sx={{ 
                        p: { xs: 1, sm: 2, md: 3 },
                        pb: { xs: 1, sm: 2 },
                        borderBottom: { xs: 'none', sm: '1px solid rgba(0,0,0,0.1)' },
                        flexShrink: 0,
                        // Custom breakpoints
                        '@media (max-width: 480px)': {
                            p: 0.75,
                            pb: 0.5
                        },
                        '@media (max-width: 240px)': {
                            p: 0.5,
                            pb: 0.25
                        }
                    }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 600,
                                fontSize: { 
                                    xs: '1.1rem', 
                                    sm: '1.5rem', 
                                    md: '1.75rem', 
                                    lg: '2rem' 
                                },
                                textAlign: { xs: 'center', sm: 'left' },
                                color: 'text.primary',
                                // Custom breakpoints
                                '@media (max-width: 480px)': {
                                    fontSize: '1rem'
                                },
                                '@media (max-width: 240px)': {
                                    fontSize: '0.9rem'
                                }
                            }}
                        >
                            My Applications
                        </Typography>
                    </Box>

                    {/* Content Section */}
                    <Box sx={{ 
                        flex: 1,
                        overflow: 'auto',
                        p: { xs: 1, sm: 2, md: 3 },
                        pt: { xs: 1, sm: 2 },
                        // Custom breakpoints
                        '@media (max-width: 480px)': {
                            p: 0.75,
                            pt: 0.5
                        },
                        '@media (max-width: 240px)': {
                            p: 0.5,
                            pt: 0.25
                        }
                    }}>
                        <ApplicationList onRefresh={handleApplicationSuccess} />
                    </Box>
                </Paper>

                <ApplicationFormDialog
                    open={applicationDialogOpen}
                    onClose={handleCloseApplicationDialog}
                    job={selectedJob}
                    onSuccess={handleApplicationSuccess}
                />
            </Box>
        </>
    );
};

export default ApplicationsPage;