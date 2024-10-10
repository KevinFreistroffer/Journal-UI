import { NextRequest, NextResponse } from "next/server";
import { SummarizerManager } from "node-summarizer";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const Summarizer = new SummarizerManager(text, 5); // 5 sentences summary
    console.log(Summarizer);
    const summary = await Summarizer.getSummaryByFrequency().summary;
    console.log("summary", summary);
    // Trim the summary to 280 characters if it's longer
    const trimmedSummary =
      summary.length > 280 ? summary.substring(0, 277) + "..." : summary;
    console.log("trimmedSummary", trimmedSummary);
    return NextResponse.json({ summary: trimmedSummary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the summary." },
      { status: 500 }
    );
  }
}
