// Validation schema for company form
export const companyValidationSchema = {
  name: {
    required: "Company name is required",
    minLength: {
      value: 1,
      message: "Company name must be at least 1 character"
    },
    maxLength: {
      value: 100,
      message: "Company name cannot exceed 100 characters"
    }
  },
  description: {
    required: "Company description is required",
    minLength: {
      value: 1,
      message: "Description must be at least 1 character"
    },
    maxLength: {
      value: 2000,
      message: "Description cannot exceed 2000 characters"
    }
  },
  website: {
    pattern: {
      value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      message: "Please enter a valid website URL"
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
    },
    address: {
      // Optional field - no validation needed
    },
    state: {
      // Optional field - no validation needed
    },
    zipCode: {
      // Optional field - no validation needed
    }
  },
  contact: {
    email: {
      required: "Contact email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email"
      }
    },
    phone: {
      pattern: {
        value: /^[\+]?[1-9][\d]{0,15}$/,
        message: "Please enter a valid phone number"
      }
    },
    linkedin: {
      pattern: {
        value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        message: "Please enter a valid LinkedIn URL"
      }
    },
    twitter: {
      pattern: {
        value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        message: "Please enter a valid Twitter URL"
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
  isRemoteFriendly: {
    // Boolean field - no specific validation needed
  },
  benefits: {
    // Array field - no specific validation needed
  },
  culture: {
    // Array field - no specific validation needed
  },
  status: {
    pattern: {
      value: /^(active|inactive|suspended)$/,
      message: "Status must be active, inactive, or suspended"
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