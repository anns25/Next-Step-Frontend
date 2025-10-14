export interface Interview {
  _id: string;
  application: {
    _id: string;
    status: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  company: {
    _id: string;
    name: string;
    logo?: string;
  };
  job: {
    _id: string;
    title: string;
  };
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'panel' | 'hr' | 'final';
  round: number;
  scheduledDate: string;
  duration: number;
  location: {
    type: 'office' | 'remote' | 'phone';
    address?: string;
    meetingLink?: string;
    phoneNumber?: string;
  };
  interviewers: Array<{
    name: string;
    email?: string;
    title?: string;
    linkedin?: string;
  }>;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  preparation?: {
    notes?: string;
    questions?: string[];
    research?: string;
    documents?: string[];
  };
  feedback?: {
    userNotes?: string;
    interviewerFeedback?: string;
    rating?: number;
    strengths?: string[];
    areasForImprovement?: string[];
  };
  outcome?: 'pending' | 'passed' | 'failed' | 'cancelled';
  nextSteps?: string;
  reminderSent: boolean;
  reminderDate?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewStats {
  totalInterviews: number;
  upcomingInterviews: number;
  completedInterviews: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byOutcome: Record<string, number>;
  averageRating: number;
}

export interface InterviewFilters {
  status?: string;
  type?: string;
  upcoming?: boolean;
  past?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateInterviewData {
  applicationId: string;
  type: Interview['type'];
  round?: number;
  scheduledDate: string;
  duration?: number;
  location: {
    type: 'office' | 'remote' | 'phone';
    address?: string;
    meetingLink?: string;
    phoneNumber?: string;
  };
  interviewers?: Array<{
    name: string;
    email?: string;
    title?: string;
    linkedin?: string;
  }>;
  preparation?: {
    notes?: string;
    questions?: string[];
    research?: string;
    documents?: string[];
  };
  nextSteps?: string;
}

export interface UpdateInterviewData {
  type?: Interview['type'];
  round?: number;
  scheduledDate?: string;
  duration?: number;
  location?: {
    type?: 'office' | 'remote' | 'phone';
    address?: string;
    meetingLink?: string;
    phoneNumber?: string;
  };
  interviewers?: Array<{
    name: string;
    email?: string;
    title?: string;
    linkedin?: string;
  }>;
  nextSteps?: string;
}