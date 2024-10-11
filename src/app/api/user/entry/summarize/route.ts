import { NextRequest, NextResponse } from "next/server";
import { SummarizerManager } from "node-summarizer";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const Summarizer = new SummarizerManager(text, 5); // 5 sentences summary
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
