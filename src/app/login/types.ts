import { IUser } from "@/lib/interfaces";

export interface State {
  message: string;
  errors: {
    usernameOrEmail?: string[];
    password?: string[];
    staySignedIn?: string[];
  };
  user: IUser | null;
  redirect: string | null;
  success: boolean;
  isVerified: boolean;
}

export type LoginFunction = (
  prevState: State,
  formData: FormData
) => Promise<State>;
