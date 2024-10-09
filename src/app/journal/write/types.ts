import { IUser } from "@/lib/interfaces";

export interface ICreateCategoryState {
  message: string;
  errors: {
    category?: string[];
    catchAll?: string[];
  };
  user: IUser | null;
  success: boolean;
}

export interface ICreateEntryState {
  message: string;
  errors: {
    title?: string[];
    journal?: string[];
    category?: string[];
    catchAll?: string[];
  };
}

export type CreateCategoryFunction = (
  userId: string,
  prevState: ICreateCategoryState,
  formData: FormData
) => Promise<ICreateCategoryState>;

export type CreateEntryFunction = (
  userId: string,
  prevState: ICreateEntryState,
  formData: FormData
) => Promise<ICreateEntryState>;
