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
    const classId = searchParams.get("classId");

    try {
        const courses = await prisma.course.findMany({
            where: classId ? { classId } : {},
            include: {
                class: true,
                teacher: true,
                academicYear: true,
                term: true,
                _count: { select: { topics: true } }
            },
            orderBy: { title: 'asc' }
        });
        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== "SCHOOL_ADMIN" && session.role !== "DOS")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            title, classId, teacherId, academicYearId, termId, notation, hoursPerWeek
        } = body;

        const course = await prisma.course.create({
            data: {
                title,
                classId,
                teacherId,
                academicYearId,
                termId,
                notation,
                hoursPerWeek: parseInt(hoursPerWeek),
            },
        });

        return NextResponse.json(course);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
    }
}
