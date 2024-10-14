"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { State, SignUpFunction } from "../app/(public)/signup/types";
import { createSession } from "../lib/session";
import { has } from "lodash";
// Import the crypto module
// Define a schema for input validation
const SignUpSchema = z
  .object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signUp: SignUpFunction = async (
  prevState: State,
  formData: FormData
) => {
  // Validate form data
  const validatedFields = SignUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create account.",
      isLoading: false,
      success: false,
    };
  }

  if (!process.env.SESSION_SECRET) {
    return {
      errors: {
        generalError: "Server Error. Please try again later.",
      },
      message: "Server Error. Please try again later.",
      isLoading: false,
      success: false,
    };
  }

  const { username, email, password } = validatedFields.data;

  try {
    // Send data to Node.js server
    const response = await fetch("http://localhost:3001/user/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({ username, email, password }),
    });

    const body = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        return {
          errors: {
            usernameOrEmailUnAvailable:
              "Username and/or email is not available.",
          },
          message: body.message || "Failed to create account.",
          isLoading: false,
          success: false,
        };
      }

      if (response.status === 500) {
        return {
          errors: {
            generalError: "Something went wrong. Please try again later.",
          },
          message: "Failed to create account.",
          isLoading: false,
          success: false,
        };
      }
    }

    if (!has(body, "data")) {
      return {
        errors: {
          generalError: "Something went wrong. Please try again later.",
        },
        message: "Something went wrong. Please try again later.",
        isLoading: false,
        success: false,
      };
    }

    const user = body.data;

    await createSession(user._id, user.isVerified);

    return {
      errors: {},
      message:
        "Account created successfully. An email has been sent to verify your account.",
      isLoading: false,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      errors: prevState.errors ?? {},
      message: "Database Error: Failed to create account.",
      isLoading: false,
      success: false,
    };
  }
};
