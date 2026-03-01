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
    } catch {
        return null;
    }
}

/**
 * GET /api/attendance
 *   ?lessonId=xxx          → Teacher: all student records for that lesson
 *   ?studentId=xxx         → Parent/Student/Teacher/DOS/Admin: attendance history for that student
 *   ?classId=xxx           → DOS/Admin/Teacher: all attendance for that class
 *   (no params, DOS/Admin) → All lessons with attendance summary
 */
export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");

    const role = session.role as string;
    const userId = session.userId as string;

    try {

        // --- By lessonId: who took the lesson's attendance ---
        if (lessonId) {
            const records = await prisma.lessonAttendance.findMany({
                where: { lessonId },
                include: {
                    student: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
                    lesson: {
                        include: {
                            unit: true,
                            scheme: { include: { course: true, class: true } }
                        }
                    }
                },
                orderBy: { student: { firstName: "asc" } }
            });
            return NextResponse.json(records);
        }

        // --- By studentId: attendance history ---
        if (studentId) {
            const records = await prisma.lessonAttendance.findMany({
                where: { studentId },
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
                orderBy: { createdAt: "desc" }
            });
            return NextResponse.json(records);
        }

        // --- By classId: all lessons + attendance for that class (DOS/Admin/Teacher) ---
        if (classId) {
            const lessons = await prisma.lesson.findMany({
                where: { scheme: { classId } },
                include: {
                    unit: true,
                    scheme: {
                        include: {
                            course: true,
                            class: true,
                            teacher: { select: { id: true, firstName: true, lastName: true } }
                        }
                    },
                    attendance: {
                        include: {
                            student: { select: { id: true, firstName: true, lastName: true } }
                        }
                    }
                },
                orderBy: { startDate: "desc" }
            });
            return NextResponse.json(lessons);
        }

        // --- No params: DOS/Admin gets summary of all lessons ---
        if (["DOS", "SCHOOL_ADMIN", "DOD"].includes(role)) {
            const lessons = await prisma.lesson.findMany({
                include: {
                    unit: true,
                    scheme: {
                        include: {
                            course: true,
                            class: true,
                            teacher: { select: { id: true, firstName: true, lastName: true } }
                        }
                    },
                    attendance: { select: { id: true, present: true, studentId: true } }
                },
                orderBy: { startDate: "desc" },
                take: 100
            });
            return NextResponse.json(lessons);
        }

        // --- Teacher: their own lessons with attendance summary ---
        if (role === "TEACHER") {
            const lessons = await prisma.lesson.findMany({
                where: { scheme: { teacherId: userId } },
                include: {
                    unit: true,
                    scheme: { include: { course: true, class: true } },
                    attendance: { select: { id: true, present: true } }
                },
                orderBy: { startDate: "desc" }
            });
            return NextResponse.json(lessons);
        }

        return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });

    } catch (error) {
        console.error("Attendance GET error:", error);
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
}

/**
 * POST /api/attendance
 * Body: { lessonId, records: [{ studentId, present, note }] }
 * Only TEACHER can save. Also sends notifications to parents.
 */
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

        // Fetch lesson details for notification message
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                scheme: { include: { course: true, class: true } },
                unit: true
            }
        });

        if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

        // Upsert attendance records
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

        // Send notifications to parents and the students themselves
        const notificationPromises: Promise<any>[] = [];

        for (const r of records) {
            const status = r.present ? "✅ Present" : "❌ Absent";
            const message = `Your child's attendance for "${lesson.unit.title}" in ${lesson.scheme.course.title} (${lesson.scheme.class.name}) on ${new Date(lesson.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} has been recorded: ${status}.`;

            // Notify the student
            notificationPromises.push(
                prisma.notification.create({
                    data: {
                        userId: r.studentId,
                        title: `Attendance Recorded — ${lesson.scheme.course.title}`,
                        message: r.present
                            ? `Your attendance for "${lesson.title}" was marked Present. ✅`
                            : `Your attendance for "${lesson.title}" was marked Absent. ❌${r.note ? ` Note: ${r.note}` : ''}`,
                        type: r.present ? "SUCCESS" : "WARNING",
                    }
                }).catch(() => null) // don't fail if student notification fails
            );

            // Notify parents of this student
            const student = await prisma.user.findUnique({
                where: { id: r.studentId },
                include: { parents: { select: { id: true } } }
            });

            if (student?.parents) {
                for (const parent of student.parents) {
                    notificationPromises.push(
                        prisma.notification.create({
                            data: {
                                userId: parent.id,
                                title: `Attendance Update — ${student.firstName} ${student.lastName}`,
                                message,
                                type: r.present ? "INFO" : "WARNING",
                            }
                        }).catch(() => null)
                    );
                }
            }
        }

        // Notify DOS/Admin
        const admins = await prisma.user.findMany({
            where: { role: { in: ["DOS", "SCHOOL_ADMIN"] } },
            select: { id: true }
        });

        const presentCount = records.filter(r => r.present).length;
        const totalCount = records.length;

        for (const admin of admins) {
            notificationPromises.push(
                prisma.notification.create({
                    data: {
                        userId: admin.id,
                        title: `Attendance Submitted — ${lesson.scheme.class.name}`,
                        message: `Teacher recorded attendance for "${lesson.title}" (${lesson.scheme.course.title}, ${lesson.scheme.class.name}). ${presentCount}/${totalCount} students present.`,
                        type: "INFO",
                    }
                }).catch(() => null)
            );
        }

        await Promise.all(notificationPromises);

        return NextResponse.json({ saved: results.length, records: results });
    } catch (error) {
        console.error("Attendance POST error:", error);
        return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
    }
}
