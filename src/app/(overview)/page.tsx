"use client";

import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Button,
    Box,
    Grid,
    Card,
    Avatar,
    Link as MuiLink,
    Paper,
    useTheme,
} from "@mui/material";
import { Briefcase, Building2, Users, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    const theme = useTheme();
    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundImage: "url('/office.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to bottom, rgba(17,24,39,0.45), rgba(17,24,39,0.25))",
                    zIndex: 1,
                },
            }}
        >
            {/* IMPROVED NAVBAR */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    zIndex: 2,
                    // background: "rgba(255,255,255,0.15)",
                    // backdropFilter: "blur(14px)",
                    // color: "#fff",
                    // borderBottom: "1px solid rgba(255,255,255,0.2)",
                    // boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
            >
                <Toolbar
                    sx={{
                        justifyContent: "space-between",
                        py: 1,
                        zIndex: 2,
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(14px)",
                        color: "#fff",
                        borderBottom: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                    }}>
                    {/* Logo + Brand */}
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            component="img"
                            src="/NextStepLogo.png"
                            alt="NextStep Logo"
                            sx={{
                                width: { xs: 32, md: 40 },
                                height: { xs: 32, md: 40 },
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                                zIndex: 3
                            }}
                        />
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                        >
                            <Box component="span" sx={{ color: "#fff" }}>Next</Box>
                            <Box component="span" sx={{ color: "primary.main", ml: 0.5 }}>Step</Box>
                        </Typography>
                    </Box>

                    {/* Nav Links */}
                    <Box display={{ xs: "none", md: "flex" }} gap={4}>
                        {[
                            { href: "/jobs", label: "Jobs" },
                            { href: "/companies", label: "Companies" },
                            { href: "/about", label: "About" }
                        ].map((link) => (
                            <MuiLink
                                key={link.href}
                                component={Link}
                                href={link.href}
                                sx={{
                                    color: "#fff",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    position: "relative",
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    transition: "all 0.3s ease",
                                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                    "&:hover": {
                                        background: "rgba(255,255,255,0.15)",
                                        transform: "translateY(-1px)",
                                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                    }
                                }}
                            >
                                {link.label}
                            </MuiLink>
                        ))}
                    </Box>

                    {/* Auth Buttons */}
                    <Box display="flex" gap={2}>
                        <Button
                            component={Link}
                            href="/login"
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                borderColor: "rgba(255,255,255,0.6)",
                                color: "#fff",
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                backdropFilter: "blur(10px)",
                                background: "rgba(255,255,255,0.1)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#fff",
                                    background: "rgba(255,255,255,0.2)",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            Sign In
                        </Button>
                        <Button
                            component={Link}
                            href="/signup"
                            variant="contained"
                            sx={{
                                borderRadius: 3,
                                bgcolor: "primary.main",
                                fontWeight: 600,
                                color: "#fff",
                                px: 3,
                                py: 1,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    bgcolor: "primary.dark",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                                },
                            }}
                        >
                            Get Started
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* HERO */}
            <Container
                sx={{
                    py: { xs: 8, md: 14 },
                    position: "relative",
                    zIndex: 2,
                    textAlign: "center",
                }}
            >
                <Paper
                    elevation={4}
                    sx={{
                        p: { xs: 4, md: 8 },
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(14px)",
                        color: "#fff",
                        maxWidth: "800px",
                        mx: "auto",
                    }}
                >
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                        Your Career Journey Starts <Box component="span" color="primary.main">Here</Box>
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
                        Track your applications, manage interviews, and land your dream job.
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                        <Button
                            component={Link}
                            href="/signup"
                            size="large"
                            variant="contained"
                            endIcon={<ArrowRight />}
                            sx={{
                                borderRadius: 3,
                                px: 5,
                                py: 1.5,
                                fontWeight: 600,
                            }}
                        >
                            Start Free
                        </Button>
                        <Button
                            component={Link}
                            href="/jobs"
                            size="large"
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                px: 5,
                                py: 1.5,
                                fontWeight: 600,
                                borderColor: "rgba(255,255,255,0.7)",
                                color: "#fff",
                                "&:hover": { borderColor: "#fff", background: "rgba(255,255,255,0.15)" },
                            }}
                        >
                            Browse Jobs
                        </Button>
                    </Box>
                </Paper>
            </Container>

            {/* FEATURES */}
            <Container sx={{ py: 12, position: "relative", zIndex: 2 }}>
                <Grid container spacing={4}>
                    {[
                        {
                            icon: <Briefcase />,
                            title: "Track Applications",
                            desc: "Stay on top of every application with a clear dashboard.",
                        },
                        {
                            icon: <Building2 />,
                            title: "Company Insights",
                            desc: "Research culture, salaries, and open roles in one place.",
                        },
                        {
                            icon: <Users />,
                            title: "Smart Alerts",
                            desc: "Get notified instantly when jobs match your skills.",
                        },
                        {
                            icon: <TrendingUp />,
                            title: "Analytics",
                            desc: "Visualize progress and optimize your job strategy.",
                        },
                    ].map((f, i) => (
                        <Grid size={{ xs: 12, md: 6, lg: 3 }} key={i}>
                            <Card
                                sx={{
                                    textAlign: "center",
                                    p: 3,
                                    borderRadius: 3,
                                    background: "rgba(255,255,255,0.12)",
                                    backdropFilter: "blur(12px)",
                                    color: "#fff",
                                    height: "100%",
                                }}
                            >
                                <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 2 }}>{f.icon}</Avatar>
                                <Typography variant="h6" fontWeight={600}>
                                    {f.title}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
                                    {f.desc}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA */}
            <Box sx={{ py: 10, textAlign: "center", position: "relative", zIndex: 2 }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 4,
                        maxWidth: "650px",
                        mx: "auto",
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(14px)",
                        color: "#fff",
                    }}
                >
                    <Typography variant="h4" fontWeight={700} mb={2}>
                        Ready to Take the Next Step?
                    </Typography>
                    <Typography variant="h6" mb={4} sx={{ opacity: 0.95 }}>
                        Join thousands of professionals who track their job search with NextStep.
                    </Typography>
                    <Button
                        component={Link}
                        href="/signup"
                        size="large"
                        variant="contained"
                        endIcon={<CheckCircle />}
                        sx={{
                            borderRadius: 3,
                            px: 6,
                            py: 1.5,
                            fontWeight: 600,
                        }}
                    >
                        Create Account
                    </Button>
                </Paper>
            </Box>

            {/* FOOTER */}
            <Box
                sx={{
                    py: 4,
                    borderTop: "1px solid rgba(255,255,255,0.25)",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.9rem",
                    position: "relative",
                    zIndex: 2,
                }}
            >
                © {new Date().getFullYear()} NextStep. All rights reserved.
            </Box>
        </Box>
    );
}