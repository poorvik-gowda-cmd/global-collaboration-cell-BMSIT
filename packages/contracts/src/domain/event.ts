import { z } from "zod";

export const EventStatusSchema = z.enum(["draft", "published"]);

export const EventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().nullable().optional(),
  date: z.string(),
  location: z.string().nullable().optional(),
  category: z.string().min(1, "Category is required"),
  status: EventStatusSchema,
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Event = z.infer<typeof EventSchema>;
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const CreateEventRequestSchema = EventSchema.omit({
  id: true,
  created_by: true,
  created_at: true,
  updated_at: true,
});

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;

export const UpdateEventRequestSchema = CreateEventRequestSchema.partial();

export type UpdateEventRequest = z.infer<typeof UpdateEventRequestSchema>;
