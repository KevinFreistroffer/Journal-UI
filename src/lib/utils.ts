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
  returnTopMost: number = 15,
  type: "nouns" | "verbs" | "adjectives" | "terms" = "nouns"
): IKeywordFrequency[] => {
  console.log("getFrequentKeywords", type);
  let res;
  if (type === "nouns") {
    res = nlp(entriesText).nouns();
  } else if (type === "verbs") {
    res = nlp(entriesText).verbs();
  } else if (type === "adjectives") {
    res = nlp(entriesText).adjectives();
  } else if (type === "terms") {
    res = nlp(entriesText).terms();
  }

  console.log("res", res);
  if (!res) {
    return [];
  }

  // Ensure res is an array of IKeywordFrequency
  // let keywordFrequencies: IKeywordFrequency[];

  return res
    .out("topk")
    .sort((a, b) => {
      if (b.count === a.count) {
        return a.normal.localeCompare(b.normal); // Sort alphabetically if counts are equal
      }
      return b.count - a.count; // Sort by count in descending order
    })
    .slice(0, returnTopMost);
};
