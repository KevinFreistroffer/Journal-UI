export interface State {
  message: string;
  errors: {
    usernameOrEmail?: string[];
    password?: string[];
    staySignedIn?: string[];
  };
}

export type LoginFunction = (
  prevState: State,
  formData: FormData
) => Promise<State>;
