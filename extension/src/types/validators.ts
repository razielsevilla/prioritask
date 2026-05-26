import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z.string().trim().min(1, "Task title is required.").max(100, "Title is too long."),
  dueAt: z.string().refine((val) => !isNaN(Date.parse(val)), { 
    message: "A valid due date is required." 
  }),
  difficulty: z.number()
    .min(1, "Difficulty must be at least 1.")
    .max(10, "Difficulty cannot exceed 10.")
    .nullable(),
  effortHours: z.number()
    .min(0.5, "Effort must be at least 0.5 hours.")
    .max(100, "Effort seems unreasonably high.")
    .nullable()
});
