import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, courseId } = body;
        const topic = await prisma.topic.create({
            data: { title, courseId }
        });
        return NextResponse.json(topic);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    // Add logic for update if needed
    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
