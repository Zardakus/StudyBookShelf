import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domain } = await req.json();
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // Context: Fetch user's existing topics in this domain
    const existingTopics = await prisma.topic.findMany({
      where: { userId: session.user.id, domain },
      select: { title: true, status: true },
    });

    // Blacklist: Fetch user's ignored recommendations in this domain
    const ignoredRecs = await prisma.ignoredRecommendation.findMany({
      where: { userId: session.user.id, domain },
      select: { topicTitle: true },
    });

    const knownTopicsStr = existingTopics.map(t => `${t.title} (${t.status})`).join(", ");
    const ignoredTopicsStr = ignoredRecs.map(i => i.topicTitle).join(", ");

    const systemPrompt = `
      You are a senior tech career coach and mentor. 
      Your goal is to recommend the next highly relevant topics for the user to study within the domain: "${domain}".
      
      What the user currently knows or is learning in this domain:
      ${knownTopicsStr || "None so far"}
      
      DO NOT recommend any of the following topics because the user explicitly ignored them (Blacklist):
      ${ignoredTopicsStr || "None"}
      
      Also, DO NOT recommend topics they already know or are learning (listed above).
      
      Return an array of up to 10 highly recommended topics. 
      Sort the array strictly by relevance, placing the absolute best/most important 3 topics first (they will be highlighted in the UI).
      The descriptions should be short and actionable.
    `;

    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      system: systemPrompt,
      prompt: "Generate the recommendations now.",
      schema: z.object({
        recommendations: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          })
        ),
      }),
    });

    return NextResponse.json({ recommendations: object.recommendations });
  } catch (error) {
    console.error("AI Recommendation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("exceeded your current quota") || errorMessage.includes("429")) {
      return NextResponse.json({ error: "AI rate limit exceeded. Please try again tomorrow." }, { status: 429 });
    }
    return NextResponse.json(
      { 
        error: "Failed to generate recommendations", 
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
