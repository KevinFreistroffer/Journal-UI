import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

export async function logout() {
  deleteSession();
  console.log("redirecting to login");
  redirect("/login");
}
