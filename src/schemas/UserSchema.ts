import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string().email(),
  journals: z.array(z.unknown()),
  journalCategories: z.array(z.unknown()),
  resetPasswordToken: z.string().optional(),
  isVerified: z.boolean(),
});
