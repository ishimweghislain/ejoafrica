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
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const courseId = searchParams.get("courseId");

    let where: any = {};
    if (session.role === "TEACHER") where.teacherId = session.id;
    if (session.role === "STUDENT") where.classId = session.classId;
    if (session.role === "PARENT") {
        const parent = await prisma.user.findUnique({
            where: { id: session.id as string },
            include: { children: true }
        });
        const childClassIds = parent?.children.map(c => c.classId).filter(Boolean) as string[];
        where.classId = { in: childClassIds };
    }

    if (classId) where.classId = classId;
    if (courseId) where.courseId = courseId;

    try {
        // @ts-ignore
        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                class: true,
                course: true,
                teacher: true,
                questions: true,
                submissions: {
                    include: { student: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(assignments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            title, description, deadline, classId, courseId, questions
        } = body;

        // @ts-ignore
        const assignment = await prisma.assignment.create({
            data: {
                title,
                description,
                deadline: deadline ? new Date(deadline) : null,
                classId,
                courseId,
                teacherId: session.id as string,
                questions: {
                    create: questions.map((q: any) => ({
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        marks: parseInt(q.marks) || 1,
                        timer: q.timer ? parseInt(q.timer) : null,
                        difficulty: q.difficulty || "MEDIUM",
                        courseId,
                        teacherId: session.id as string,
                    }))
                }
            },
            include: { questions: true }
        });

        return NextResponse.json(assignment);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
    }
}
