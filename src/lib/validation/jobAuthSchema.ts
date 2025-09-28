// Validation schema for job form
export const jobValidationSchema = {
  title: {
    required: "Job title is required",
    minLength: {
      value: 2,
      message: "Job title must be at least 2 characters"
    },
    maxLength: {
      value: 100,
      message: "Job title cannot exceed 100 characters"
    }
  },
  description: {
    required: "Job description is required",
    minLength: {
      value: 10,
      message: "Job description must be at least 10 characters"
    },
    maxLength: {
      value: 5000,
      message: "Job description cannot exceed 5000 characters"
    }
  },
  company: {
    required: "Company is required"
  },
  location: {
    type: {
      required: "Location type is required"
    },
    city: {
      required: "City is required for non-remote positions"
    },
    country: {
      required: "Country is required for non-remote positions"
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
  jobType: {
    required: "Job type is required"
  },
  experienceLevel: {
    required: "Experience level is required"
  },
  salary: {
    min: {
      min: {
        value: 0,
        message: "Minimum salary must be positive"
      },
      max: {
        value: 10000000,
        message: "Minimum salary seems too high"
      }
    },
    max: {
      min: {
        value: 0,
        message: "Maximum salary must be positive"
      },
      max: {
        value: 10000000,
        message: "Maximum salary seems too high"
      }
    },
    currency: {
      // Optional field - no validation needed
    },
    period: {
      // Optional field - no validation needed
    },
    isNegotiable: {
      // Boolean field - no specific validation needed
    }
  },
  requirements: {
    skills: {
      // Array field - no specific validation needed
    },
    education: {
      // Optional field - no validation needed
    },
    experience: {
      // Optional field - no validation needed
    },
    certifications: {
      // Array field - no specific validation needed
    },
    languages: {
      // Array field - no specific validation needed
    }
  },
  responsibilities: {
    // Array field - no specific validation needed
  },
  benefits: {
    // Array field - no specific validation needed
  },
  applicationDeadline: {
    pattern: {
      value: /^\d{4}-\d{2}-\d{2}$/,
      message: "Please enter a valid date (YYYY-MM-DD)"
    },
    validate : (value : string) => {
      if(!value) return true; // skip if empty
      const enteredDate = new Date(value);
      const today = new Date();
      today.setHours(0,0,0,0); // remove time part
      if(enteredDate <= today) {
        return "Application deadline must be a future date";
      }
      return true;
    }
  },
  startDate: {
    pattern: {
      value: /^\d{4}-\d{2}-\d{2}$/,
      message: "Please enter a valid date (YYYY-MM-DD)"
    },
    validate: (value: string) => {
      if (!value) return true; // skip if empty
      const enteredDate = new Date(value);
      if (isNaN(enteredDate.getTime())) {
        return "Please enter a valid date";
      }
      return true;
    }
  },
  isActive: {
    // Boolean field - no specific validation needed
  },
  isFeatured: {
    // Boolean field - no specific validation needed
  },
  tags: {
    // Array field - no specific validation needed
  },
  externalUrl: {
    pattern: {
      value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      message: "Please enter a valid URL"
    }
  },
  applicationInstructions: {
    maxLength: {
      value: 1000,
      message: "Application instructions cannot exceed 1000 characters"
    }
  }
};

// Conditional validation schema for job creation
export const jobCreationSchemaWithConditions = {
  ...jobValidationSchema,
  
  // Override location validation for conditional requirements
  location: {
    ...jobValidationSchema.location,
    city: {
      required: "City is required for non-remote positions"
    },
    country: {
      required: "Country is required for non-remote positions"
    }
  },
  
  // Override salary validation for range validation
  salary: {
    ...jobValidationSchema.salary,
    max: {
      ...jobValidationSchema.salary.max,
      custom: {
        message: "Maximum salary must be greater than minimum salary"
      }
    }
  }
};