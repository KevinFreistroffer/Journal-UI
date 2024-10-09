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
  journalsText: string,
  returnTopMost: number = 15,
  type: "nouns" | "verbs" | "adjectives" | "terms" = "nouns"
): IKeywordFrequency[] => {
  console.log("getFrequentKeywords", type);
  let res;
  if (type === "nouns") {
    res = nlp(journalsText).nouns();
  } else if (type === "verbs") {
    res = nlp(journalsText).verbs();
  } else if (type === "adjectives") {
    res = nlp(journalsText).adjectives();
  } else if (type === "terms") {
    res = nlp(journalsText).terms();
  }

  console.log("res", res);
  if (!res) {
    return [];
  }

  // Ensure res is an array of IKeywordFrequency
  // let keywordFrequencies: IKeywordFrequency[];

  return res
    .out("topk")
    .filter((keyword: IKeywordFrequency) => keyword.normal.trim() !== "") // {{ edit_1 }}: Filter out empty strings
    .sort((a: IKeywordFrequency, b: IKeywordFrequency) => {
      if (b.count === a.count) {
        return a.normal.localeCompare(b.normal); // Sort alphabetically if counts are equal
      }
      return b.count - a.count; // Sort by count in descending order
    })
    .slice(0, returnTopMost);
};
