import { Application, ApplicationFilters, ApplicationStats } from "@/types/Application";
import { getCookie } from "cookies-next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApplicationApi {
    private static getAuthHeaders() {
        const token = getCookie('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }

    private static getFormDataHeaders() {
        const token = getCookie('token');
        return {
            'Authorization': `Bearer ${token}`,
        };
    }


    // Create application
    static async createApplication(formData: FormData): Promise<Application> {
        const response = await fetch(`${API_BASE_URL}/application`, {
            method: 'POST',
            headers: this.getFormDataHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create application');
        }

        return response.json();
    }

    // Get user applications
    static async getUserApplications(filters: ApplicationFilters = {}): Promise<{
        applications: Application[];
        totalPages: number;
        currentPage: number;
        total: number;
        stats: Record<string, number>;
    }> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/application?${params}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch applications');
        }

        return response.json();
    }

    // Get application by ID
    static async getApplicationById(id: string): Promise<Application> {
        const response = await fetch(`${API_BASE_URL}/application/${id}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch application');
        }

        return response.json();
    }

    // Update application
    static async updateApplication(id: string, data: { status?: string; notes?: string }): Promise<Application> {
        const response = await fetch(`${API_BASE_URL}/application/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update application');
        }

        return response.json();
    }

    // Delete application (soft delete)
    static async deleteApplication(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/application/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete application');
        }
    }

    // Get application statistics
    static async getApplicationStats(): Promise<ApplicationStats> {
        const response = await fetch(`${API_BASE_URL}/application/stats`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch application stats');
        }

        return response.json();
    }

    // Get job applications (for companies)
    static async getJobApplications(jobId: string, filters: ApplicationFilters = {}): Promise<{
        applications: Application[];
        totalPages: number;
        currentPage: number;
        total: number;
    }> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/application/job/${jobId}?${params}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch job applications');
        }

        return response.json();
    }

    // Update application status (for companies)
    static async updateApplicationStatus(id: string, data: { status?: string; notes?: string }): Promise<Application> {
        const response = await fetch(`${API_BASE_URL}/application/${id}/status`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update application status');
        }

        return response.json();
    }
}