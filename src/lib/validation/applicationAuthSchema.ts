import {
  object,
  string,
  maxLength,
  optional,
  pipe,
  custom,
  file,
  picklist,
  InferOutput,
} from 'valibot';

// --- APPLICATION CREATION ---
export const applicationCreationSchema = pipe(
  object({
    jobId: optional(
      pipe(
        string(),
        custom((value: unknown) => {
          // MongoDB ObjectId format check
          return /^[0-9a-fA-F]{24}$/.test(value as string);
        }, 'Job ID must be a valid ObjectId')
      )
    ),
    job: optional(
      pipe(
        string(),
        custom((value: unknown) => {
          return /^[0-9a-fA-F]{24}$/.test(value as string);
        }, 'Job ID must be a valid ObjectId')
      )
    ),
    coverLetter: optional(pipe(string(), maxLength(2000, 'Cover letter cannot exceed 2000 characters'))),
    notes: optional(pipe(string(), maxLength(500, 'Notes cannot exceed 500 characters'))),
    resume: pipe(
      file(),
      custom((input: unknown) => {
        const file = input as File; // ✅ typecast inside
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        const maxSize = 5 * 1024 * 1024; // 5 MB

        if (!allowedTypes.includes(file.type)) {
          throw new Error('Resume must be a PDF or Word document');
        }
        if (file.size > maxSize) {
          throw new Error('Resume file size cannot exceed 5MB');
        }
        return true;
      })
    ),
  }),
  custom((input: unknown) => {
    const data = input as { jobId?: string; job?: string };
    if (!data.jobId && !data.job) {
      throw new Error('Either jobId or job is required');
    }
    return true;
  })
);

// --- APPLICATION UPDATE ---
export const applicationUpdateSchema = object({
  status: optional(
    picklist(
      [
        'applied',
        'under-review',
        'shortlisted',
        'interview-scheduled',
        'interviewed',
        'rejected',
        'accepted',
        'withdrawn',
      ],
      'Invalid status'
    )
  ),
  notes: optional(pipe(string(), maxLength(500, 'Notes cannot exceed 500 characters'))),
});

// --- TYPES ---
export type ApplicationCreationInput = InferOutput<typeof applicationCreationSchema>;
export type ApplicationUpdateInput = InferOutput<typeof applicationUpdateSchema>;
