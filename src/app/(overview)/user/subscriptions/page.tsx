"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    Switch,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Divider,
    Pagination,
    TextField,
    InputAdornment,
    Autocomplete,
} from "@mui/material";
import {
    Business as BusinessIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    NotificationsActive as ActiveIcon,
    NotificationsOff as InactiveIcon,
    Search as SearchIcon,
    Edit as EditIcon,
} from "@mui/icons-material";
import {
    getMySubscriptions,
    createSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    Subscription,
} from "@/lib/api/subscriptionAPI";
import { getAllCompanies } from "@/lib/api/companyAPI";
import { Company } from "@/types/Company";

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    // Company search
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companySearchTerm, setCompanySearchTerm] = useState("");

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "info",
    });

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await getMySubscriptions({ page: currentPage, limit });
            if (response) {
                setSubscriptions(response.subscriptions);
                setTotalPages(response.totalPages);
                setTotal(response.total);
            }
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
            setSnackbar({
                open: true,
                message: "Failed to fetch subscriptions",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async (searchTerm: string) => {
        try {
            const response = await getAllCompanies({ search: searchTerm, limit: 20 });
            if (response) {
                setCompanies(response.companies);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [currentPage]);

    useEffect(() => {
        if (companySearchTerm) {
            fetchCompanies(companySearchTerm);
        }
    }, [companySearchTerm]);

    const handleToggleStatus = async (subscriptionId: string) => {
        try {
            const response = await toggleSubscriptionStatus(subscriptionId);
            if (response) {
                setSnackbar({
                    open: true,
                    message: response.message,
                    severity: "success",
                });
                fetchSubscriptions();
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to toggle subscription",
                severity: "error",
            });
        }
    };

    const handleCreateSubscription = async () => {
        if (!selectedCompany) return;

        try {
            const response = await createSubscription({
                companyId: selectedCompany._id,
                jobTypes: [],
                experienceLevels: [],
                notificationPreferences: {
                    email: true,
                    push: false,
                    sms: false,
                },
            });

            if (response) {
                setSnackbar({
                    open: true,
                    message: "Successfully subscribed to company!",
                    severity: "success",
                });
                setCreateDialogOpen(false);
                setSelectedCompany(null);
                fetchSubscriptions();
            }
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Failed to subscribe",
                severity: "error",
            });
        }
    };

    const handleDeleteSubscription = async () => {
        if (!selectedSubscription) return;

        try {
            const response = await deleteSubscription(selectedSubscription._id);
            if (response) {
                setSnackbar({
                    open: true,
                    message: "Unsubscribed successfully",
                    severity: "success",
                });
                setDeleteDialogOpen(false);
                setSelectedSubscription(null);
                fetchSubscriptions();
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to unsubscribe",
                severity: "error",
            });
        }
    };

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
                {/* Header */}
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
                        <BusinessIcon sx={{ fontSize: 40, color: "primary.main" }} />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            Company Subscriptions
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Subscribe to Company
                    </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Get notified instantly when your favorite companies post new jobs
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Stats */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Total: {total} | Active: {subscriptions.filter((s) => s.isActive).length}
                </Typography>

                {/* Subscriptions List */}
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : subscriptions.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <BusinessIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            No subscriptions yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Subscribe to companies to get instant job alerts
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Subscribe to Your First Company
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {subscriptions.map((subscription) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={subscription._id}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: 3,
                                        background: "rgba(255,255,255,0.3)",
                                        border: subscription.isActive
                                            ? "2px solid rgba(76, 175, 80, 0.3)"
                                            : "2px solid rgba(158, 158, 158, 0.3)",
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    mr: 2,
                                                    bgcolor: "primary.main",
                                                }}
                                            >
                                                {subscription.company.logo ? (
                                                    <Box
                                                        component="img"
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${subscription.company.logo}`}
                                                        alt={subscription.company.name}
                                                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <BusinessIcon />
                                                )}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {subscription.company.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {subscription.company.industry}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                                            <Chip
                                                icon={subscription.isActive ? <ActiveIcon /> : <InactiveIcon />}
                                                label={subscription.isActive ? "Active" : "Inactive"}
                                                color={subscription.isActive ? "success" : "default"}
                                                size="small"
                                            />
                                            {subscription.notificationPreferences.email && (
                                                <Chip
                                                    icon={<EmailIcon />}
                                                    label="Email"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>

                                        <Typography variant="body2" color="text.secondary">
                                            📧 {subscription.totalNotificationsSent} notifications sent
                                        </Typography>
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                                        <Switch
                                            checked={subscription.isActive}
                                            onChange={() => handleToggleStatus(subscription._id)}
                                            size="small"
                                        />
                                        <IconButton
                                            onClick={() => {
                                                setSelectedSubscription(subscription);
                                                setDeleteDialogOpen(true);
                                            }}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={(e, page) => setCurrentPage(page)}
                            color="primary"
                        />
                    </Box>
                )}
            </Paper>

            {/* Create Subscription Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Subscribe to Company</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Autocomplete
                            options={companies}
                            getOptionLabel={(option) => option.name}
                            value={selectedCompany}
                            onChange={(e, newValue) => setSelectedCompany(newValue)}
                            onInputChange={(e, newInputValue) => setCompanySearchTerm(newInputValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Company"
                                    placeholder="Type to search..."
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <Box component="li" key={key} {...otherProps}>
                                        <Avatar sx={{ mr: 2 }}>
                                            {option.logo ? (
                                                <Box
                                                    component="img"
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${option.logo}`}
                                                    alt={option.name}
                                                />
                                            ) : (
                                                <BusinessIcon />
                                            )}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1">{option.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.industry}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateSubscription}
                        variant="contained"
                        disabled={!selectedCompany}
                    >
                        Subscribe
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Unsubscribe</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to unsubscribe from{" "}
                        <strong>{selectedSubscription?.company.name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteSubscription} variant="contained" color="error">
                        Unsubscribe
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}