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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                class: true,
                teacher: true,
                term: { include: { academicYear: true } },
                topics: {
                    include: {
                        subtopics: {
                            include: {
                                units: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

        return NextResponse.json(course);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || (session.role !== "SCHOOL_ADMIN" && session.role !== "DOS" && session.role !== "TEACHER")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { title, classId, teacherId, notation, hoursPerWeek, termId } = body;

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: {
                title,
                classId,
                teacherId,
                notation,
                hoursPerWeek: parseInt(hoursPerWeek),
                termId,
            },
        });

        return NextResponse.json(updatedCourse);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || (session.role !== "SCHOOL_ADMIN" && session.role !== "DOS")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        await prisma.course.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Course deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
    }
}
