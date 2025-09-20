export type Company = {
    _id: string;
    name: string;
    description?: string;
    industry?: string;
    website?: string;
    logo?: string;
    contact: {
        email: string;
        phone?: string;
    };
    location: {
        address?: string;
        city: string;
        state?: string;
        country: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
};

export type CompanyLoginCredentials = {
    email: string;
    password: string;
};

export type CompanyRegisterCredentials = {
    name: string;
    description?: string;
    industry?: string;
    website?: string;
    contact: {
        email: string;
        phone?: string;
    };
    password: string;
    location?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
    };
    logo?: File;
};

export type CompanyAuthResponse = {
    data: string; // JWT token
    company: Company;
    message: string;
};
