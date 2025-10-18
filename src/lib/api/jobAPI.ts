import { Job, JobFilters, JobListResponse } from "@/types/Job";
import api from "../axios";
import { PaginatedResponse } from "@/types/Api";


export const getAllJobs = async (filters: JobFilters): Promise<JobListResponse> => {
    try {
        // Build query parameters
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.company) params.append('company', filters.company);
        if (filters.jobType) params.append('jobType', filters.jobType);
        if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
        if (filters.locationType) params.append('locationType', filters.locationType);
        if (filters.remoteOnly) params.append('remoteOnly', 'true');

        // Location-based filters
        if (filters.latitude) { console.log("location filters", filters.latitude.toString());; params.append('latitude', filters.latitude.toString()) };
        if (filters.longitude) {
            console.log("location filters", filters.longitude.toString()); params.append('longitude', filters.longitude.toString())
        };
        if (filters.radius) { console.log("location filters", filters.radius.toString()); params.append('radius', filters.radius.toString()) };


        console.log('API call params:', params.toString());
        console.log('Full URL:', `/job/all?${params.toString()}`);

        const response = await api.get(`/job/all?${params.toString()}`);

        console.log('Jobs fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};


export async function getJobsByCompany(
    companyId: string,
    params?: { page?: number; limit?: number }
): Promise<PaginatedResponse<Job> | null> {
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

export async function getJobById(jobId: string): Promise<Job | null> {
    try {
        const response = await api.get(`/job/${jobId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching job by ID:", error);
        return null;
    }
}