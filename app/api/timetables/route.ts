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
        const timetables = await prisma.timetable.findMany({
            where: classId ? { classId } : {},
            include: {
                course: true,
                teacher: true,
                class: true,
                term: true,
                academicYear: true,
            },
     
            orderBy: [
                { day: 'asc' },
                { startTime: 'asc' }
            ]
        });
        return NextResponse.json(timetables);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch timetables" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== "SCHOOL_ADMIN" && session.role !== "DOS" && session.role !== "TEACHER")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            classId, day, startTime, endTime, academicYearId, termId, courseId, teacherId
        } = body;

        const timetable = await prisma.timetable.create({
            data: {
                classId,
                day,
                startTime,
                endTime,
                academicYearId,
                termId,
                courseId,
                teacherId,
            },
        });

        return NextResponse.json(timetable);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create timetable entry" }, { status: 500 });
    }
}
