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
    const status = searchParams.get("status");

    let where: any = {};
    if (session.role === "TEACHER") where.teacherId = session.userId;
    if (session.role === "STUDENT") where.classId = session.classId;
    if (session.role === "PARENT") {
        const children = await prisma.user.findMany({
            where: { parents: { some: { id: session.userId as string } } },
            select: { classId: true }
        });
        const classIds = children.map(c => c.classId).filter(Boolean) as string[];
        where.classId = { in: classIds };
    }
    if (session.role === "DOS" || session.role === "SCHOOL_ADMIN") {
        // Admin and DOS see all
    }

    if (classId) where.classId = classId;
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;

    try {
        const assessments = await prisma.liveAssessment.findMany({
            where,
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
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(assessments);
    } catch (error) {
        console.error("FETCH LIVE ASSESSMENTS ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch live assessments" }, { status: 500 });
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

        let parsedDeadline = null;
        if (deadline && !isNaN(Date.parse(deadline))) {
            parsedDeadline = new Date(deadline);
        }

        const assessment = await prisma.$transaction(async (tx) => {
            const newAssessment = await tx.liveAssessment.create({
                data: {
                    title,
                    description,
                    deadline: parsedDeadline,
                    classId,
                    courseId,
                    teacherId: session.userId as string,
                    status: "DRAFT",
                    questions: {
                        create: Array.isArray(questions) ? questions.map((q: any, index: number) => ({
                            text: q.text,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            marks: parseInt(q.marks) || 1,
                            timer: q.timer ? parseInt(q.timer) : null,
                            order: index
                        })) : []
                    }
                },
                include: { questions: true }
            });

            // Notify students in the class
            const students = await tx.user.findMany({
                where: { classId: classId, role: "STUDENT" }
            });

            if (students.length > 0) {
                await tx.notification.createMany({
                    data: students.map(s => ({
                        userId: s.id,
                        title: "New Live Assessment",
                        message: `A new live assessment '${title}' has been scheduled.`,
                        type: "INFO"
                    }))
                });
            }

            return newAssessment;
        });

        return NextResponse.json(assessment);
    } catch (error: any) {
        console.error("LIVE ASSESSMENT CREATE ERROR:", error);
        return NextResponse.json({
            error: "Failed to create live assessment",
            details: error.message
        }, { status: 500 });
    }
}
