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
    try {
        const schemes = await prisma.schemeOfWork.findMany({
            include: {
                course: true,
                class: true,
                academicYear: true,
                term: true,
                _count: { select: { lessons: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(schemes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch schemes of work" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "DOS")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            classId, academicYearId, termId, courseId, periodsPerWeek, reference
        } = body;

        const scheme = await prisma.schemeOfWork.create({
            data: {
                classId,
                academicYearId,
                termId,
                courseId,
                periodsPerWeek: parseInt(periodsPerWeek),
                reference,
            },
        });

        return NextResponse.json(scheme);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create scheme of work" }, { status: 500 });
    }
}
