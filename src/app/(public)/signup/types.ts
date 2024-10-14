export interface State {
  message: string;
  errors: {
    email?: string[];
    password?: string[];
    username?: string[];
    confirmPassword?: string[];
    usernameOrEmailUnAvailable?: string;
    generalError?: string;
  };
  isLoading: boolean;
  success: boolean;
}

export type SignUpFunction = (
  prevState: State,
  formData: FormData
) => Promise<State>;
