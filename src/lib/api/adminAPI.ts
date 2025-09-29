import { Company, CompanyListResponse } from "@/types/Company";
import api from "../axios";
import { AdminStats } from "@/types/Admin";
import { JobListResponse } from "@/types/Job";


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
    } catch (error: any) {
        if (error.response) {
            console.error("Error updating company:", error.response.data); // 👈 full backend response
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Request setup error:", error.message);
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
    } catch (error: any) {
        if (error.response) {
            console.error("Error updating company:", error.response.data); // 👈 full backend response
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Request setup error:", error.message);
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
    } catch (error: any) {
        if (error.response) {
            console.error("Backend error:", error.response.data);
        } else {
            console.error("Error deleting company:", error.message);
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

export async function createJob(jobData: { company: string, data: FormData }): Promise<any> {
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

export async function getJobsByCompany(companyId: string, params?: {
    page?: number;
    limit?: number;
}): Promise<any> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await api.get(`/job/company/${companyId}?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching company jobs: ", error);
        return null;
    }
}

export async function updateJob(jobId: string, jobData: any): Promise<any> {
    try {
        console.log('Updating job with data:', jobData);
        const response = await api.patch(`/admin/jobs/${jobId}`, jobData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data.job;
    } catch (error: any) {
        if (error.response) {
            console.error("Error updating job:", error.response.data);
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Request setup error:", error.message);
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

export async function getAllJobsByAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
    company?: string;
    jobType?: string;
    experienceLevel?: string;
}): Promise<JobListResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.jobType) queryParams.append('jobType', params.jobType);
        if (params?.company) queryParams.append('company', params.company);
        console.log("company", params?.company);
        if (params?.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
        
        const response = await api.get(`/job/all?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching companies", error)
        return null;
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