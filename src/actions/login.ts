"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { State, LoginFunction } from "../app/login/types";
import { UserSchema } from "../schemas/UserSchema";

// Define a schema for input validation
const LoginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
  staySignedIn: z.boolean().optional(),
});

export const login: LoginFunction = async (
  prevState: State,
  formData: FormData
) => {
  console.log("formData", formData);
  // Validate form data
  const validatedFields = LoginSchema.safeParse({
    usernameOrEmail: formData.get("usernameOrEmail"),
    password: formData.get("password"),
    staySignedIn: formData.has("staySignedIn")
      ? formData.get("staySignedIn") === "true"
      : false,
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid login credentials.",
    };
  }

  const { usernameOrEmail, password, staySignedIn } = validatedFields.data;

  try {
    console.log("sending data to server");

    const response = await fetch("http://localhost:3001/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        usernameOrEmail,
        password,
        staySignedIn,
      }),
    });

    console.log("response", response);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: errorData.message || "Failed to login.",
      };
    }

    const data = await response.json();
    console.log("data", data);
    const userDataResult = UserSchema.safeParse(data.data);

    if (!userDataResult.success) {
      console.error("Invalid user data:", userDataResult.error);
      return {
        message: "Failed to login. Please try again.",
      };
    }

    const userData = userDataResult.data;

    if (!userData.isVerified) {
      return {
        message:
          "Login successful, but the account is not verified. Please check your email for verification.",
      };
    }

    // Set a cookie to simulate user session
    cookies().set(
      "user",
      JSON.stringify({ usernameOrEmail: data.usernameOrEmail }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      }
    );

    return {
      ...prevState,
      errors: {},
      message: "Logged in successfully.",
    };
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      errors: prevState.errors ?? {},
      message: "Server Error: Failed to login.",
    };
  }
};
