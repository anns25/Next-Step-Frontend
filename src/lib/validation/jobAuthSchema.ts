import { object, string, minLength, nonEmpty, pipe, custom, literal, union, minValue, maxValue, number, boolean, array, regex, maxLength, InferOutput, optional, isoTimestamp, url, picklist } from 'valibot';
import { JobType, ExperienceLevel, LocationType, SalaryPeriod, JobLocation, JobSalary, JobRequirements } from '@/types/Job';

// Date validation helpers
const getCurrentYear = () => new Date().getFullYear();
const getMinStartYear = () => getCurrentYear() - 60;
const getMaxStartYear = () => getCurrentYear() + 2;

// Job type schemas using the types from Job.ts
export const jobTypeSchema = union([
    literal('full-time'),
    literal('part-time'),
    literal('contract'),
    literal('internship'),
    literal('temporary')
]);

export const experienceLevelSchema = union([
    literal('entry'),
    literal('mid'),
    literal('senior'),
    literal('executive')
]);

export const locationTypeSchema = union([
    literal('remote'),
    literal('on-site'),
    literal('hybrid')
]);

export const salaryPeriodSchema = union([
    literal('hourly'),
    literal('monthly'),
    literal('yearly')
]);

// Location schema
export const locationSchema = object({
    type: locationTypeSchema,
    address: optional(string()),
    city: optional(string()),
    state: optional(string()),
    country: optional(string()),
    zipCode: optional(string()),
    coordinates: optional(object({
        latitude: optional(pipe(
            number(),
            minValue(-90, 'Latitude must be between -90 and 90'),
            maxValue(90, 'Latitude must be between -90 and 90')
        )),
        longitude: optional(pipe(
            number(),
            minValue(-180, 'Longitude must be between -180 and 180'),
            maxValue(180, 'Longitude must be between -180 and 180')
        ))
    }))
});

// Salary schema
export const salarySchema = object({
    min: optional(pipe(
        number(),
        minValue(0, 'Minimum salary must be positive'),
        maxValue(10000000, 'Minimum salary seems too high')
    )),
    max: optional(pipe(
        number(),
        minValue(0, 'Maximum salary must be positive'),
        maxValue(10000000, 'Maximum salary seems too high')
    )),
    currency: optional(pipe(string(), nonEmpty('Currency is required'))),
    period: optional(salaryPeriodSchema),
    isNegotiable: optional(boolean())
});

// Requirements schema
export const requirementsSchema = object({
    skills: optional(array(pipe(
        string(),
        nonEmpty('Skill cannot be empty'),
        minLength(2, 'Skill must be at least 2 characters')
    ))),
    education: optional(string()),
    experience: optional(string()),
    certifications: optional(array(pipe(
        string(),
        nonEmpty('Certification cannot be empty'),
        minLength(2, 'Certification must be at least 2 characters')
    ))),
    languages: optional(array(pipe(
        string(),
        nonEmpty('Language cannot be empty'),
        minLength(2, 'Language must be at least 2 characters')
    )))
});

// Job creation schema
export const jobCreationSchema = object({
    title: pipe(
        string(),
        nonEmpty('Job title is required'),
        maxLength(100, 'Job title cannot exceed 100 characters'),
        minLength(2, 'Job title must be at least 2 characters')
    ),
    
    description: pipe(
        string(),
        nonEmpty('Job description is required'),
        maxLength(5000, 'Description cannot exceed 5000 characters'),
        minLength(10, 'Description must be at least 10 characters')
    ),
    
    company: pipe(
        string(),
        nonEmpty('Company is required'),
        regex(/^[0-9a-fA-F]{24}$/, 'Company must be a valid ObjectId')
    ),
    
    location: locationSchema,
    
    jobType: jobTypeSchema,
    
    experienceLevel: experienceLevelSchema,
    
    salary: optional(salarySchema),
    
    requirements: optional(requirementsSchema),
    
    responsibilities: optional(array(pipe(
        string(),
        nonEmpty('Responsibility cannot be empty'),
        minLength(5, 'Responsibility must be at least 5 characters')
    ))),
    
    benefits: optional(array(pipe(
        string(),
        nonEmpty('Benefit cannot be empty'),
        minLength(3, 'Benefit must be at least 3 characters')
    ))),
    
    applicationDeadline: optional(pipe(
        string(),
        isoTimestamp('Application deadline must be a valid date'),
        custom((value) => {
            if (typeof value !== 'string') return false;
            const date = new Date(value);
            return date > new Date();
        }, 'Application deadline must be a future date')
    )),
    
    startDate: optional(pipe(
        string(),
        isoTimestamp('Start date must be a valid date'),
        custom((value) => {
            if (typeof value !== 'string') return false;
            const date = new Date(value);
            const year = date.getFullYear();
            return year >= getMinStartYear() && year <= getMaxStartYear();
        }, `Start date must be between ${getMinStartYear()} and ${getMaxStartYear()}`)
    )),
    
    isActive: optional(boolean()),
    
    isFeatured: optional(boolean()),
    
    tags: optional(array(pipe(
        string(),
        nonEmpty('Tag cannot be empty'),
        minLength(2, 'Tag must be at least 2 characters')
    ))),
    
    externalUrl: optional(pipe(
        string(),
        url('External URL must be a valid URL')
    )),
    
    applicationInstructions: optional(pipe(
        string(),
        maxLength(1000, 'Application instructions cannot exceed 1000 characters')
    ))
});

