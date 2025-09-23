import { Company, CompanyListResponse } from "@/types/Company";
import api from "../axios";
import { AdminStats } from "@/types/Admin";


export async function getAllCompanies(params?: {
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

        const response = await api.get(`/company/all?${queryParams.toString()}`);
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
    } catch (error) {
        console.error("Error creating company:", error);
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
    } catch (error) {
        console.error("Error updating company : ", error);
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

export async function createJobForCompany(companyId: string, jobData: any): Promise<any> {
    try {
        const response = await api.post(`/admin/companies/${companyId}/jobs`, jobData);
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
        const response = await api.patch(`/admin/jobs/${jobId}`, jobData);
        return response.data.job;
    } catch (error) {
        console.error("Error updating job:", error);
        return false;
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