"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { State, LoginFunction } from "@/app/(public)/login/types";
import { UserSchema } from "@/lib/schemas/UserSchema";
import { createClientSession } from "@/lib/session";
import { IUser } from "@/lib/interfaces";
import { Config } from "@/lib/configs";

const LoginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
  staySignedIn: z.boolean().optional(),
});

export const login: LoginFunction = async (
  prevState: State,
  formData: FormData
) => {
  console.log(formData)
  if (!Config.API_URL) {
    return {
      errors: {},
      redirect: null,
      user: null,
      message: "Server Error: API URL is not defined.",
      success: false,
      isVerified: false,
    };
  }
  console.log(formData)
  // Validate form data
  const validatedFields = LoginSchema.safeParse({
    usernameOrEmail: formData.get("usernameOrEmail"),
    password: formData.get("password"),
    staySignedIn: formData.has("staySignedIn")
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      redirect: null,
      user: null,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid login credentials.",
      success: false,
      isVerified: false,
    };
  }

  const { usernameOrEmail, password, staySignedIn } = validatedFields.data;

  try {
    const response = await fetch(`${Config.API_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({
        usernameOrEmail,
        password,
        staySignedIn,
      }),
    });

    if (!response.ok) {
      return handleErrorResponse(response);
    }

    return handleSuccessResponse(response);
  } catch (error) {
    console.error("login action error", error);
    return {
      redirect: null,
      user: null,
      errors: prevState.errors ?? {},
      message: "Server Error: Failed to login.",
      success: false,
      isVerified: false,
    };
  }
};

const handleErrorResponse= async (response: Response) => {
  const responseData = await response.json();
  console.log("responseData", responseData);
  // { message: 'error', description: 'Too many requests!', code: 429 }

    let errorMessage = "Failed to login.";
    if (responseData.description === "User not found.") {
      errorMessage = "No account found with these credentials.";
    } else {
      errorMessage =
      responseData.message || responseData.description || errorMessage;
    }
    return {
      errors: {},
      redirect: null,
      user: null,
      message: errorMessage,
      success: false,
      isVerified: false,
    };
}

const handleSuccessResponse = async (response: Response) => {
  const responseData = await response.json();
  console.log("responseData", responseData);
  const userDataResult = UserSchema.safeParse(responseData.data);
    if (!userDataResult.success) {
      console.error(
        "Invalid user data. Did the API have an update to the user schema?",
        userDataResult.error
      );
      return {
        errors: {},
        redirect: null,
        message: "Failed to login. Please try again.",
        success: false,
        user: null,
        isVerified: false,
      };
    }

    const userData = userDataResult.data as unknown as IUser;

    if (!userData.isVerified) {
      return {
        errors: {},
        redirect: null,
        user: userData,
        message:
          "Login successful, but the account is not verified. Please check your email for verification.",
        success: true,
        isVerified: false,
      };
    }
    // Create a session using the user's _id
    await createClientSession(userData._id, userData.isVerified, userData.role);
    // Get the Set-Cookie header from the response
    const setCookieHeader = response.headers.get("Set-Cookie");

    if (setCookieHeader) {
      const cookieValue = setCookieHeader.split(";")[0];
      const [cookieName, cookieVal] = cookieValue.split("=");

      const cookie = await cookies();
      cookie.set(cookieName, cookieVal, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });
    } else {
      console.warn("No Set-Cookie header found in the response");
    }

    // Deleting because already am using createClientSession()
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

    return {
      errors: {},
      message: "Login successful.",
      redirect: "/dashboard", // remove, not using
      user: userData, // TODO: Not sure if this is the best way to do this.
      success: true,
      isVerified: true,
    };
}
