import {
    object, string, minLength, nonEmpty, pipe, email,
    custom, literal, union, number, boolean, array,
    regex, maxLength, InferOutput, optional
} from 'valibot';

// --- LOGIN ---
export const loginSchema = object({
    email: pipe(string(), email('Please enter a valid email'), nonEmpty('Email is required')),
    password: pipe(string(), nonEmpty('Password is required')),
});

// --- SIGNUP (USER) ---
export const signupSchema = object({
    firstName: pipe(string(), nonEmpty('First name is required')),
    lastName: pipe(string(), nonEmpty('Last name is required')),
    email: pipe(string(), email('Please enter a valid email'), nonEmpty('Email is required')),
    password: pipe(string(), minLength(6, 'Password must be at least 6 characters'), nonEmpty('Password is required')),
    role: optional(literal('user')), // must equal "user" if provided
    image: optional(string()), // handled by controller (file upload)
});

// --- SIGNUP (ADMIN) ---
export const adminSignupSchema = object({
    firstName: pipe(string(), nonEmpty('First name is required')),
    lastName: pipe(string(), nonEmpty('Last name is required')),
    email: pipe(string(), email('Please enter a valid email'), nonEmpty('Email is required')),
    password: pipe(string(), minLength(6, 'Password must be at least 6 characters'), nonEmpty('Password is required')),
    role: literal('admin'),
    image: optional(string()), // handled by controller
});

// --- JOB TYPES ---
export const jobTypeSchema = union([
    literal('full-time'),
    literal('part-time'),
    literal('contract'),
    literal('internship'),
    literal('remote'),
]);


const getYearBounds = () => {
    const currentYear = new Date().getFullYear();
    return { min: currentYear - 60, max: currentYear + 2 };
};

export const experienceSchema = object({
    company: pipe(string(), nonEmpty('Company name is required')),
    position: pipe(string(), nonEmpty('Position is required')),
    startDate: pipe(
        string(),
        nonEmpty('Start date is required'),
        custom((value: unknown) => {
            const year = new Date(value as string).getFullYear();
            const { min, max } = getYearBounds();
            return year >= min && year <= max; // true = valid, false = invalid
        }, (value: unknown) => {
            const year = new Date(value as string).getFullYear();
            const { min, max } = getYearBounds();
            return `Start date must be between ${min} and ${max}`;
        })
    ),
    endDate: pipe(
        string(),
        custom((value: unknown) => {
            if (!value) return true;
            const year = new Date(value as string).getFullYear();
            const { min, max } = getYearBounds();
            return year >= min && year <= max;
        }, (value: unknown) => {
            const year = new Date(value as string).getFullYear();
            const { min, max } = getYearBounds();
            return `End date must be between ${min} and ${max}`;
        }),
    ),
});



// --- EDUCATION ---
export const educationSchema = object({
    institution: pipe(string(), nonEmpty('Institution is required')),
    degree: pipe(string(), nonEmpty('Degree is required')),
    fieldOfStudy: pipe(string(), nonEmpty('Field of study is required')),
    startDate: pipe(
        string(),
        nonEmpty('Start date is required'),
        custom((value: unknown) => {
            const year = new Date(value as string).getFullYear();
            const { min, max } = getYearBounds();
            return year >= min && year <= max; // true = valid, false = invalid
        }, (value: unknown) => {
            const year = new Date(value as string).getFullYear();
            const { min, max } = getYearBounds();
            return `Start date must be between ${min} and ${max}`;
        })
    ),
    endDate: pipe(
        string(),
        custom((value: unknown) => {
            if (!value) return true;
            const year = new Date(value as string).getFullYear();
            const { min, max } = getYearBounds();
            return year >= min && year <= max;
        }, (value: unknown) => {
            const year = new Date(value as string).getFullYear();
            const { min, max } = getYearBounds();
            return `End date must be between ${min} and ${max}`;
        })
    ),
});

// --- LOCATION ---
export const locationSchema = object({
    city: optional(string()),
    state: optional(string()),
    country: optional(string()),
});

// --- PREFERENCES ---
export const salaryRangeSchema = object({
    min: optional(number()),
    max: optional(number()),
    currency: optional(string()),
});

export const preferencesSchema = object({
    jobTypes: optional(array(jobTypeSchema)),
    salaryRange: optional(salaryRangeSchema),
    remoteWork: optional(boolean()),
    notifications: optional(object({
        email: optional(boolean()),
        push: optional(boolean()),
    })),
});

// --- PROFILE UPDATE (USER) ---
export const profileUpdateSchema = object({
    firstName: optional(string()),
    lastName: optional(string()),
    email: optional(pipe(string(), email('Please enter a valid email'))),
    password: optional(pipe(string(), minLength(6, 'Password must be at least 6 characters'))),
    workStatus: optional(union([literal('fresher'), literal('experienced')])),
    skills: optional(array(string())),
    experience: optional(array(experienceSchema)),
    education: optional(array(educationSchema)),
    location: optional(locationSchema),
    preferences: optional(preferencesSchema),
});

// Conditional: experienced users must have at least one experience
type ProfileUpdate = InferOutput<typeof profileUpdateSchema>;
export const profileUpdateSchemaWithConditions = pipe(
    profileUpdateSchema,
    custom((data) => {
        const profile = data as ProfileUpdate;
        if (profile.workStatus === 'experienced') {
            if (!profile.experience || profile.experience.length === 0) {
                throw new Error('At least one experience entry is required for experienced users');
            }
            profile.experience.forEach((exp, i) => {
                if (!exp.company || !exp.position || !exp.startDate) {
                    throw new Error(`Experience #${i + 1} must include company, position, and startDate`);
                }
            });
        }
        if (profile.workStatus === 'fresher' && profile.experience?.length) {
            throw new Error('Freshers cannot have experience entries');
        }
        return true;
    })
);

// --- PROFILE UPDATE (ADMIN) ---
export const adminUpdateSchema = object({
    firstName: optional(string()),
    lastName: optional(string()),
    email: optional(pipe(string(), email('Please enter a valid email'))),
    password: optional(pipe(string(), minLength(6, 'Password must be at least 6 characters'))),
});
