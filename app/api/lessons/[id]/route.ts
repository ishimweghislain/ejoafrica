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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                scheme: {
                    include: {
                        course: true,
                        class: {
                            include: {
                                users: {
                                    where: { role: "STUDENT" },
                                    select: { id: true, firstName: true, lastName: true, profileImage: true }
                                }
                            }
                        },
                        academicYear: true,
                        term: true
                    }
                },
                unit: true,
                attendance: {
                    include: {
                        student: { select: { id: true, firstName: true, lastName: true } }
                    }
                }
            }
        });

        if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        return NextResponse.json(lesson);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { title, unitId, startDate, endDate, teachingMethod, evaluation, resources, observation } = body;

        const updated = await prisma.lesson.update({
            where: { id },
            data: {
                title,
                unitId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                teachingMethod,
                evaluation,
                resources,
                observation,
            },
            include: { unit: true }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        await prisma.lesson.delete({ where: { id } });
        return NextResponse.json({ message: "Lesson deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
    }
}
