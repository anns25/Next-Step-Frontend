// export type User = {
//     _id: string;
//     firstName: string;
//     lastName : string;
//     email: string;
//     profilePicture: string;
//     createdAt?: Date;
//     updatedAt?: Date;
// };

// ===================
// AUTH TYPES
// ===================


export type LoginCredentials = {
    email : string;
    password: string;
};

export type RegisterCredentials = {
    firstName : string;
    lastName : string,
    email : string;
    password : string;
    profilePicture: File;
};

export type AuthResponse = {
    data: string; //JWT token
    user: User;
    message: string;
}


// ===================
// USER-RELATED TYPES
// ===================

// Reuse in multiple places
export type Experience = {
  company: string;
  position: string;
  startDate?: string; // ISO string (Date comes as string from API usually)
  endDate?: string | null;
};

export type Education = {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
};

export type Location = {
  city?: string;
  state?: string;
  country?: string;
};

export type Preferences = {
  jobTypes?: ("full-time" | "part-time" | "contract" | "internship" | "remote")[];
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  remoteWork?: boolean;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
};

// The full user type as returned from backend
export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  workStatus?: "fresher" | "experienced";
  resumeHeadline?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  location?: Location;
  preferences?: Preferences;
  role?: "user" | "admin";
  lastLogin?: string; // will be ISO date string
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};