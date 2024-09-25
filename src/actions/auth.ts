import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

export async function logout() {
  deleteSession();
  console.log("logout line 6 redirecting to login");
  redirect("/login");
}
