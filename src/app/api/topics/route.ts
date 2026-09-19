import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "my"; // "my", "community", "favorites"

    if (scope === "community") {
      const topics = await prisma.topic.findMany({
        where: { visibility: "PUBLIC" },
        include: { 
          user: { select: { name: true, image: true, id: true } },
          favoritedBy: { where: { userId: session.user.id } }
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(topics);
    }

    if (scope === "following") {
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);

      const topics = await prisma.topic.findMany({
        where: { visibility: "PUBLIC", userId: { in: followingIds } },
        include: { 
          user: { select: { name: true, image: true, id: true } },
          favoritedBy: { where: { userId: session.user.id } }
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(topics);
    }

    if (scope === "favorites") {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: { 
          topic: { 
            include: { 
              user: { select: { name: true, image: true, id: true } },
              favoritedBy: { where: { userId: session.user.id } }
            } 
          } 
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(favorites.map(f => f.topic));
    }

    // Default: my topics
    const topics = await prisma.topic.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(topics);

  } catch (error) {
    console.error("GET Topics error:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

const TopicSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  domain: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = TopicSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const topic = await prisma.topic.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || "",
        domain: parsed.data.domain,
        userId: session.user.id,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error("POST Topic error:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
