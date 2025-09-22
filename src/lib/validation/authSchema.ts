import { object, string, minLength, nonEmpty, pipe, email, custom, literal, union, minValue, maxValue, number, boolean, array, regex, maxLength, InferOutput } from 'valibot';

//Date Validation helpers
const getCurrentYear = () => new Date().getFullYear();
const getMinBirthYear = () => getCurrentYear() - 80;
const getMaxStartYear = () => getCurrentYear() + 2;
const getMinStartYear = () => getCurrentYear() - 60;

export const loginSchema = object({
    email: pipe(string(), email('Must be a valid email address'), nonEmpty('Email is required'),),
    password: pipe(string(), minLength(6, 'Password must be at least 6 characters'), nonEmpty('Password is required')),
});

export const signupSchema = object({
    firstName: pipe(string(), nonEmpty('First name is required'),),
    lastName: pipe(string(), nonEmpty('Last name is required'),),
    password: pipe(string(), minLength(6, 'Password must be at least 6 characters'), nonEmpty('Password is required'),),
    email: pipe(string(), email('Must be a valid email address'), nonEmpty('Email is required'),),
    image: custom(
        (file) => file instanceof File && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024,
        'Profile image is required and must be an image less than 5MB'),
});

export const jobTypeSchema = union([
    literal('full-time'),
    literal('part-time'),
    literal('contract'),
    literal('internship'),
    literal('remote')
]);

export const experienceSchema = object({
    company: pipe(string(), nonEmpty('Company name is required')),
    position: pipe(string(), nonEmpty('Position is required')),
    startDate: pipe(
        string(),
        nonEmpty('Start date is required'),
        custom((value) => {
            if (typeof value !== "string") {
                throw new Error("Invalid start date");
            }
            const date = new Date(value);
            const year = date.getFullYear();
            if (year < getMinStartYear() || year > getCurrentYear()) {
                throw new Error(`Start date must be between ${getMinStartYear()} and ${getCurrentYear()}`);
            }
            return true;
        })
    ),
    endDate: pipe(
        string(),
        nonEmpty('End date is required'),
        custom((value) => {
            if (typeof value !== "string") {
                throw new Error("Invalid end date");
            }
            const date = new Date(value);
            const year = date.getFullYear();
            if (year < getMinStartYear() || year > getMaxStartYear()) {
                throw new Error(`Start date must be between ${getMinStartYear()} and ${getMaxStartYear()}`);
            }
            return true;
        })
    )
});

export const educationSchema = object({
    institution: pipe(string(), nonEmpty('Institution name is required')),
    degree: pipe(string(), nonEmpty('Degree is required')),
    fieldOfStudy: pipe(string(), nonEmpty('Field of Study is required')),
    startDate: pipe(
        string(),
        nonEmpty('Start Date is required'),
        custom(
            (value) => {
                if (typeof value !== "string") return false;
                const year = new Date(value).getFullYear();
                return year >= getMinStartYear() && year <= getMaxStartYear();
            },
            `Start date must be between ${getMinStartYear()} and ${getMaxStartYear()}`
        )
    ),
    endDate: pipe(
        string(),
        nonEmpty('End Date is required'),
        custom(
            (value) => {
                if (typeof value !== "string") return false;
                const year = new Date(value).getFullYear();
                return year >= getMinStartYear() && year <= getMaxStartYear();
            },
            `End date must be between ${getMinStartYear()} and ${getMaxStartYear()}`
        ),
    )
});

export const locationSchema = object({
    city: pipe(string(), nonEmpty('City is required')),
    state: pipe(string(), nonEmpty('State is required')),
    country: pipe(string(), nonEmpty('Country is required')),
});

export const salaryRangeSchema = object({
    min: pipe(
        number(),
        minValue(0, 'Minimum salary must be positive'),
        maxValue(10000000, 'Minimum salary seems too high')
    ),
    max: pipe(
        number(),
        minValue(0, 'Maximum salary must be positive'),
        maxValue(10000000, 'Maximum salary seems too high')
    ),
    currency: pipe(string(), nonEmpty('Currency is required'))

});

export const preferencesSchema = object({
    jobTypes: array(jobTypeSchema),
    salaryRange: salaryRangeSchema,
    remoteWork: boolean(),
    notifications: object({
        email: boolean(),
        push: boolean()
    })
});

// Main profile update schema
export const profileUpdateSchema = object({
    firstName: pipe(
        string(),
        nonEmpty('First name is required'),
        minLength(2, 'First name must be at least 2 characters'),
        regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    ),
    lastName: pipe(
        string(),
        nonEmpty('Last name is required'),
        minLength(2, 'Last name must be at least 2 characters'),
        regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    ),
    email: pipe(
        string(),
        email('Must be a valid email address'),
        nonEmpty('Email is required')
    ),
    resumeHeadline: pipe(
        string(),
        minLength(10, 'Resume headline should be at least 10 characters'),
        maxLength(200, 'Resume headline should be less than 200 characters')
    ),
    skills: array(
        pipe(
            string(),
            nonEmpty('Skill cannot be empty'),
            minLength(2, 'Skill must be at least 2 characters')
        )
    ),
    workStatus: union([
        literal('fresher'),
        literal('experienced'),
    ]),
    experience: array(experienceSchema),
    education: array(educationSchema),
    location: locationSchema,
    preferences: preferencesSchema,
});

// Conditional validation for experienced users

type ProfileUpdate = InferOutput<typeof profileUpdateSchema>;
export const profileUpdateSchemaWithConditions = pipe(
    profileUpdateSchema,
    custom((data) => {
        const profile = data as ProfileUpdate;
        // If work status is experienced, require at least one experience
        if (profile.workStatus === 'experienced' && (!profile.experience || profile.experience.length === 0)) {
            throw new Error('At least one experience entry is required for experienced users');
        }

        // Validate salary range
        if (profile.preferences?.salaryRange?.min && profile.preferences?.salaryRange?.max) {
            if (profile.preferences.salaryRange.min > profile.preferences.salaryRange.max) {
                throw new Error('Minimum salary cannot be greater than maximum salary');
            }
        }

        // Validate date ranges in experience
        if (profile.experience) {
            profile.experience.forEach((exp, index) => {
                if (exp.startDate && exp.endDate) {
                    const startDate = new Date(exp.startDate);
                    const endDate = new Date(exp.endDate);
                    if (startDate >= endDate) {
                        throw new Error(`Experience ${index + 1}: Start date must be before end date`);
                    }
                }
            });
        }

        // Validate date ranges in education
        if (profile.education) {
            profile.education.forEach((edu, index) => {
                if (edu.startDate && edu.endDate) {
                    const startDate = new Date(edu.startDate);
                    const endDate = new Date(edu.endDate);
                    if (startDate >= endDate) {
                        throw new Error(`Education ${index + 1}: Start date must be before end date`);
                    }
                }
            });
        }

        return true;
    })
);







