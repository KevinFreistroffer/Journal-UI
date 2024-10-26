// import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

export async function logout() {
  await deleteSession();

  // redirect("/login");
}
