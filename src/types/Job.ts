// ===================
// CORE JOB TYPES
// ===================

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
export type LocationType = 'remote' | 'on-site' | 'hybrid';
export type SalaryPeriod = 'hourly' | 'monthly' | 'yearly';
export type JobStatus = 'active' | 'inactive' | 'draft' | 'expired';
export type ApplicationStatus = 'pending' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'interview-completed' | 'offer-extended' | 'offer-accepted' | 'offer-declined' | 'rejected' | 'withdrawn';

// ===================
// JOB-RELATED TYPES
// ===================

export type JobLocation = {
    type: LocationType;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    coordinates?: {
        latitude?: number;
        longitude?: number;
    };
};

export type JobSalary = {
    min?: number;
    max?: number;
    currency?: string;
    period?: SalaryPeriod;
    isNegotiable?: boolean;
};

export type JobRequirements = {
    skills?: string[];
    education?: string;
    experience?: string;
    certifications?: string[];
    languages?: string[];
};

export type JobCompany = {
    _id: string;
    name: string;
    logo?: string;
    industry?: string;
    location?: {
        city?: string;
        country?: string;
    };
};

export type JobCreator = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
};

// ===================
// MAIN JOB TYPE
// ===================

export type Job = {
    _id: string;
    title: string;
    description: string;
    company: string | JobCompany; // Can be ID or populated company object
    location: JobLocation;
    jobType: JobType;
    experienceLevel: ExperienceLevel;
    salary?: JobSalary;
    requirements?: JobRequirements;
    responsibilities?: string[];
    benefits?: string[];
    applicationDeadline?: string; // ISO date string
    startDate?: string; // ISO date string
    isActive: boolean;
    isFeatured: boolean;
    applicationCount: number;
    viewCount: number;
    createdBy: string | JobCreator; // Can be ID or populated user object
    tags?: string[];
    externalUrl?: string;
    applicationInstructions?: string;
    is_deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

// ===================
// FORM DATA TYPES
// ===================

export interface JobFormData {
    title: string;
    description: string;
    company: string; // Company ID
    location: JobLocation;
    jobType: JobType;
    experienceLevel: ExperienceLevel;
    salary?: JobSalary;
    requirements?: JobRequirements;
    responsibilities?: string[];
    benefits?: string[];
    applicationDeadline?: string;
    startDate?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    externalUrl?: string;
    applicationInstructions?: string;
}

// ===================
// JOB FILTERS & SEARCH
// ===================

export type JobFilters = {
    search?: string;
    company?: string;
    jobType?: JobType;
    experienceLevel?: ExperienceLevel;
    locationType?: LocationType;
    isActive?: boolean;
    isFeatured?: boolean;
    salaryMin?: number;
    salaryMax?: number;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'title' | 'applicationCount' | 'viewCount' | 'applicationDeadline';
    sortOrder?: 'asc' | 'desc';
};

export type JobSearchParams = {
    q?: string; // Search query
    location?: string;
    jobType?: JobType;
    experienceLevel?: ExperienceLevel;
    salaryMin?: number;
    salaryMax?: number;
    remote?: boolean;
    featured?: boolean;
    page?: number;
    limit?: number;
};

// ===================
// JOB LIST RESPONSES
// ===================

export type JobListResponse = {
    jobs: Job[];
    totalPages: number;
    currentPage: number;
    total: number;
    filters?: JobFilters;
};

export type JobSearchResponse = {
    jobs: Job[];
    totalPages: number;
    currentPage: number;
    total: number;
    searchParams?: JobSearchParams;
    suggestions?: string[]; // Search suggestions
};

// ===================
// JOB STATISTICS
// ===================

export type JobStats = {
    totalJobs: number;
    activeJobs: number;
    featuredJobs: number;
    totalApplications: number;
    averageApplicationsPerJob: number;
    mostPopularJobTypes: {
        jobType: JobType;
        count: number;
    }[];
    mostPopularExperienceLevels: {
        level: ExperienceLevel;
        count: number;
    }[];
    jobsByLocation: {
        location: string;
        count: number;
    }[];
    recentJobs: Job[];
};

export type CompanyJobStats = {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    averageApplicationsPerJob: number;
    mostViewedJobs: Job[];
    recentApplications: number;
};

// ===================
// JOB APPLICATION TYPES
// ===================

export type JobApplication = {
    _id: string;
    job: string | Job; // Can be ID or populated job object
    user: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        profilePicture?: string;
    };
    company: string | JobCompany; // Can be ID or populated company object
    status: ApplicationStatus;
    applicationDate: string; // ISO date string
    coverLetter?: string;
    resume?: string;
    notes?: string;
    appliedVia?: 'website' | 'external' | 'referral';
    source?: string; // Where they found the job
    createdAt?: string;
    updatedAt?: string;
};

