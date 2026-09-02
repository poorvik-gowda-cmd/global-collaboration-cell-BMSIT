import { z } from "zod";

export const RegistrationSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
  registered_at: z.string(),
});

export type Registration = z.infer<typeof RegistrationSchema>;

export const AttendeeSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable().optional(),
  registeredAt: z.string(),
});

export type Attendee = z.infer<typeof AttendeeSchema>;
