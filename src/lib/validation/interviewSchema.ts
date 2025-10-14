import {
  object,
  string,
  number,
  array,
  optional,
  pipe,
  custom,
  picklist,
  minLength,
  maxLength,
  InferOutput,
  nonEmpty,
  url,
  regex,
  minValue,
  maxValue,
} from 'valibot';

// Helper to check if date is in the future
const isFutureDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

// Helper to check MongoDB ObjectId format
const isValidObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

// Location schema
const locationSchema = object({
  type: picklist(['office', 'remote', 'phone'], 'Invalid location type'),
  address: optional(
    pipe(
      string(),
      minLength(3, 'Address must be at least 3 characters'),
      maxLength(200, 'Address must not exceed 200 characters')
    )
  ),
  meetingLink: optional(pipe(string(), url('Invalid meeting link URL'))),
  phoneNumber: optional(
    pipe(
      string(),
      regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    )
  ),
});

// Interviewer schema
const interviewerSchema = object({
  name: pipe(
    string(),
    minLength(2, 'Name must be at least 2 characters'),
    maxLength(100, 'Name must not exceed 100 characters')
  ),
  email: optional(pipe(string(), custom((value) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string);
  }, 'Invalid email address'))),
  title: optional(string()),
  linkedin: optional(string()),
});

// Preparation schema
const preparationSchema = object({
  notes: optional(
    pipe(string(), maxLength(2000, 'Preparation notes must not exceed 2000 characters'))
  ),
  questions: optional(array(string())),
  research: optional(
    pipe(string(), maxLength(2000, 'Research must not exceed 2000 characters'))
  ),
  documents: optional(array(string())),
});

// Feedback schema (for completing interview)
const feedbackSchema = object({
  userNotes: optional(
    pipe(string(), maxLength(2000, 'User notes must not exceed 2000 characters'))
  ),
  interviewerFeedback: optional(string()),
  rating: optional(
    pipe(
      number(),
      minValue(1, 'Rating must be at least 1'),
      maxValue(5, 'Rating must not exceed 5')
    )
  ),
  strengths: optional(array(string())),
  areasForImprovement: optional(array(string())),
});

// --- CREATE INTERVIEW SCHEMA ---
export const createInterviewSchema = object({
  applicationId: pipe(
    string(),
    nonEmpty('Application ID is required'),
    custom((value) => isValidObjectId(value as string), 'Invalid application ID')
  ),
  userId: pipe(
    string(),
    nonEmpty('User ID is required'),
    custom((value) => isValidObjectId(value as string), 'Invalid user ID')
  ),
  type: picklist(
    ['phone', 'video', 'in-person', 'technical', 'panel', 'hr', 'final'],
    'Invalid interview type'
  ),
  round: optional(
    pipe(number(), minValue(1, 'Round must be at least 1'))
  ),
  scheduledDate: pipe(
    string(),
    nonEmpty('Scheduled date is required'),
    custom(
      (value) => isFutureDate(value as string),
      'Scheduled date must be in the future'
    )
  ),
  duration: optional(
    pipe(
      number(),
      minValue(15, 'Duration must be at least 15 minutes'),
      maxValue(480, 'Duration must not exceed 480 minutes')
    )
  ),
  location: locationSchema,
  interviewers: optional(array(interviewerSchema)),
  preparation: optional(preparationSchema),
  nextSteps: optional(
    pipe(string(), maxLength(500, 'Next steps must not exceed 500 characters'))
  ),
});

// --- UPDATE INTERVIEW SCHEMA ---
export const updateInterviewSchema = object({
  type: optional(
    picklist(
      ['phone', 'video', 'in-person', 'technical', 'panel', 'hr', 'final'],
      'Invalid interview type'
    )
  ),
  scheduledDate: optional(
    pipe(
      string(),
      custom(
        (value) => isFutureDate(value as string),
        'Scheduled date must be in the future'
      )
    )
  ),
  duration: optional(
    pipe(
      number(),
      minValue(15, 'Duration must be at least 15 minutes'),
      maxValue(480, 'Duration must not exceed 480 minutes')
    )
  ),
  status: optional(
    picklist(
      ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      'Invalid status'
    )
  ),
  location: optional(locationSchema),
  interviewers: optional(array(interviewerSchema)),
  nextSteps: optional(
    pipe(string(), maxLength(500, 'Next steps must not exceed 500 characters'))
  ),
});

// --- RESCHEDULE INTERVIEW SCHEMA ---
export const rescheduleInterviewSchema = object({
  scheduledDate: pipe(
    string(),
    nonEmpty('New scheduled date is required'),
    custom(
      (value) => isFutureDate(value as string),
      'Scheduled date must be in the future'
    )
  ),
  duration: optional(
    pipe(
      number(),
      minValue(15, 'Duration must be at least 15 minutes'),
      maxValue(480, 'Duration must not exceed 480 minutes')
    )
  ),
  location: optional(locationSchema),
});

// --- COMPLETE INTERVIEW SCHEMA ---
export const completeInterviewSchema = object({
  feedback: optional(feedbackSchema),
  outcome: optional(
    picklist(['pending', 'passed', 'failed', 'cancelled'], 'Invalid outcome')
  ),
  nextSteps: optional(
    pipe(string(), maxLength(500, 'Next steps must not exceed 500 characters'))
  ),
});

// --- UPDATE PREPARATION SCHEMA ---
export const updatePreparationSchema = object({
  notes: optional(
    pipe(string(), maxLength(2000, 'Notes must not exceed 2000 characters'))
  ),
  questions: optional(array(string())),
  research: optional(
    pipe(string(), maxLength(2000, 'Research must not exceed 2000 characters'))
  ),
  documents: optional(array(string())),
});

// --- TYPE EXPORTS ---
export type CreateInterviewInput = InferOutput<typeof createInterviewSchema>;
export type UpdateInterviewInput = InferOutput<typeof updateInterviewSchema>;
export type RescheduleInterviewInput = InferOutput<typeof rescheduleInterviewSchema>;
export type CompleteInterviewInput = InferOutput<typeof completeInterviewSchema>;
export type UpdatePreparationInput = InferOutput<typeof updatePreparationSchema>;