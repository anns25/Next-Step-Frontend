// Admin dashboard statistics
export type AdminStats = {
    totalCompanies: number;
    activeCompanies : number;
    activeJobs : number;
    totalJobs: number;
    totalUsers: number;
    totalApplications: number;
    recentApplications : number;
};

// Admin activity log
export type AdminActivity = {
    _id: string;
    action: 'company_approved' | 'company_rejected' | 'company_suspended' | 'user_created' | 'job_created';
    description: string;
    targetId: string; // ID of the affected entity
    targetType: 'company' | 'user' | 'job' | 'application';
    adminId: string;
    adminName: string;
    timestamp: string;
    metadata?: Record<string, any>; // Additional data about the action
};

// Admin dashboard overview
export type AdminDashboardData = {
    stats: AdminStats;
    recentActivities: AdminActivity[];
    topCompanies: {
        _id: string;
        name: string;
        jobs: number;
        applications: number;
        status: string;
    }[];
    pendingApprovals: {
        _id: string;
        name: string;
        industry: string;
        contact: {
            email: string;
        };
        createdAt: string;
    }[];
};

// Admin company management
export type AdminCompanyAction = {
    type: 'approve' | 'reject' | 'suspend' | 'activate';
    companyId: string;
    reason?: string;
    maxJobs?: number;
};

// Admin notification preferences
export type AdminNotificationSettings = {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newCompanyRegistrations: boolean;
    companyApprovals: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
};