import { IUser } from "./interfaces";
import { getUser } from "./data_access_layer";

let isSessionChecked = false;

export async function initializeSession(
  setUser: (user: IUser | null) => void,
  setFilteredEntries: (entries: any[]) => void
) {
  if (isSessionChecked) return;

  try {
    const sessionUser = await getUser();
    if (sessionUser) {
      setFilteredEntries(sessionUser.journals);
      setUser(sessionUser);
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error("Error verifying session:", error);
    setUser(null);
  } finally {
    isSessionChecked = true;
  }
}
