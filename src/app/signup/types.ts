export interface State {
  message: string;
  errors: {
    email?: string[];
    password?: string[];
    username?: string[];
    confirmPassword?: string[];
  };
}

export type SignUpFunction = (
  prevState: State,
  formData: FormData
) => Promise<State>;
