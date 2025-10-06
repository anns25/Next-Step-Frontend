import { Application, ApplicationFilters, ApplicationStats } from "@/types/Application";
import api from "@/lib/axios";

// Create application
export async function createApplication(formData: FormData): Promise<Application> {
    const response = await api.post('/application', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Restore soft-deleted application (admin only)
export async function restoreApplication(id: string): Promise<Application> {
    const response = await api.patch(`/application/${id}/restore`);
    return response.data;
}

// Get user applications
export async function getUserApplications (filters: ApplicationFilters = {}): Promise<{
    applications: Application[];
    totalPages: number;
    currentPage: number;
    total: number;
    stats: Record<string, number>;
}>{
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
            params.append(key, value.toString());
        }
    });

    const response = await api.get(`/application?${params}`);
    return response.data;
};

// Get application by ID
export async function getApplicationById (id: string): Promise<Application>{
    const response = await api.get(`/application/${id}`);
    return response.data;
};

// Update application
export async function updateApplication(id: string, data: { status?: string; notes?: string; coverLetter?: string }): Promise<Application> {
    const response = await api.patch(`/application/${id}`, data);
    return response.data;
};

// Delete application (soft delete)
export async function deleteApplication(id: string): Promise<void> {
    await api.delete(`/application/${id}`);
};

// Get application statistics
export async function getApplicationStats(): Promise<ApplicationStats> {
    const response = await api.get('/application/stats');
    console.log("response stats", response);
    return response.data;
};

// Get job applications (for companies)
export async function getJobApplications(jobId: string, filters: ApplicationFilters = {}): Promise<{
    applications: Application[];
    totalPages: number;
    currentPage: number;
    total: number;
}>{
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
            params.append(key, value.toString());
        }
    });

    const response = await api.get(`/application/job/${jobId}?${params}`);
    return response.data;
};

// Update application status (for companies)
export async function updateApplicationStatus(id: string, data: { status?: string; notes?: string }): Promise<Application> {
    console.log("data", data);
    console.log("id", id);
    const response = await api.patch(`admin/applications/${id}/status`, data);
    return response.data;
};



