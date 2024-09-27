"use server";

import { cookies } from "next/headers";
import { COOKIE_CONSENT } from "@/lib/constants";
export async function setCookieConsent(consent: boolean) {
  cookies().set(COOKIE_CONSENT, consent.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}
