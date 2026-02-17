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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const classId = searchParams.get("classId");

    try {
        const where: any = {};
        if (courseId) where.courseId = courseId;
        if (classId) where.classId = classId;

        const questions = await prisma.question.findMany({
            where,
            include: {
                course: true,
                class: true,
                teacher: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(questions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "SCHOOL_ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { text, options, correctAnswer, difficulty, courseId, classId } = body;

        const question = await prisma.question.create({
            data: {
                text,
                options,
                correctAnswer,
                difficulty,
                courseId,
                classId: classId || null,
                teacherId: session.userId as string,
            },
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Question creation error:", error);
        return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
    }
}
