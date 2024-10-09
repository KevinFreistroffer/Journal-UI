export interface IJournal {
  _id: string;
  title: string;
  journal: string;
  category: string;
  date: string;
  selected: boolean;
  sentiment?: string;
  sentimentColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  journals: IJournal[];
  journalCategories: ICategory[];
  createdAt: Date;
  updatedAt: Date;
}
