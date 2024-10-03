import "server-only";
import { getUserById } from "@/lib/dal";
import { IUser } from "./interfaces";

function canSeeUsername(viewer: IUser) {
  return true;
}

function canSeeSignOutLink(viewer: IUser) {
  return true;
}

export async function getProfileDTO(userId: string) {
  const user = await getUserById(userId);

  if (!user) {
    return null;
  }

  // Or return only what's specific to the query here
  return {
    username: canSeeUsername(user) ? user.username : null,
    signOutLink: canSeeSignOutLink(user) ? user.signOutLink : null,
  };
}
