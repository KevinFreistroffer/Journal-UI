import { NextResponse } from "next/server";
import jsPDF from "jspdf";

export async function POST(req: Request) {
  try {
    const { title, content, format } = await req.json();

    if (format === "pdf") {
      // Create new PDF
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text(title || "Journal Entry", 20, 20);

      // Add content with word wrap
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(content, 170); // 170 is the max width
      doc.text(splitText, 20, 40);

      // Get the PDF as bytes
      const pdfBytes = doc.output("arraybuffer");

      // Return the PDF
      return new NextResponse(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${
            title || "journal"
          }.pdf"`,
        },
      });
    }

    // Handle DOCX format if needed
    if (format === "docx") {
      // ... existing DOCX code ...
    }

    return NextResponse.json(
      { error: "Invalid format specified" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in export route:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
