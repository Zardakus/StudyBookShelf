import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, visibility } = body;

    const topic = await prisma.topic.findUnique({
      where: { id },
    });

    if (!topic || topic.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
    }

    const updated = await prisma.topic.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(visibility && { visibility }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH Topic error:", error);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
    });

    if (!topic || topic.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
    }

    await prisma.topic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Topic error:", error);
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}
