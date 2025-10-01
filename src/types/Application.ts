export interface Application {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  job: {
    _id: string;
    title: string;
    description: string;
    location: {
      type: string;
      city?: string;
      state?: string;
      country?: string;
    };
    jobType: string;
    experienceLevel: string;
    salary?: {
      min?: number;
      max?: number;
      currency: string;
      period: string;
    };
    applicationDeadline?: string;
  };
  company: {
    _id: string;
    name: string;
    logo?: string;
    industry: string;
    location: {
      city: string;
      country: string;
    };
  };
  status: 'applied' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'interviewed' | 'rejected' | 'accepted' | 'withdrawn';
  applicationDate: string;
  resume: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  coverLetter: string;
  notes?: string;
  is_deleted: boolean;
  deletedAt?: string;
  restoredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  totalApplications: number;
  applied: number;
  underReview: number;
  shortlisted: number;
  interviewScheduled: number;
  interviewed: number;
  rejected: number;
  accepted: number;
  withdrawn: number;
  recentApplications: number;
  avgResponseTime: number;
}

export interface ApplicationFormData {
  jobId: string;
  coverLetter: string;
  notes: string;
  resume: File | null;
}

export interface ApplicationFilters {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}