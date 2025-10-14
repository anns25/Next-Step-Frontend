import { Company, CompanyListResponse } from "@/types/Company";
import api from "../axios";
import { AdminStats } from "@/types/Admin";
import { Job, JobListResponse } from "@/types/Job";
import { InterviewStats } from "@/types/Interview";
import { AxiosError } from "axios";
import { Application } from "@/types/Application";
import { User } from "@/types/User";

type JobUpdateData = Partial<Omit<Job, "_id" | "createdAt" | "updatedAt">>;
export interface PaginatedUserResponse {
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
}

// Add these functions to your existing adminAPI.ts file

export async function deleteUserByAdmin(userId: string): Promise<boolean> {
    try {
        await api.delete(`/admin/users/${userId}`);
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        return false;
    }
}

// User Management Functions
export async function getAllUsersByAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    emailVerified?: boolean;
}): Promise<PaginatedUserResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.role) queryParams.append('role', params.role);
        if (params?.emailVerified !== undefined) queryParams.append('emailVerified', params.emailVerified.toString());

        const response = await api.get(`/admin/users?${queryParams.toString()}`);
        return response.data;
    } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response) {
            console.error("Error fetching users:", err.response.data);
        } else if (err.request) {
            console.error("No response received:", err.request);
        } else if (err instanceof Error) {
            console.error("Request setup error:", err.message);
        } else {
            console.error("Unknown error fetching users");
        }

        return null;
    }
}


export async function getUserByIdByAdmin(userId: string): Promise<User | null> {
    try {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}


export async function getAllCompaniesByAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    status?: string
}): Promise<CompanyListResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.industry) queryParams.append('industry', params.industry);
        if (params?.status) queryParams.append('status', params.status);

        const response = await api.get(`/admin/companies?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching companies", error)
        return null;
    }

}

export async function getCompanyById(companyId: string): Promise<Company | null> {
    try {
        const response = await api.get(`/company/${companyId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching company :", error);
        return null;
    }

}

export async function createCompany(companyData: FormData): Promise<Company | null> {
    try {
        const response = await api.post('/admin/companies', companyData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.company;
    } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response) {
            console.error("Error updating company:", err.response.data); // 👈 full backend response
            console.error("Status:", err.response.status);
            console.error("Headers:", err.response.headers);
        } else if (err.request) {
            console.error("No response received:", err.request);
        } else {
            console.error("Request setup error:", (error as Error).message);
        }
        throw error;
    }

}

export async function updateCompany(companyId: string, companyData: FormData): Promise<Company | null> {
    try {
        const response = await api.patch(`/admin/companies/${companyId}`, companyData, {
            headers: {
                'Content-Type': 'multipart/form-data',

            },
        });
        return response.data.company;
    } catch (error: unknown) {
        const err = error as AxiosError;
        if (err.response) {
            console.error("Error updating company:", err.response.data); // 👈 full backend response
            console.error("Status:", err.response.status);
            console.error("Headers:", err.response.headers);
        } else if (err.request) {
            console.error("No response received:", err.request);
        } else {
            console.error("Request setup error:", err.message);
        }
        throw error;
    }

}

export const deleteCompany = async (companyId: string) => {
    try {
        const response = await api.delete(`/admin/companies/${companyId}`);
        // Log success if needed
        console.log("Delete success:", response.status);
        return true;
    } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response) {
            console.error("Backend error:", err.response.data);
        } else if (err instanceof Error) {
            console.error("Error deleting company:", err.message);
        } else {
            console.error("Unknown error deleting company");
        }

        return false;
    }
};


export async function getAdminDashboardStats(): Promise<AdminStats | null> {
    try {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats", error);
        return null;
    }
}

//Job Management for Companies

export async function createJob(jobData: { company: string, data: FormData }): Promise<Job | null> {
    try {
        // extract company from formData
        const { company, data } = jobData
        console.log("****", data);
        const response = await api.post(`/admin/companies/${company}/jobs`, data, { headers: { "Content-Type": "application/json" } });
        return response.data.job;
    } catch (error) {
        console.error("Error creating job:", error);
        throw error;
    }
}


export async function getAllJobsByAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
    company?: string;
    jobType?: string;
    experienceLevel?: string;
    isActive?: boolean;
}): Promise<JobListResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.jobType) queryParams.append('jobType', params.jobType);
        if (params?.company) queryParams.append('company', params.company);
        if (params?.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
        if (params?.isActive !== undefined) {
            queryParams.append('isActive', params.isActive.toString());
        }
        const response = await api.get(`/admin/jobs/?${queryParams.toString()}`);
        return response.data;
    } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response) {
            console.error("Error fetching jobs:", err.response.data);
        } else if (err.request) {
            console.error("No response received:", err.request);
        } else if (err instanceof Error) {
            console.error("Request setup error:", err.message);
        } else {
            console.error("Unknown error fetching jobs");
        }

        return null;
    }
}

export async function updateJob(jobId: string, jobData: JobUpdateData): Promise<Job | null> {
    try {
        console.log('Updating job with data:', jobData);
        const response = await api.patch(`/admin/jobs/${jobId}`, jobData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data.job;
    } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response) {
            console.error("Error updating job:", err.response.data);
            console.error("Status:", err.response.status);
            console.error("Headers:", err.response.headers);
        } else if (err.request) {
            console.error("No response received:", err.request);
        } else if (err instanceof Error) {
            console.error("Request setup error:", err.message);
        } else {
            console.error("Unknown error updating job");
        }

        throw error;
    }
}

export async function deleteJob(jobId: string): Promise<boolean> {
    try {
        await api.delete(`/admin/jobs/${jobId}`);
        return true;
    } catch (error) {
        console.error("Error deleting job:", error);
        return false;
    }
}


export async function getJobById(id: string): Promise<Company | null> {
    try {
        const response = await api.get(`/job/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching company :", error);
        return null;
    }

}

// Get applications for a specific user (Admin only)
export async function getUserApplicationsByAdmin(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
}): Promise<{
    applications: Application[];
    totalPages: number;
    currentPage: number;
    total: number;
} | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const response = await api.get(`/admin/users/${userId}/applications?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user applications:", error);
        return null;
    }
}

//Interview Stats for Admin

// Get interview statistics
export async function getAdminInterviewStats(): Promise<InterviewStats> {
    const response = await api.get('admin/interview/stats');
    return response.data;
}