export interface CompanyLocation {
  address?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

export interface CompanyContact {
  email: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
}

export interface Company {
  _id?: string;
  name: string;
  description: string;
  website?: string;
  logo?: string;
  industry: string;
  location: CompanyLocation;
  contact: CompanyContact;
  benefits?: string[];
  culture?: string[];
  foundedYear?: number;
  isRemoteFriendly?: boolean;
  canPostJobs?: boolean;
  maxJobs?: number;
  totalJobs?: number;
  totalApplications?: number;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  createdBy?: string;
  lastUpdatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyListResponse {
  companies: Company[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export type CompanyStatus = 'active' | 'inactive' | 'suspended';

// Form data interface for creating/updating companies
export interface CompanyFormData {
  name: string;
  description: string;
  website?: string;
  industry: string;
  location: CompanyLocation;
  contact: CompanyContact;
  benefits?: string[];
  culture?: string[];
  foundedYear?: number;
  isRemoteFriendly?: boolean;
  canPostJobs?: boolean;
  maxJobs?: number;
  status?: CompanyStatus;
}

// Validation schema for company form
export const companyValidationSchema = {
  name: {
    required: "Company name is required",
    minLength: {
      value: 2,
      message: "Company name must be at least 2 characters"
    },
    maxLength: {
      value: 100,
      message: "Company name cannot exceed 100 characters"
    }
  },
  description: {
    required: "Company description is required",
    minLength: {
      value: 10,
      message: "Description must be at least 10 characters"
    },
    maxLength: {
      value: 2000,
      message: "Description cannot exceed 2000 characters"
    }
  },
  website: {
    pattern: {
      value: /^https?:\/\/.+/,
      message: "Please enter a valid website URL (must start with http:// or https://)"
    }
  },
  industry: {
    required: "Industry is required"
  },
  location: {
    city: {
      required: "City is required"
    },
    country: {
      required: "Country is required"
    }
  },
  contact: {
    email: {
      required: "Contact email is required",
      pattern: {
        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        message: "Please enter a valid email address"
      }
    }
  },
  foundedYear: {
    min: {
      value: 1800,
      message: "Founded year must be after 1800"
    },
    max: {
      value: new Date().getFullYear(),
      message: "Founded year cannot be in the future"
    }
  },
  maxJobs: {
    min: {
      value: 1,
      message: "Maximum jobs must be at least 1"
    },
    max: {
      value: 1000,
      message: "Maximum jobs cannot exceed 1000"
    }
  }
};