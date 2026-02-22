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
    const studentId = searchParams.get("studentId");

    if (!studentId) {
        return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    try {
        // 1. Find the student and their courses
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            include: {
                class: {
                    include: {
                        schemes: {
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
                                lessons: {
                                    select: { unitId: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!student || !student.class) {
            return NextResponse.json([]);
        }

        // 2. Calculate progress for each scheme/course in their class
        const progress = student.class.schemes.map(scheme => {
            const course = scheme.course;

            // Total units in syllabus
            const allUnits: string[] = [];
            course.topics.forEach(t => {
                t.subtopics.forEach(s => {
                    s.units.forEach(u => allUnits.push(u.id));
                });
            });

            // If course has no topics, try fallback (similar to what we did in course API)
            // But here we'll just check if it's 0.

            // Taught units (unique unitIds in lessons)
            const taughtUnitIds = new Set(scheme.lessons.map(l => l.unitId));

            return {
                courseId: course.id,
                courseTitle: course.title,
                totalUnits: allUnits.length,
                taughtUnits: taughtUnitIds.size,
                percentage: allUnits.length > 0 ? Math.round((taughtUnitIds.size / allUnits.length) * 100) : 0
            };
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Protocol Failure" }, { status: 500 });
    }
}
