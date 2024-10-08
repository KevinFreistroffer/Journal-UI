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
): IKeywordFrequency[] => {
  const doc = nlp(entriesText);

  // Get most frequent nouns or verbs
  let res = doc.nouns().out("topk");
  // show just the top
  res = res.sort((a, b) => a.count < b.count).slice(0, returnTopMost);
  console.log("res", res);
  return res.map((item) => ({ normal: item.normal, count: item.count }));
};
