import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string().email(),
  entries: z.array(z.unknown()),
  entryCategories: z.array(z.unknown()),
  resetPasswordToken: z.string(),
  resetPasswordTokenExpires: z.date().nullable(),
  resetPasswordAttempts: z.array(z.object({ timestamp: z.string() })),
  isVerified: z.boolean(),
});
