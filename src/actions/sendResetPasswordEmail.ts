"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { State } from "@/app/(public)/recover-password/types";
import { Config } from "@/lib/configs";
const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function sendResetPasswordEmailFunction(
  prevState: State,
  formData: FormData
) {
  const validatedFields = schema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid email.",
      success: false,
    };
  }

  const { email } = validatedFields.data;

  try {
    if (!Config.API_URL) {
      return {
        errors: {},
        message: "Server Error: Failed to send reset password email.",
        success: false,
      };
    }
    const redirectURL = `${Config.API_URL}/reset-password`;
    const response = await fetch(
      `${Config.API_URL}/user/send-reset-password-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies().toString(),
        },
        body: JSON.stringify({ email, redirectURL }),
      }
    );

    // const body = await response.json();

    if (!response.ok) {
      return {
        errors: {},
        message: "Something went wrong. Try again.",
        success: false,
      };
    }

    return {
      errors: {},
      message:
        "If an account exists for this email, a password reset link has been sent.",
      success: true,
    };
  } catch (error) {
    console.error("Password recovery error:", error);
    return {
      errors: {},
      message: "An error occurred. Please try again later.",
      success: false,
    };
  }
}
