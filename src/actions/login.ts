"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { State, LoginFunction } from "../app/login/types";
import { UserSchema } from "../schemas/UserSchema";
import { createSession } from "../lib/session";
import { IUser } from "../lib/interfaces";

const LoginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
  staySignedIn: z.boolean().optional(),
});

// @ts-expect-error - FIX
export const login: LoginFunction = async (
  prevState: State,
  formData: FormData
) => {
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

    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: errorData.message || "Failed to login.",
      };
    }

    const data = await response.json();
    const userDataResult = UserSchema.safeParse(data.data);

    if (!userDataResult.success) {
      console.error("Invalid user data:", userDataResult.error);
      return {
        message: "Failed to login. Please try again.",
      };
    }

    const userData = userDataResult.data as IUser;

    if (!userData.isVerified) {
      return {
        message:
          "Login successful, but the account is not verified. Please check your email for verification.",
      };
    }
    console.log("creating session");
    // Create a session using the user's _id
    await createSession(userData);
    console.log("created session");
    // Get the Set-Cookie header from the response
    const setCookieHeader = response.headers.get("Set-Cookie");

    if (setCookieHeader) {
      // Parse the Set-Cookie header and set it in the client-side cookies
      const cookieValue = setCookieHeader.split(";")[0];
      const [cookieName, cookieVal] = cookieValue.split("=");
      cookies().set(cookieName, cookieVal, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // TODO: Check this
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
    } else {
      console.warn("No Set-Cookie header found in the response");
    }

    // Deleting because already am using createSession()
    // // Set a cookie to simulate user session
    // cookies().set(
    //   "user",
    //   JSON.stringify({ usernameOrEmail: data.usernameOrEmail }),
    //   {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     maxAge: 60 * 60 * 24 * 7, // 1 week
    //     path: "/",
    //   }
    // );

    console.log("Login Action sending success response");
    return {
      errors: {},
      message: "Login successful.",
      redirect: "/dashboard",
      user: userData, // TODO: Not sure if this is the best way to do this.
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