// Job update schema (all fields optional)
export const jobUpdateSchema = object({
    title: optional(pipe(
        string(),
        maxLength(100, 'Job title cannot exceed 100 characters'),
        minLength(2, 'Job title must be at least 2 characters')
    )),
    
    description: optional(pipe(
        string(),
        maxLength(5000, 'Description cannot exceed 5000 characters'),
        minLength(10, 'Description must be at least 10 characters')
    )),
    
    company: optional(pipe(
        string(),
        regex(/^[0-9a-fA-F]{24}$/, 'Company must be a valid ObjectId')
    )),
    
    location: optional(locationSchema),
    
    jobType: optional(jobTypeSchema),
    
    experienceLevel: optional(experienceLevelSchema),
    
    salary: optional(salarySchema),
    
    requirements: optional(requirementsSchema),
    
    responsibilities: optional(array(pipe(
        string(),
        nonEmpty('Responsibility cannot be empty'),
        minLength(5, 'Responsibility must be at least 5 characters')
    ))),
    
    benefits: optional(array(pipe(
        string(),
        nonEmpty('Benefit cannot be empty'),
        minLength(3, 'Benefit must be at least 3 characters')
    ))),
    
    applicationDeadline: optional(pipe(
        string(),
        isoTimestamp('Application deadline must be a valid date'),
        custom((value) => {
            if (typeof value !== 'string') return false;
            const date = new Date(value);
            return date > new Date();
        }, 'Application deadline must be a future date')
    )),
    
    startDate: optional(pipe(
        string(),
        isoTimestamp('Start date must be a valid date'),
        custom((value) => {
            if (typeof value !== 'string') return false;
            const date = new Date(value);
            const year = date.getFullYear();
            return year >= getMinStartYear() && year <= getMaxStartYear();
        }, `Start date must be between ${getMinStartYear()} and ${getMaxStartYear()}`)
    )),
    
    isActive: optional(boolean()),
    
    isFeatured: optional(boolean()),
    
    tags: optional(array(pipe(
        string(),
        nonEmpty('Tag cannot be empty'),
        minLength(2, 'Tag must be at least 2 characters')
    ))),
    
    externalUrl: optional(pipe(
        string(),
        url('External URL must be a valid URL')
    )),
    
    applicationInstructions: optional(pipe(
        string(),
        maxLength(1000, 'Application instructions cannot exceed 1000 characters')
    ))
});

// Job ID validation schema
export const jobIdSchema = pipe(
    string(),
    regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID format')
);

// Company ID validation schema
export const companyIdSchema = pipe(
    string(),
    regex(/^[0-9a-fA-F]{24}$/, 'Invalid company ID format')
);

// Type inference for TypeScript - now using Job types
export type JobCreationInput = InferOutput<typeof jobCreationSchema>;
export type JobUpdateInput = InferOutput<typeof jobUpdateSchema>;

// Conditional validation for job creation
type JobCreation = InferOutput<typeof jobCreationSchema>;
export const jobCreationSchemaWithConditions = pipe(
    jobCreationSchema,
    custom((data) => {
        const job = data as JobCreation;
        
        // Validate salary range if both min and max are provided
        if (job.salary?.min && job.salary?.max) {
            if (job.salary.min > job.salary.max) {
                throw new Error('Minimum salary cannot be greater than maximum salary');
            }
        }

        // Validate location requirements for non-remote positions
        if (job.location.type !== 'remote') {
            if (!job.location.city || !job.location.country) {
                throw new Error('City and country are required for non-remote positions');
            }
        }

        // Validate application deadline is in the future
        if (job.applicationDeadline) {
            const deadline = new Date(job.applicationDeadline);
            if (deadline <= new Date()) {
                throw new Error('Application deadline must be a future date');
            }
        }

        // Validate start date is reasonable
        if (job.startDate) {
            const startDate = new Date(job.startDate);
            const year = startDate.getFullYear();
            if (year < getMinStartYear() || year > getMaxStartYear()) {
                throw new Error(`Start date must be between ${getMinStartYear()} and ${getMaxStartYear()}`);
            }
        }

        return true;
    })
);

// Conditional validation for job update
type JobUpdate = InferOutput<typeof jobUpdateSchema>;
export const jobUpdateSchemaWithConditions = pipe(
    jobUpdateSchema,
    custom((data) => {
        const job = data as JobUpdate;
        
        // Validate salary range if both min and max are provided
        if (job.salary?.min && job.salary?.max) {
            if (job.salary.min > job.salary.max) {
                throw new Error('Minimum salary cannot be greater than maximum salary');
            }
        }

        // Validate location requirements for non-remote positions
        if (job.location?.type && job.location.type !== 'remote') {
            if (!job.location.city || !job.location.country) {
                throw new Error('City and country are required for non-remote positions');
            }
        }

        // Validate application deadline is in the future
        if (job.applicationDeadline) {
            const deadline = new Date(job.applicationDeadline);
            if (deadline <= new Date()) {
                throw new Error('Application deadline must be a future date');
            }
        }

        // Validate start date is reasonable
        if (job.startDate) {
            const startDate = new Date(job.startDate);
            const year = startDate.getFullYear();
            if (year < getMinStartYear() || year > getMaxStartYear()) {
                throw new Error(`Start date must be between ${getMinStartYear()} and ${getMaxStartYear()}`);
            }
        }

        return true;
    })
);