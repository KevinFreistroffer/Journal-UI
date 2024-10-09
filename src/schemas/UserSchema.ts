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
});
