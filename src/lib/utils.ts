import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import nlp from "compromise";

export interface IKeywordFrequency {
  normal: string;
  count: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFrequentKeywords = (
  entriesText: string,
  returnTopMost?: number
): any[] => {
  const nouns = nlp(entriesText).nouns();
  let res = nouns.out("topk");
  // show just the top
  res = res.sort((a, b) => a.count < b.count).slice(0, 15);
  return res;
};
