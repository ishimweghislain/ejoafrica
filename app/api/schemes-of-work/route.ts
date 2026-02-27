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
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Build filter based on role
        const where: any = {};
        if (session.role === "TEACHER") {
            where.teacherId = session.userId as string;
        }
        // DOS and SCHOOL_ADMIN see all schemes

        const schemes = await prisma.schemeOfWork.findMany({
            where,
            include: {
                course: {
                    include: {
                        topics: {
                            include: {
                                subtopics: {
                                    include: { units: true }
                                }
                            }
                        }
                    }
                },
                class: true,
                academicYear: true,
                term: true,
                teacher: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { lessons: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const allWithTopics = await prisma.course.findMany({
            where: { topics: { some: {} } },
            include: {
                topics: {
                    include: { subtopics: { include: { units: true } } },
                }
            }
        });

        for (const scheme of (schemes as any[])) {
            if (scheme.course && (!scheme.course.topics || scheme.course.topics.length === 0)) {
                const words = scheme.course.title.toLowerCase().split(' ');
                const match = allWithTopics.find(c => {
                    const cWords = c.title.toLowerCase().split(' ');
                    return words.some((w: string) => w.length > 3 && cWords.includes(w));
                }) || allWithTopics[0];

                if (match) {
                    scheme.course.topics = match.topics;
                }
            }
        }

        return NextResponse.json(schemes);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch schemes of work" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "DOS" && session.role !== "SCHOOL_ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { classId, academicYearId, termId, courseId, periodsPerWeek, reference, teacherId } = body;

        // If a teacher creates it themselves, auto-assign them.
        // If DOS creates it, they can specify teacherId.
        const assignedTeacherId =
            session.role === "TEACHER"
                ? (session.userId as string)
                : (teacherId || null);

        const scheme = await prisma.schemeOfWork.create({
            data: {
                classId,
                academicYearId,
                termId,
                courseId,
                periodsPerWeek: parseInt(periodsPerWeek),
                reference,
                teacherId: assignedTeacherId,
            },
        });

        return NextResponse.json(scheme);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create scheme of work" }, { status: 500 });
    }
}
