
import { z } from 'zod';

export const profileSettingsSchema = z.object({
  chatbot_name: z.string().min(1).max(50).optional(),
  welcome_message: z.string().min(1).max(200).optional(),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export const passwordChangeSchema = z.object({
  newPassword: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const trialSchema = z.object({
  user_id: z.string().uuid(),
  trial_ends_at: z.string().datetime(),
});
