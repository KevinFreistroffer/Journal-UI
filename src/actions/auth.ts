// import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function logout() {
  deleteSession();

  // ;
  // redirect("/login");
}
