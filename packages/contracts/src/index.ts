import { z } from 'zod';

export const emailSchema = z.string().trim().email().max(320).transform((value) => value.toLowerCase());
export const passwordSchema = z.string().min(10, 'Use at least 10 characters').max(128);

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
  acceptedLegal: z.literal(true),
}).strict();

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
}).strict();

export const organizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(48),
  country: z.string().length(2).default('IN'),
  timezone: z.string().max(80).default('Asia/Kolkata'),
  currency: z.string().length(3).default('INR'),
  locale: z.string().max(20).default('en-IN'),
  industry: z.string().trim().min(2).max(100).default('Professional services'),
}).strict();

export const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).default(''),
  email: emailSchema,
  phone: z.string().trim().max(30).optional().nullable(),
  title: z.string().trim().max(100).optional().nullable(),
  companyName: z.string().trim().max(120).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
}).strict();

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema.optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  source: z.enum(['web_form', 'referral', 'event', 'outbound', 'import', 'marketplace']),
  notes: z.string().trim().max(4000).optional().nullable(),
}).strict().refine((value) => value.email || value.phone, {
  message: 'Add at least one contact channel',
});

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(140),
  code: z.string().trim().regex(/^[A-Za-z0-9-]+$/).min(2).max(20),
  description: z.string().trim().max(4000).optional().nullable(),
  clientCompanyId: z.string().uuid().optional().nullable(),
  dueDate: z.string().date().optional().nullable(),
  visibility: z.enum(['internal', 'client_visible']).default('internal'),
}).strict();

export const taskPatchSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'blocked', 'review', 'done']).optional(),
  blockerReason: z.string().trim().max(1000).optional().nullable(),
  title: z.string().trim().min(1).max(180).optional(),
  dueDate: z.string().date().optional().nullable(),
}).strict().refine((value) => value.status !== 'blocked' || !!value.blockerReason, {
  message: 'A blocked task needs a blocker reason',
});

export const documentReviewSchema = z.object({
  status: z.enum(['in_review', 'approved', 'draft']),
  note: z.string().trim().max(2000).optional().nullable(),
}).strict();

export type SignUpInput = z.infer<typeof signUpSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskPatchInput = z.infer<typeof taskPatchSchema>;

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    field_errors: Array<{ path: string; message: string }>;
    request_id: string;
  };
};
