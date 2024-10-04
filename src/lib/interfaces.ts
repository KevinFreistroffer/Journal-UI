export interface IJournal {
  _id: string;
  title: string;
  entry: string;
  category: string;
  date: string;
  selected: boolean;
  sentiment?: string;
  sentimentColor?: string;
  createdAt?: string;
  updatedAt?: string;
  favorite?: boolean;
}

export interface ICategory {
  _id: string;
  category: string;
  selected: boolean;
}

export interface IUser {
  _id: string;
  username: string;
  email: string;
  resetPasswordToken: string;
  resetPasswordTokenExpires?: Date;
  isVerified: boolean; // Todo should make this required and setup the email verification
  // jwtToken: string; // TODO: I don't think this is needed. The token would get generated and sent to the client. Client sends the token, server parses it, and compares it to the found users
  // password and
  entries: IJournal[];
  journalCategories: ICategory[];
  createdAt: string;
  updatedAt: string;
}
