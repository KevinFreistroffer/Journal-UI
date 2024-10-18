import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import nlp from "compromise";
import crypto from "crypto";
import { SentimentAnalyzer, WordTokenizer, PorterStemmer } from "natural";
import { ISentimentResult } from "./interfaces";

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

export function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function getAuthorizationUrl(codeChallenge: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.X_CLIENT_ID!,
    redirect_uri: process.env.X_REDIRECT_URI!,
    scope: "tweet.read tweet.write users.read offline.access",
    state: crypto.randomBytes(16).toString("hex"),
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

export function analyzeSentiment(text: string): ISentimentResult {
  const tokenizer = new WordTokenizer();
  const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

  const tokens = tokenizer.tokenize(text);
  const result = analyzer.getSentiment(tokens);

  return {
    score: result,
    comparative: result / tokens.length,
    tokens: tokens,
    words: tokens.filter((token) => /[a-z]/i.test(token)),
    positive: tokens.filter((token) => analyzer.getSentiment([token]) > 0),
    negative: tokens.filter((token) => analyzer.getSentiment([token]) < 0),
  };
}

// @ts-ignore
export function getSentimentWord(text) {
  const { score } = analyzeSentiment(text);

  if (score >= 0.6) return "Ecstatic";
  if (score >= 0.3) return "Happy";
  if (score >= 0.1) return "Positive";
  if (score > -0.1) return "Neutral";
  if (score > -0.3) return "Negative";
  if (score > -0.6) return "Sad";
  return "Angry";
}
