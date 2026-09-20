import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domain, topicTitle } = await req.json();

    if (!domain || !topicTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ignored = await prisma.ignoredRecommendation.create({
      data: {
        userId: session.user.id,
        domain,
        topicTitle,
      },
    });

    return NextResponse.json(ignored);
  } catch (error: any) {
    // If it already exists (P2002 unique constraint), just ignore and return success
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: "Already ignored" });
    }
    console.error("POST Ignore Recommendation error:", error);
    return NextResponse.json({ error: "Failed to ignore recommendation" }, { status: 500 });
  }
}
