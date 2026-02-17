import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { title } = body;
        const topic = await prisma.topic.update({
            where: { id },
            data: { title }
        });
        return NextResponse.json(topic);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await prisma.topic.delete({ where: { id } });
        return NextResponse.json({ message: "Topic deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
    }
}
