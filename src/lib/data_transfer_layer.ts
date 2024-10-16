import "server-only";
import { getUserById } from "@/lib/data_access_layer";
import { IUser } from "./interfaces";

// @ts-ignore
function canSeeUsername(viewer: IUser) {
  console.log("canSeeUsername viewer", viewer);
  return true;
}

// @ts-ignore
function canSeeSignOutLink(viewer: IUser) {
  console.log("canSeeSignOutLink viewer", viewer);
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
