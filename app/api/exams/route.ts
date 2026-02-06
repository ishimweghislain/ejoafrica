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

export async function GET() {
    try {
        const exams = await prisma.exam.findMany({
            include: {
                course: true,
                class: true,
                teacher: true,
                academicYear: true,
                term: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(exams);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
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
            title, description, classId, courseId, termId, academicYearId
        } = body;

        const exam = await prisma.exam.create({
            data: {
                title,
                description,
                classId,
                courseId,
                termId,
                academicYearId,
                teacherId: session.userId as string,
            },
        });

        return NextResponse.json(exam);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
    }
}
