export type Company = {
    _id: string;
    name: string;
    description?: string;
    industry?: string;
    website?: string;
    logo?: string;
    contact: {
        email: string;
        phone?: string;
        linkedin?: string;
        twitter?: string;
    };
    location: {
        address?: string;
        city: string;
        state?: string;
        country: string;
        zipCode?: string;
        coordinates?: {
            latitude?: number;
            longitude?: number;
        };
    };
    // NEW: Approval system fields
    status: 'active' | 'inactive' | 'suspended';
    approvedBy?: string; // Admin user ID who approved
    approvedAt?: string; // ISO date string
    rejectionReason?: string;
    canPostJobs: boolean;
    maxJobs: number;
    
    // Existing fields
    benefits?: string[];
    culture?: string[];
    foundedYear?: number; // Changed from string to number
    isRemoteFriendly?: boolean;
    totalJobs?: number;
    totalApplications?: number;
    is_deleted?: boolean;
    lastLogin?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    lastUpdatedBy?: string;
};

// NEW: Form data interface for creating/updating companies
export interface CompanyFormData {
    name: string;
    description: string;
    website?: string;
    industry: string;
    location: {
        address?: string;
        city: string;
        state?: string;
        country: string;
        zipCode?: string;
    };
    contact: {
        email: string;
        phone?: string;
        linkedin?: string;
        twitter?: string;
    };
    benefits?: string[];
    culture?: string[];
    foundedYear?: number;
    isRemoteFriendly?: boolean;
    canPostJobs?: boolean;
    maxJobs?: number;
    status?: 'active' | 'inactive' | 'suspended';
}


// NEW: Company status enum for better type safety
export type CompanyStatus = 'active' | 'inactive' | 'suspended';

// NEW: Company filters for admin dashboard
export type CompanyFilters = {
    status?: CompanyStatus;
    search?: string;
    industry?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'createdAt' | 'lastLogin' | 'totalJobs';
    sortOrder?: 'asc' | 'desc';
};

// NEW: Company list response for admin
export type CompanyListResponse = {
    companies: Company[];
    totalPages: number;
    currentPage: number;
    total: number;
};

