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
    const schemeId = searchParams.get("schemeId");
    const today = searchParams.get("today");

    try {
        const where: any = {};
        if (schemeId) where.schemeId = schemeId;

        // If today is requested, we could filter by date, but let's keep it simple for now

        const lessons = await prisma.lesson.findMany({
            where,
            include: {
                scheme: {
                    include: {
                        course: true,
                        class: true
                    }
                },
                unit: true
            },
            orderBy: { startDate: 'asc' }
        });
        return NextResponse.json(lessons);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch lesson nodes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            schemeId, startDate, endDate, unitId, title, evaluation, teachingMethod, resources, observation
        } = body;

        const lesson = await prisma.lesson.create({
            data: {
                schemeId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                unitId,
                title,
                evaluation,
                teachingMethod,
                resources,
                observation,
            },
            include: { unit: true }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create lesson block" }, { status: 500 });
    }
}
