// import { redirect } from "next/navigation";
import { deleteSessions } from "@/lib/session";

export async function logout() {
  await deleteSessions();

  // redirect("/login");
}
