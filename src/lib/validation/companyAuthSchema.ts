import {
  object,
  string,
  minLength,
  maxLength,
  nonEmpty,
  pipe,
  email,
  url,
  custom,
  optional,
} from "valibot";

// 🔹 Company Login Schema (flat)
export const companyLoginSchema = object({
  email: pipe(
    string(),
    nonEmpty("Email is required"),
    email("Please enter a valid email")
  ),
  password: pipe(
    string(),
    nonEmpty("Password is required")
  ),
});

// 🔹 Company Signup Schema (flat contact.email → email)
export const companySignupSchema = object({
  name: pipe(
    string(),
    nonEmpty("Company name is required"),
    maxLength(100, "Company name cannot exceed 100 characters")
  ),

  description: pipe(
    string(),
    nonEmpty("Company description is required"),
    maxLength(2000, "Company description cannot exceed 2000 characters")
  ),

  industry: pipe(
    string(),
    nonEmpty("Industry is required")
  ),

  website: optional(
    pipe(string(), url("Please enter a valid website URL"))
  ),

  email: pipe(
    string(),
    nonEmpty("Email is required"),
    email("Please enter a valid email")
  ),

  phone: optional(
    custom(
      (value) => typeof value === "string" && /^\+?[1-9]\d{7,14}$/.test(value),
      "Please enter a valid phone number"
    )
  ),

  city: pipe(
    string(),
    nonEmpty("Industry is required")
  ),
  country: pipe(
    string(),
    nonEmpty("Industry is required")
  ),

  password: pipe(
    string(),
    nonEmpty("Password is required"),
    minLength(6, "Password must be at least 6 characters long")
  ),

  logo: optional(
    custom(
      (file) =>
        file instanceof File &&
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024,
      "   Logo must be an image less than 5MB"
    )
  ),
});
