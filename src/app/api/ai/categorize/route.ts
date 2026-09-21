import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      system: `You are an expert developer assistant. Your task is to categorize a user's natural language input about something they want to learn or study. 
      Extract a concise title, a brief description, and assign it to a broad technical domain (e.g., Frontend, Backend, DevOps, Data Science, Architecture, AI/ML, Mobile, etc.).`,
      prompt: `Categorize the following learning topic: "${prompt}"`,
      schema: z.object({
        title: z.string().describe("A short, clear title for the topic (max 50 chars)"),
        description: z.string().describe("A brief 1-2 sentence description of what the user wants to learn"),
        domain: z.string().describe("The high-level technical domain (e.g., Frontend, Backend, DevOps)"),
      }),
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("AI Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("exceeded your current quota") || errorMessage.includes("429")) {
      return NextResponse.json({ error: "AI rate limit exceeded. Please try again tomorrow." }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to categorize topic" }, { status: 500 });
  }
}
