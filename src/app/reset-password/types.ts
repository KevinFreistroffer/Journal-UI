export interface State {
  message: string;
  errors: {
    password?: string[];
    confirmPassword?: string[];
  };
  success: boolean;
}

export type ResetPasswordFunction = (
  prevState: State,
  formData: FormData
) => Promise<State>;
