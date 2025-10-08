import api from "../axios";
import { Job, JobAlert, JobAlertFormData, JobAlertListResponse } from "@/types/Job";

export async function getMyJobAlerts(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
}): Promise<JobAlertListResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        
        const response = await api.get(`/job-alert?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching job alerts:", error);
        return null;
    }
}

export async function getJobAlertById(id: string): Promise<JobAlert | null> {
    try {
        const response = await api.get(`/job-alert/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching job alert:", error);
        return null;
    }
}

export async function createJobAlert(data: JobAlertFormData): Promise<{ message: string; jobAlert: JobAlert } | null> {
    try {
        const response = await api.post('/job-alert', data);
        return response.data;
    } catch (error) {
        console.error("Error creating job alert:", error);
        throw error;
    }
}

export async function updateJobAlert(id: string, data: Partial<JobAlertFormData>): Promise<{ message: string; jobAlert: JobAlert } | null> {
    try {
        const response = await api.patch(`/job-alert/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating job alert:", error);
        throw error;
    }
}

export async function deleteJobAlert(id: string): Promise<{ message: string } | null> {
    try {
        const response = await api.delete(`/job-alert/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting job alert:", error);
        throw error;
    }
}

export async function toggleJobAlertStatus(id: string): Promise<{ message: string; jobAlert: JobAlert } | null> {
    try {
        const response = await api.patch(`/job-alert/${id}/toggle`);
        return response.data;
    } catch (error) {
        console.error("Error toggling job alert:", error);
        throw error;
    }
}

export async function testJobAlert(id: string): Promise<{ message: string; totalRecentJobs: number; matchingJobs: number; jobs: any[] } | null> {
    try {
        const response = await api.post(`/job-alert/${id}/test`);
        return response.data;
    } catch (error) {
        console.error("Error testing job alert:", error);
        throw error;
    }
}

// NEW: Get matching jobs for a specific alert
export async function getMatchingJobsForAlert(alertId: string, params?: {
    page?: number;
    limit?: number;
}): Promise<{ jobs: Job[]; total: number; totalPages: number; currentPage: number } | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        
        const response = await api.post(`/job-alert/${alertId}/test?${queryParams.toString()}`);
        return {
            jobs: response.data.jobs || [],
            total: response.data.matchingJobs || 0,
            totalPages: Math.ceil((response.data.matchingJobs || 0) / (params?.limit || 10)),
            currentPage: params?.page || 1,
        };
    } catch (error) {
        console.error("Error fetching matching jobs:", error);
        return null;
    }
}

// NEW: Get all recent jobs (for filtering on frontend)
export async function getRecentJobs(days: number = 30): Promise<Job[] | null> {
    try {
        const response = await api.get(`/job/all?limit=100&isActive=true`);
        return response.data.jobs || [];
    } catch (error) {
        console.error("Error fetching recent jobs:", error);
        return null;
    }
}