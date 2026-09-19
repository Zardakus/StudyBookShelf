import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        topicId: id,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error("POST Favorite error:", error);
    return NextResponse.json({ error: "Failed to favorite" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.favorite.delete({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Favorite error:", error);
    return NextResponse.json({ error: "Failed to unfavorite" }, { status: 500 });
  }
}
