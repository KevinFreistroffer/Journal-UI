"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { State } from "@/app/(public)/reset-password/types";
import { Config } from "@/lib/configs";
const schema = z
  .object({
    token: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid input.",
      success: false,
    };
  }

  const { token, password } = validatedFields.data;

  try {
    if (!Config.API_URL) {
      return {
        errors: {},
        message: "Server Error: Failed to reset password.",
        success: false,
      };
    }
    const response = await fetch(`${Config.API_URL}/user/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        errors: {},
        message: errorData.message || "Failed to reset password.",
        success: false,
      };
    }

    return {
      errors: {},
      message:
        "Password reset successful. You can now log in with your new password.",
      success: true,
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      errors: {},
      message: "An error occurred. Please try again later.",
      success: false,
    };
  }
}
