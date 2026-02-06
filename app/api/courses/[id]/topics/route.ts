import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_for_dev_only"
);

async function getSession() {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (err) {
        return null;
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const topics = await prisma.topic.findMany({
            where: { courseId: id },
            include: {
                _count: { select: { subtopics: true } },
                subtopics: {
                    include: {
                        _count: { select: { units: true } },
                        units: true
                    }
                }
            },
            orderBy: { title: 'asc' }
        });
        return NextResponse.json(topics);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || (session.role !== "SCHOOL_ADMIN" && session.role !== "DOS" && session.role !== "TEACHER")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { title } = body;

        const topic = await prisma.topic.create({
            data: {
                title,
                courseId: id,
            },
        });

        return NextResponse.json(topic);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
    }
}
