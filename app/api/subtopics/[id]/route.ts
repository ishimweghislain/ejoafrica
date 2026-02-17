import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { title } = body;
        const subtopic = await prisma.subtopic.update({
            where: { id },
            data: { title }
        });
        return NextResponse.json(subtopic);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update subtopic" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await prisma.subtopic.delete({ where: { id } });
        return NextResponse.json({ message: "Subtopic deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete subtopic" }, { status: 500 });
    }
}
