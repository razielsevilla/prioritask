import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z.string().trim().min(1, "Task title is required.").max(100, "Title is too long."),
  dueAt: z.string().refine((val) => !isNaN(Date.parse(val)), { 
    message: "A valid due date is required." 
  }),
  tShirtSize: z.enum(['S', 'M', 'L'])
});
