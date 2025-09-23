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
    foundedYear?: string;
    isRemoteFriendly?: boolean;
    totalJobs?: number;
    totalApplications?: number;
    is_deleted?: boolean;
    lastLogin?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type CompanyLoginCredentials = {
    email: string;
    password: string;
};

export type CompanyRegisterCredentials = {
    name: string;
    description?: string;
    industry?: string;
    website?: string;
    contact: {
        email: string;
        phone?: string;
        linkedin?: string;
        twitter?: string;
    };
    password: string;
    location?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    logo?: File;
    benefits?: string[];
    culture?: string[];
    foundedYear?: number;
    isRemoteFriendly?: boolean;
};

export type CompanyAuthResponse = {
    data: string; // JWT token
    company: Company;
    message: string;
};

// NEW: Admin company management types
export type CompanyApprovalRequest = {
    companyId: string;
    maxJobs?: number;
};

export type CompanyRejectionRequest = {
    companyId: string;
    reason: string;
};

export type CompanySuspensionRequest = {
    companyId: string;
    reason: string;
};

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

//Add a type for the mockCompanyList 

export type CompanyListItem = {
    _id : string;
    name : string; 
    industry : string;
    location : string;
    jobs : number;
    applications : number;
    status: CompanyStatus;
    contact: {
        email: string;
    };
    createdAt: string;
    lastLogin? : string;
}