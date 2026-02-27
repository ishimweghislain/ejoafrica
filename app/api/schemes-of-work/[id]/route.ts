import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const schemeData = await prisma.schemeOfWork.findUnique({
            where: { id },
            include: {
                course: {
                    include: {
                        topics: {
                            include: {
                                subtopics: {
                                    include: { units: true }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                },
                class: {
                    include: {
                        users: {
                            where: { role: "STUDENT" },
                            select: { id: true, firstName: true, lastName: true, profileImage: true }
                        }
                    }
                },
                academicYear: true,
                term: true,
                teacher: { select: { id: true, firstName: true, lastName: true } },
                lessons: {
                    include: {
                        unit: true,
                        // @ts-ignore - Prisma types might be out of sync
                        attendance: {
                            include: {
                                student: { select: { id: true, firstName: true, lastName: true } }
                            }
                        }
                    },
                    orderBy: { startDate: 'asc' }
                }
            }
        });

        if (!schemeData) return NextResponse.json({ error: "Scheme not found" }, { status: 404 });

        // Use 'any' to avoid TS errors regarding dynamic fallback properties or include results
        const scheme = schemeData as any;

        // SYLLABUS FALLBACK LOGIC
        // If the linked course record exists but has 0 topics/units, 
        // we hunt for any other course with the same title that DOES have topics.
        if (scheme.course && (!scheme.course.topics || scheme.course.topics.length === 0)) {
            const allPossible = await prisma.course.findMany({
                where: { topics: { some: {} } },
                include: {
                    topics: {
                        include: { subtopics: { include: { units: true } } },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });

            const words = scheme.course.title.toLowerCase().split(' ');
            const match = allPossible.find(c => {
                const cWords = c.title.toLowerCase().split(' ');
                return words.some((w: string) => w.length > 3 && cWords.includes(w));
            }) || allPossible[0];

            if (match) {
                scheme.course.topics = match.topics;
            }
        } else if (!scheme.course && scheme.courseId) {
            const allPossible = await prisma.course.findMany({
                where: { topics: { some: {} } },
                include: {
                    topics: {
                        include: { subtopics: { include: { units: true } } },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
            scheme.course = allPossible[0];
        }

        return NextResponse.json(scheme);
    } catch (error) {
        console.error("Scheme fetch error:", error);
        return NextResponse.json({ error: "Internal System Error" }, { status: 500 });
    }
}
