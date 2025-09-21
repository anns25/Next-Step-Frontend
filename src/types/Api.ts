import { AdminDashboardData, AdminStats } from "./Admin";
import { Company, CompanyStatus } from "./Company";

// Generic API response wrapper
export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
};

// Paginated response
export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};

// Admin API responses
export type AdminCompaniesResponse = PaginatedResponse<Company>;
export type AdminStatsResponse = AdminStats;
export type AdminDashboardResponse = AdminDashboardData;

// Company API responses
export type CompanyRegistrationResponse = {
    message: string;
    company: {
        _id: string;
        name: string;
        status: CompanyStatus;
        contact: {
            email: string;
        };
    };
};

export type CompanyApprovalResponse = {
    message: string;
    company: Company;
};

export type CompanyRejectionResponse = {
    message: string;
    company: Company;
};