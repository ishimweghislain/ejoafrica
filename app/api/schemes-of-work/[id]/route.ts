import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const scheme = await prisma.schemeOfWork.findUnique({
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

        if (!scheme) return NextResponse.json({ error: "Scheme not found" }, { status: 404 });

        return NextResponse.json(scheme);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch scheme details" }, { status: 500 });
    }
}
