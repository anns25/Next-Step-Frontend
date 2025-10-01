"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    Chip,
    CircularProgress,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    CardActions,
    Alert,
    Snackbar,
    Stack,
    useMediaQuery,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import {
    People as PeopleIcon,
    Search as SearchIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    Verified as VerifiedIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";

import { User } from "@/types/User";
import { getAllUsersByAdmin, deleteUserByAdmin } from "@/lib/api/adminAPI";

export default function AdminUsers() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [verificationFilter, setVerificationFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(12);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Snackbar states
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    const roles = ["user", "admin"];
    const verificationStatuses = ["verified", "unverified"];

    const getRoleColor = (role: string): "success" | "warning" | "error" | "default" | "info" => {
        switch (role) {
            case "admin":
                return "error";
            case "user":
                return "success";
            default:
                return "default";
        }
    };

    const getVerificationColor = (verified: boolean): "success" | "warning" | "error" | "default" | "info" => {
        return verified ? "success" : "warning";
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                search: searchTerm || undefined,
                role: roleFilter || undefined,
                emailVerified: verificationFilter ? verificationFilter === "verified" : undefined,
            };

            console.log('Fetching users with params:', params);
            const response = await getAllUsersByAdmin(params);

            if (response) {
                setUsers(response.users);
                setTotalPages(response.totalPages);
                setTotal(response.total);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setSnackbar({
                open: true,
                message: "Failed to fetch users",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, roleFilter, verificationFilter]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleRoleFilter = (value: string) => {
        setRoleFilter(value);
        setCurrentPage(1);
    };

    const handleVerificationFilter = (value: string) => {
        setVerificationFilter(value);
        setCurrentPage(1);
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setDeleteLoading(true);
        try {
            const success = await deleteUserByAdmin(userToDelete._id);
            if (success) {
                setSnackbar({
                    open: true,
                    message: "User deleted successfully",
                    severity: "success",
                });
                fetchUsers();
            } else {
                setSnackbar({
                    open: true,
                    message: "Failed to delete user",
                    severity: "error",
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to delete user",
                severity: "error",
            });
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (date?: string | Date | null) => {
        if (!date) return "Never";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleReset = () => {
        setSearchTerm("");
        setRoleFilter("");
        setVerificationFilter("");
        setCurrentPage(1);
        fetchUsers();
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
                    {/* Header */}
                    <Box sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        mb: { xs: 2, sm: 3 },
                        gap: { xs: 2, sm: 0 }
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem", lg: "2.125rem" },
                                lineHeight: 1.2,
                            }}
                        >
                            User Management
                        </Typography>
                    </Box>

                    {/* Search and Filters */}
                    <Paper
                        sx={{
                            p: { xs: 1.5, sm: 2, md: 3 },
                            mb: { xs: 2, sm: 3 },
                            borderRadius: 3,
                            backdropFilter: "blur(12px)",
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(245,250,255,0.1) 100%)",
                            boxShadow: "0 6px 20px rgba(20,30,60,0.1)",
                        }}
                    >
                        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <TextField
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize={isMobile ? "small" : "medium"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    fullWidth
                                    size={isMobile ? "small" : "medium"}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={roleFilter}
                                        onChange={(e) => handleRoleFilter(e.target.value)}
                                        label="Role"
                                    >
                                        <MenuItem value="">All Roles</MenuItem>
                                        {roles.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                    <InputLabel>Verification</InputLabel>
                                    <Select
                                        value={verificationFilter}
                                        onChange={(e) => handleVerificationFilter(e.target.value)}
                                        label="Verification"
                                    >
                                        <MenuItem value="">All Status</MenuItem>
                                        {verificationStatuses.map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon fontSize={isMobile ? "small" : "medium"} />}
                                    onClick={handleReset}
                                    fullWidth
                                    size={isMobile ? "small" : "medium"}
                                >
                                    {isMobile ? "Reset" : "Reset"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                    {/* Results Summary */}
                    <Box sx={{
                        mb: { xs: 2, sm: 3 },
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 1, sm: 0 }
                    }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            Showing {users.length} of {total} users
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            Page {currentPage} of {totalPages}
                        </Typography>
                    </Box>

                    {/* Users Grid */}
                    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                        {users.map((user) => (
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={user._id}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: 3,
                                        backdropFilter: "blur(12px)",
                                        background:
                                            "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(245,250,255,0.15) 100%)",
                                        boxShadow: "0 8px 30px rgba(20,30,60,0.12)",
                                        border: `1px solid ${user.emailVerified ? '#4caf50' : '#ff9800'}40`,
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 12px 40px rgba(20,30,60,0.2)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 } }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: { xs: "column", sm: "row" },
                                                alignItems: { xs: "flex-start", sm: "center" },
                                                gap: { xs: 1, sm: 0 },
                                                minWidth: 0,
                                            }}
                                        >
                                            {/* User Avatar + Info */}
                                            <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, width: "100%", mb: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: { xs: 40, sm: 48 },
                                                            height: { xs: 40, sm: 48 },
                                                            mr: 2,
                                                            bgcolor: user.role === 'admin' ? "error.main" : "primary.main",
                                                            flexShrink: 0,
                                                        }}
                                                        src={user.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${user.profilePicture}` : undefined}
                                                    >
                                                        {user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                                                    </Avatar>

                                                    <Box sx={{ flex: 1, minWidth: 0, maxWidth: { xs: "180px", sm: "100%" }, ml: 1 }}>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 600,
                                                                mb: 0.5,
                                                                fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                lineHeight: 1.2,
                                                            }}
                                                            title={`${user.firstName} ${user.lastName}`}
                                                        >
                                                            {user.firstName} {user.lastName}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                                            }}
                                                            title={user.email}
                                                        >
                                                            {user.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            {/* Role Chip */}
                                            <Chip
                                                label={(user.role || 'user')?.charAt(0).toUpperCase() + user.role?.slice(1)}
                                                color={getRoleColor(user.role || 'user')}
                                                size="small"
                                                sx={{
                                                    flexShrink: 0,
                                                    ml: { xs: 0, sm: 1 },
                                                    mb: { xs: 1, sm: 0 },
                                                    fontSize: { xs: "0.625rem", sm: "0.75rem" },
                                                    height: { xs: 20, sm: 24 }
                                                }}
                                            />
                                        </Box>

                                        {/* User Details */}
                                        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                                            <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                                                <Chip
                                                    label={user.emailVerified ? "Verified" : "Unverified"}
                                                    color={getVerificationColor(user.emailVerified || false)}
                                                    size="small"
                                                    sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" } }}
                                                />
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 0.5,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    fontSize: { xs: "0.75rem", sm: "0.875rem" }
                                                }}
                                                title={`Member since: ${formatDate(user.createdAt)}`}
                                            >
                                                📅 Member since: {formatDate(user.createdAt)}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 0.5,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    fontSize: { xs: "0.75rem", sm: "0.875rem" }
                                                }}
                                                title={`Last login: ${formatDate(user.lastLogin)}`}
                                            >
                                                🔐 Last login: {formatDate(user.lastLogin)}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{
                                        p: { xs: 1, sm: 1.5, md: 2 },
                                        pt: 0,
                                        justifyContent: "center"
                                    }}>
                                        <Box sx={{
                                            display: "flex",
                                            gap: { xs: 0.5, sm: 1 },
                                            width: "100%",
                                            justifyContent: "center"
                                        }}>
                                            <Tooltip title="Delete User">
                                                <IconButton
                                                    onClick={() => handleDeleteUser(user)}
                                                    color="error"
                                                    size={isMobile ? "small" : "medium"}
                                                >
                                                    <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 3, sm: 4 } }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size={isMobile ? "small" : "large"}
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {/* Empty State */}
                    {users.length === 0 && !loading && (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: { xs: 6, sm: 8 },
                                color: "text.secondary",
                            }}
                        >
                            <PeopleIcon sx={{
                                fontSize: { xs: 40, sm: 48, md: 64 },
                                mb: 2,
                                opacity: 0.5
                            }} />
                            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                                No users found
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                                {searchTerm || roleFilter || verificationFilter
                                    ? "Try adjusting your search criteria"
                                    : "No users have been registered yet"}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-dialog-title"
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        margin: { xs: 2, sm: 3 },
                        width: { xs: 'calc(100% - 32px)', sm: 'auto' }
                    }
                }}
            >
                <DialogTitle id="delete-dialog-title" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    Delete User
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone!
                    </Alert>
                    <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                        Are you sure you want to delete the user{" "}
                        <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
                    </Typography>
                    <Typography color="error" fontWeight="bold" sx={{
                        mt: 2,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" }
                    }}>
                        This will permanently remove the user and all their data.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 0 },
                    p: { xs: 2, sm: 3 }
                }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteLoading}
                        fullWidth={isMobile}
                        size={isMobile ? "small" : "medium"}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleteLoading}
                        startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                        fullWidth={isMobile}
                        size={isMobile ? "small" : "medium"}
                    >
                        {deleteLoading ? "Deleting..." : "Delete User"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}