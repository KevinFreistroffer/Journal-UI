// import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

export async function logout() {
  deleteSession();

  // redirect("/login");
}
