import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string().email(),
  journals: z.array(z.unknown()),
  journalCategories: z.array(z.unknown()),
  resetPasswordToken: z.string(),
  resetPasswordTokenExpires: z.date().nullable(),
  resetPasswordAttempts: z.array(z.object({ timestamp: z.string() })),
  isVerified: z.boolean(),
  avatar: z
    .object({
      data: z.string(),
      contentType: z.string(),
      _id: z.string(),
    })
    .nullable(),
  reminders: z.array(z.unknown()),
  name: z.string().optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  sex: z.string().optional(),
  role: z.enum(["admin", "member"]),
  disabled: z.boolean(),
});
