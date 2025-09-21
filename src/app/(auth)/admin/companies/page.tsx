"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Avatar,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    InputAdornment,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon,
    Search as SearchIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Pause as SuspendIcon,
} from '@mui/icons-material';

import { CompanyListItem, CompanyStatus } from '@/types/Company';
import AdminLayout from '@/components/AdminLayout';

// Mock data with proper typing
const mockCompanies: CompanyListItem[] = [
    {
        _id: '1',
        name: 'TechCorp Inc.',
        industry: 'Technology',
        location: 'San Francisco, CA',
        jobs: 45,
        applications: 234,
        status: 'approved',
        contact: { email: 'contact@techcorp.com' },
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20',
    },
    {
        _id: '2',
        name: 'StartupXYZ',
        industry: 'Fintech',
        location: 'New York, NY',
        jobs: 0,
        applications: 0,
        status: 'pending',
        contact: { email: 'hello@startupxyz.com' },
        createdAt: '2024-01-18',
        lastLogin: undefined,
    },
    {
        _id: '3',
        name: 'BigTech',
        industry: 'Software',
        location: 'Seattle, WA',
        jobs: 28,
        applications: 156,
        status: 'suspended',
        contact: { email: 'info@bigtech.com' },
        createdAt: '2024-01-10',
        lastLogin: '2024-01-15',
    },
];

export default function AdminCompanies() {
    const [companies, setCompanies] = useState<CompanyListItem[]>(mockCompanies);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCompany, setSelectedCompany] = useState<CompanyListItem | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchCompanies();
    }, [statusFilter, searchTerm, page, rowsPerPage]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            // const response = await fetch(`/api/admin/companies?status=${statusFilter}&search=${searchTerm}&page=${page + 1}&limit=${rowsPerPage}`);
            // const data = await response.json();
            // setCompanies(data.companies);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching companies:', error);
            setLoading(false);
        }
    };

    const handleApprove = async (companyId: string) => {
        try {
            // const response = await fetch(`/api/admin/companies/${companyId}/approve`, {
            //   method: 'PATCH',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ maxJobs: 10 })
            // });

            if (true) { // Replace with response.ok
                // Update local state
                setCompanies(prev => prev.map(company =>
                    company._id === companyId
                        ? { ...company, status: 'approved' as CompanyStatus }
                        : company
                ));
                // Show success message
            }
        } catch (error) {
            console.error('Error approving company:', error);
        }
    };

    const handleReject = async (companyId: string, reason: string) => {
        try {
            // const response = await fetch(`/api/admin/companies/${companyId}/reject`, {
            //   method: 'PATCH',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ reason })
            // });

            if (true) { // Replace with response.ok
                setCompanies(prev => prev.map(company =>
                    company._id === companyId
                        ? { ...company, status: 'rejected' as CompanyStatus }
                        : company
                ));
            }
        } catch (error) {
            console.error('Error rejecting company:', error);
        }
    };

    const getStatusColor = (status: CompanyStatus): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            case 'suspended': return 'default';
            default: return 'default';
        }
    };

    const filteredCompanies = companies.filter(company => {
        const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.contact.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const paginatedCompanies = filteredCompanies.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Company Management
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setStatusFilter('pending')}
                            color={statusFilter === 'pending' ? 'primary' : 'inherit'}
                        >
                            Pending ({companies.filter(c => c.status === 'pending').length})
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setStatusFilter('all')}
                            color={statusFilter === 'all' ? 'primary' : 'inherit'}
                        >
                            All Companies
                        </Button>
                    </Box>
                </Box>

                {/* Search and Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            placeholder="Search companies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: 1 }}
                        />
                    </Box>
                </Paper>

                {/* Companies List */}
                <Grid container spacing={3}>
                    {paginatedCompanies.map((company) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={company._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    mr: 2,
                                                    backgroundColor: 'primary.main',
                                                }}
                                            >
                                                <BusinessIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {company.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {company.industry}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={company.status}
                                            color={getStatusColor(company.status)}
                                            size="small"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        📍 {company.location}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        📧 {company.contact.email}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Jobs
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {company.jobs}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Applications
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {company.applications}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {company.status === 'pending' && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                startIcon={<ApproveIcon />}
                                                onClick={() => handleApprove(company._id)}
                                                sx={{ flex: 1 }}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<RejectIcon />}
                                                onClick={() => handleReject(company._id, 'Not meeting requirements')}
                                                sx={{ flex: 1 }}
                                            >
                                                Reject
                                            </Button>
                                        </Box>
                                    )}

                                    {company.status === 'approved' && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<SuspendIcon />}
                                                onClick={() => {/* Handle suspend */ }}
                                                sx={{ flex: 1 }}
                                            >
                                                Suspend
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {/* Handle view details */ }}
                                                sx={{ flex: 1 }}
                                            >
                                                View Details
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <TablePagination
                        component="div"
                        count={filteredCompanies.length}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Box>
            </Box>
        </AdminLayout>
    );
}