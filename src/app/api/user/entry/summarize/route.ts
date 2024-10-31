import { NextRequest, NextResponse } from "next/server";
import { SummarizerManager } from "node-summarizer";
import { countSentences, getPlainTextFromHtml } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    // Parse HTML and extract text content
    const plainText = getPlainTextFromHtml(text);
    console.log("plainText", plainText);

    const sentenceCount = countSentences(plainText);

    if (sentenceCount < 5) {
      return NextResponse.json({ summary: [plainText] });
    }

    /**
     * For short texts (e.g., less than 10 sentences), you might summarize it in 1-2 sentences.
For medium-length texts (e.g., 10-50 sentences), summarize it in 3-5 sentences.
For longer texts (e.g., 50+ sentences), summarize in 5-10 sentences.
Formula:
     */

    const Summarizer = new SummarizerManager(
      plainText,
      Math.ceil(sentenceCount / 5)
    ); // 5 sentences summary
    const summary = await Summarizer.getSummaryByFrequency().summary;
    if (
      summary ===
      "Not Enough similarities to be summarized, or the sentence is invalid"
    ) {
      return NextResponse.json({ summary: [] });
    }

    // Split the summary into chunks of 280 characters or less
    const summaryChunks = splitIntoChunks(summary, 280);
    return NextResponse.json({ summary: summaryChunks });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the summary." },
      { status: 500 }
    );
  }
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  let index = 0;

  while (index < text.length) {
    let chunk = text.substr(index, chunkSize);

    // If we're not at the end of the text, try to break at a space
    if (index + chunkSize < text.length) {
      const lastSpaceIndex = chunk.lastIndexOf(" ");
      if (lastSpaceIndex !== -1) {
        chunk = chunk.substr(0, lastSpaceIndex);
      }
    }

    chunks.push(chunk.trim());
    index += chunk.length;
  }

  return chunks;
}
