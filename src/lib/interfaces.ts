export interface IJournal {
  _id: string;
  title: string;
  entry: string;
  categories: ICategory[];
  selected: boolean;
  sentimentScore: number;
  createdAt: Date;
  updatedAt: Date;
  favorite: boolean;
}

export interface ICategory {
  _id: string;
  category: string;
  selected: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  hasAcknowledgedHelperText: boolean;
  journals: IJournal[];
  journalCategories: ICategory[];
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  avatarId?: string;
}

export interface ISentimentResult {
  score: number;
  comparative: number;
  tokens: string[];
  words: string[];
  positive: string[];
  negative: string[];
}

export interface IReminder {
  _id: number;
  customFrequency: number;
  customUnit: string;
  date: string;
  description: string;
  endDate: string;
  ends: string;
  occurrences: number;
  recurrenceType: string;
  recurring: boolean;
  repeatOn: string[];
  time: string;
  title: string;
}
