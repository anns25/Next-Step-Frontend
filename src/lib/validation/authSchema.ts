import { object, string, minLength, nonEmpty, pipe, email, custom } from 'valibot';

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




