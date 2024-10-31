import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import nlp from "compromise";
import crypto from "crypto";
// import { SentimentAnalyzer, WordTokenizer, PorterStemmer } from "natural";
import { ISentimentResult } from "./interfaces";
import Sentiment from "sentiment";
import sanitizeHTML from "sanitize-html";
import { parse } from "node-html-parser";
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
  try {
    const doc = nlp(text);
    const words = doc.terms().out("array");
    const positive = doc.match("#Positive").terms().out("array");
    const negative = doc.match("#Negative").terms().out("array");

    const score = (positive.length - negative.length) / words.length;

    return {
      score: score,
      comparative: score,
      tokens: words,
      words: words,
      positive: positive,
      negative: negative,
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      score: 0,
      comparative: 0,
      tokens: [],
      words: [],
      positive: [],
      negative: [],
    };
  }
}

export const getSentimentColor = (score: number): string => {
  console.log("getSentimentColor score", score);
  if (score <= -0.6) {
    return "bg-red-600"; // Very Negative
  } else if (score < -0.1) {
    return "bg-red-400"; // Negative
  } else if (score >= -0.1 && score <= 0.1) {
    return "bg-gray-400"; // Neutral
  } else if (score < 0.6) {
    return "bg-green-400"; // Positive
  } else {
    return "bg-green-600"; // Very Positive
  }
};

export function getSentimentWord(score: number): string {
  console.log("getSentimentWord score", score);
  try {
    if (score >= 0.6) return "Ecstatic";
    if (score >= 0.3) return "Happy";
    if (score >= 0.1) return "Positive";
    if (score >= -0.1) return "Neutral";
    if (score >= -0.3) return "Negative";
    if (score >= -0.6) return "Sad";
    return "Angry";
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "Unknown";
  }
}

export const countSentences = (text: string) => {
  // Split text based on common sentence-ending punctuation
  const sentences = text.split(/[.!?]+/);

  // Filter out empty results caused by trailing punctuation or extra spaces
  const validSentences = sentences.filter(
    (sentence) => sentence.trim().length > 0
  );

  return validSentences.length;
};

export function generateLoremIpsum(paragraphs: number): string {
  const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit.`;

  return loremIpsum.split("\n\n").slice(0, paragraphs).join("\n\n");
}

export function sanitizeHtml(
  html: string,
  options: sanitizeHTML.IOptions = {}
): string {
  const defaultOptions: sanitizeHTML.IOptions = {
    allowedTags: [
      "address",
      "article",
      "aside",
      "footer",
      "header",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hgroup",
      "main",
      "nav",
      "section",
      "blockquote",
      "dd",
      "div",
      "dl",
      "dt",
      "figcaption",
      "figure",
      "hr",
      "li",
      "main",
      "ol",
      "p",
      "pre",
      "ul",
      "a",
      "abbr",
      "b",
      "bdi",
      "bdo",
      "br",
      "cite",
      "code",
      "data",
      "dfn",
      "em",
      "i",
      "kbd",
      "mark",
      "q",
      "rb",
      "rp",
      "rt",
      "rtc",
      "ruby",
      "s",
      "samp",
      "small",
      "span",
      "strong",
      "sub",
      "sup",
      "time",
      "u",
      "var",
      "wbr",
      "caption",
      "col",
      "colgroup",
      "table",
      "tbody",
      "td",
      "tfoot",
      "th",
      "thead",
      "tr",
    ],
    allowedAttributes: {
      a: ["href"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: [],
  };

  return sanitizeHTML(html, { ...defaultOptions, ...options });
}

export const decodeHtmlEntities = (htmlString: string) => {
  console.log("decodeHtmlEntities htmlString", htmlString);
  const textarea = document.createElement("textarea");
  textarea.innerHTML = htmlString;
  return textarea.value;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getPlainTextFromHtml = (html: string) => {
  const root = parse(html);
  return root.textContent;
};