export type ApplicationFormData = {
    jobId: string;
    coverLetter?: string;
    resume?: File;
    notes?: string;
    appliedVia?: 'website' | 'external' | 'referral';
    source?: string;
};

/// ===================
// JOB ALERT TYPES
// ===================

export type NotificationFrequency = 'immediate' | 'daily' | 'weekly' | 'monthly';

export type JobAlertLocation = {
    type: 'remote' | 'on-site' | 'hybrid' | 'any';
    city?: string;
    state?: string;
    country?: string;
    radius?: number;
};

export type JobAlert = {
    _id: string;
    user: string;
    name: string;
    keywords: string[];
    skills: string[];
    location: JobAlertLocation;
    jobTypes: JobType[];
    experienceLevels: ExperienceLevel[];
    salaryRange?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    industries: string[];
    companies: string[] | JobCompany[];
    excludeCompanies: string[] | JobCompany[];
    isActive: boolean;
    notificationFrequency: NotificationFrequency;
    notificationPreferences: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    lastChecked?: string;
    totalMatches: number;
    lastNotificationSent?: string;
    createdAt: string;
    updatedAt: string;
};

export type JobAlertFormData = {
    name: string;
    keywords?: string[];
    skills?: string[];
    location?: JobAlertLocation;
    jobTypes?: JobType[];
    experienceLevels?: ExperienceLevel[];
    salaryRange?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    industries?: string[];
    companies?: string[];
    excludeCompanies?: string[];
    notificationFrequency?: NotificationFrequency;
    notificationPreferences?: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
};

export type JobAlertListResponse = {
    jobAlerts: JobAlert[];
    totalPages: number;
    currentPage: number;
    total: number;
};
// ===================
// JOB INTERVIEW TYPES
// ===================

export type InterviewType = 'phone' | 'video' | 'in-person' | 'technical' | 'behavioral' | 'panel' | 'hr';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';

export type JobInterview = {
    _id: string;
    application: string; // Application ID
    job: string | Job; // Can be ID or populated job object
    user: string; // User ID
    company: string | JobCompany; // Can be ID or populated company object
    type: InterviewType;
    status: InterviewStatus;
    scheduledDate: string; // ISO date string
    duration?: number; // in minutes
    location?: string;
    meetingLink?: string;
    interviewer?: string;
    notes?: string;
    feedback?: string;
    rating?: number; // 1-5 scale
    createdAt?: string;
    updatedAt?: string;
};

export type InterviewFormData = {
    applicationId: string;
    type: InterviewType;
    scheduledDate: string;
    duration?: number;
    location?: string;
    meetingLink?: string;
    interviewer?: string;
    notes?: string;
};

// ===================
// JOB ANALYTICS TYPES
// ===================

export type JobAnalytics = {
    jobId: string;
    views: number;
    applications: number;
    conversionRate: number; // applications / views
    topSources: {
        source: string;
        count: number;
    }[];
    dailyViews: {
        date: string;
        views: number;
    }[];
    dailyApplications: {
        date: string;
        applications: number;
    }[];
    demographics: {
        experienceLevel: ExperienceLevel;
        count: number;
    }[];
    timeToApply: number; // Average days from posting to application
};

// ===================
// JOB BULK OPERATIONS
// ===================

export type JobBulkAction = 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete';

export type JobBulkOperation = {
    action: JobBulkAction;
    jobIds: string[];
    reason?: string;
};

export type JobBulkOperationResponse = {
    success: boolean;
    processed: number;
    failed: number;
    errors?: {
        jobId: string;
        error: string;
    }[];
};

// ===================
// JOB EXPORT TYPES
// ===================

export type JobExportFormat = 'csv' | 'excel' | 'pdf';

export type JobExportOptions = {
    format: JobExportFormat;
    includeApplications?: boolean;
    includeAnalytics?: boolean;
    dateRange?: {
        start: string;
        end: string;
    };
    filters?: JobFilters;
};

export type JobExportResponse = {
    downloadUrl: string;
    filename: string;
    expiresAt: string; // ISO date string
};