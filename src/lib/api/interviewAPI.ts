import api from "@/lib/axios";
import { CreateInterviewData, Interview, InterviewFilters, InterviewStats, UpdateInterviewData } from "@/types/Interview";


// Get user's interviews
export async function getUserInterviews(filters: InterviewFilters = {}): Promise<{
    interviews: Interview[];
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

    const response = await api.get(`/interview?${params}`);
    return response.data;
}

// Get upcoming interviews (next 7 days)
export async function getUpcomingInterviews(): Promise<{
    interviews: Interview[];
    count: number;
}> {
    const response = await api.get('/interview/upcoming');
    return response.data;
}

// Get interview by ID
export async function getInterviewById(id: string): Promise<Interview> {
    const response = await api.get(`/interview/${id}`);
    return response.data;
}

// Update interview
export async function updateInterview(id: string, data: UpdateInterviewData): Promise<{ message: string; interview: Interview }> {
    const response = await api.patch(`/interview/${id}`, data);
    return response.data;
}

// Update preparation notes
export async function updatePreparation(
    id: string,
    data: {
        notes?: string;
        questions?: string[];
        research?: string;
        documents?: string[];
    }
): Promise<{ message: string; interview: Interview }> {
    const response = await api.patch(`/interview/${id}/preparation`, data);
    return response.data;
}

// Delete interview
export async function deleteInterview(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/interview/${id}`);
    return response.data;
}

// Get interview statistics
export async function getInterviewStats(): Promise<InterviewStats> {
    const response = await api.get('/interview/stats');
    return response.data;
}

// Admin Interview Management Functions
export async function getAllInterviewsAdmin(filters: InterviewFilters = {}): Promise<{
    interviews: Interview[];
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

    const response = await api.get(`/admin/interviews?${params}`);
    return response.data;
}

// Admin: Create interview for a user
export async function createInterviewAdmin(data: CreateInterviewData & { userId: string }): Promise<{ message: string; interview: Interview }> {
        const response = await api.post('/admin/interview', data);
        return response.data;
}

// Admin: Update interview
export async function updateInterviewAdmin(id: string, data: UpdateInterviewData): Promise<{ message: string; interview: Interview }> {
    const response = await api.patch(`/admin/interview/${id}`, data);
    return response.data;
}

// Admin: Delete interview
export async function deleteInterviewAdmin(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/interview/${id}`);
    return response.data;
}

// Admin: Reschedule interview
export async function rescheduleInterviewAdmin(
    id: string,
    data: {
        scheduledDate: string;
        duration?: number;
        location?: Interview['location'];
    }
): Promise<{ message: string; interview: Interview }> {
    const response = await api.patch(`/admin/interview/${id}/reschedule`, data);
    return response.data;
}

// Admin: Confirm interview
export async function confirmInterviewAdmin(id: string): Promise<{ message: string; interview: Interview }> {
    const response = await api.patch(`/admin/interview/${id}/confirm`);
    return response.data;
}

// Admin: Cancel interview
export async function cancelInterviewAdmin(id: string, reason?: string): Promise<{ message: string; interview: Interview }> {
    const response = await api.patch(`/admin/interview/${id}/cancel`, { reason });
    return response.data;
}

// Admin: Complete interview
export async function completeInterviewAdmin(
    id: string,
    data: {
        feedback?: Interview['feedback'];
        outcome?: Interview['outcome'];
        nextSteps?: string;
    }
): Promise<{ message: string; interview: Interview }> {
    const response = await api.patch(`/admin/interview/${id}/complete`, data);
    return response.data;
}

// Admin: Get interview by ID
export async function getInterviewByIdAdmin(id: string): Promise<Interview> {
    const response = await api.get(`/admin/interview/${id}`);
    return response.data;
}