import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, topicId } = body;
        const subtopic = await prisma.subtopic.create({
            data: { title, topicId }
        });
        return NextResponse.json(subtopic);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create subtopic" }, { status: 500 });
    }
}
