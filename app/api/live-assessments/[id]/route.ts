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
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const assessment = await prisma.liveAssessment.findUnique({
            where: { id },
            include: {
                class: true,
                course: true,
                teacher: true,
                questions: {
                    orderBy: { order: 'asc' }
                },
                responses: {
                    include: { student: true }
                }
            }
        });

        if (!assessment) return NextResponse.json({ error: "Live assessment not found" }, { status: 404 });

        return NextResponse.json(assessment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch live assessment" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { status, currentQuestionIndex } = body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (typeof currentQuestionIndex === "number") updateData.currentQuestionIndex = currentQuestionIndex;

        const assessment = await prisma.liveAssessment.update({
            where: { id, teacherId: session.userId as string },
            data: updateData,
            include: { questions: true }
        });

        // If status changed to LIVE, notify students again or trigger a socket event (if implemented)
        if (status === "LIVE") {
            // In a real app, you'd use Pusher or Socket.io here
        }

        return NextResponse.json(assessment);
    } catch (error) {
        console.error("LIVE ASSESSMENT UPDATE ERROR:", error);
        return NextResponse.json({ error: "Failed to update live assessment" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        await prisma.liveAssessment.delete({
            where: { id, teacherId: session.userId as string }
        });
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete live assessment" }, { status: 500 });
    }
}
