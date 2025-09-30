import { JobListResponse } from "@/types/Job";
import api from "../axios";

export async function getAllJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    company?: string;
    jobType?: string;
    experienceLevel?: string;
    locationType?: string;
    city?: string;
    country?: string;
}): Promise<JobListResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.jobType) queryParams.append('jobType', params.jobType);
        if (params?.company) queryParams.append('company', params.company);
        if (params?.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
        if (params?.locationType) queryParams.append('locationType', params.locationType);
        if (params?.city) queryParams.append('city', params.city);
        if (params?.country) queryParams.append('country', params.country);

        const response = await api.get(`/job/all?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching companies", error)
        return null;
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