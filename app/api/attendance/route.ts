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

// GET /api/attendance?lessonId=xxx   → get attendance for a lesson
// GET /api/attendance?studentId=xxx  → get all attendance for a student (parent view)
export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");

    try {
        if (lessonId) {
            // Teacher viewing attendance for a specific lesson
            const records = await prisma.lessonAttendance.findMany({
                where: { lessonId },
                include: {
                    student: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
                    lesson: { include: { unit: true, scheme: { include: { course: true, class: true } } } }
                },
                orderBy: { createdAt: 'asc' }
            });
            return NextResponse.json(records);
        }

        if (studentId) {
            // Parent or student viewing attendance history
            const where: any = { studentId };
            if (courseId) {
                where.lesson = { scheme: { courseId } };
            }
            const records = await prisma.lessonAttendance.findMany({
                where,
                include: {
                    lesson: {
                        include: {
                            unit: true,
                            scheme: {
                                include: {
                                    course: true,
                                    class: true,
                                    academicYear: true,
                                    term: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(records);
        }

        return NextResponse.json({ error: "Missing query parameter: lessonId or studentId" }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
}

// POST /api/attendance  → save attendance records for a lesson
// Body: { lessonId, records: [{ studentId, present, note }] }
export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized – only teachers can record attendance" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { lessonId, records } = body;

        if (!lessonId || !Array.isArray(records)) {
            return NextResponse.json({ error: "lessonId and records[] are required" }, { status: 400 });
        }

        // Upsert each attendance record
        const results = await Promise.all(
            records.map((r: { studentId: string; present: boolean; note?: string }) =>
                prisma.lessonAttendance.upsert({
                    where: { lessonId_studentId: { lessonId, studentId: r.studentId } },
                    update: { present: r.present, note: r.note || null },
                    create: {
                        lessonId,
                        studentId: r.studentId,
                        present: r.present,
                        note: r.note || null,
                    }
                })
            )
        );

        return NextResponse.json({ saved: results.length, records: results });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
    }
}
