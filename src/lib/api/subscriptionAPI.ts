import api from "../axios";

export type Subscription = {
    _id: string;
    user: string;
    company: {
        _id: string;
        name: string;
        logo?: string;
        industry?: string;
        location?: {
            city?: string;
            country?: string;
        };
    };
    isActive: boolean;
    notificationPreferences: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    jobTypes: string[];
    experienceLevels: string[];
    lastNotificationSent?: string;
    totalNotificationsSent: number;
    createdAt: string;
    updatedAt: string;
};

export type SubscriptionListResponse = {
    subscriptions: Subscription[];
    totalPages: number;
    currentPage: number;
    total: number;
};

export async function getMySubscriptions(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
}): Promise<SubscriptionListResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        
        const response = await api.get(`/subscription?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return null;
    }
}

export async function createSubscription(data: {
    companyId: string;
    jobTypes?: string[];
    experienceLevels?: string[];
    notificationPreferences?: {
        email: boolean;
        push?: boolean;
        sms?: boolean;
    };
}): Promise<{ message: string; subscription: Subscription } | null> {
    try {
        const response = await api.post('/subscription', data);
        return response.data;
    } catch (error) {
        console.error("Error creating subscription:", error);
        throw error;
    }
}

export async function updateSubscription(
    id: string,
    data: {
        jobTypes?: string[];
        experienceLevels?: string[];
        notificationPreferences?: {
            email?: boolean;
            push?: boolean;
            sms?: boolean;
        };
        isActive?: boolean;
    }
): Promise<{ message: string; subscription: Subscription } | null> {
    try {
        const response = await api.patch(`/subscription/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating subscription:", error);
        throw error;
    }
}

export async function deleteSubscription(id: string): Promise<{ message: string } | null> {
    try {
        const response = await api.delete(`/subscription/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting subscription:", error);
        throw error;
    }
}

export async function toggleSubscriptionStatus(id: string): Promise<{ message: string; subscription: Subscription } | null> {
    try {
        const response = await api.patch(`/subscription/${id}/toggle`);
        return response.data;
    } catch (error) {
        console.error("Error toggling subscription:", error);
        throw error;
    }
}

export async function checkSubscription(companyId: string): Promise<{ isSubscribed: boolean; subscription: Subscription | null } | null> {
    try {
        const response = await api.get(`/subscription/check/${companyId}`);
        return response.data;
    } catch (error) {
        console.error("Error checking subscription:", error);
        return null;
    }
}