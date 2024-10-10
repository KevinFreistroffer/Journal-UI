// @ts-nocheck

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

export interface ICreateJournalState {
  message: string;
  user: IUser | null;
  success: boolean;
  errors: {
    title?: string[];
    journal?: string[];
    category?: string[];
    catchAll?: string[];

}
// @ts-expect-error fix later
export type CreateCategoryFunction = (
  userId: string,
  prevState: ICreateCategoryState,
  formData: FormData
) => Promise<ICreateCategoryState>;

export type CreateJournalFunction = (
  userId: string,
  prevState: ICreateJournalState,
  formData: FormData
) => Promise<ICreateJournalState>;
