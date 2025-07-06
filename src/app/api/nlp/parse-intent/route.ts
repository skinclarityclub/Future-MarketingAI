import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "@/lib/assistant/nlp/intent-parser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required and must be a string" },
        { status: 400 }
      );
    }

    const result = await parseIntent(question);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Intent parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse intent" },
      { status: 500 }
    );
  }
}
