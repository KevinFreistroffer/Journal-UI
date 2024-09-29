export interface State {
  message: string;
  errors: {
    email?: string[];
  };
  success: boolean;
}

export type SendResetPasswordEmailFunction = (
  prevState: State,
  formData: FormData
) => Promise<State>;
