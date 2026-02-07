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
        const years = await prisma.academicYear.findMany({
            include: { terms: true },
            orderBy: { startDate: 'desc' }
        });
        return NextResponse.json(years);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch academic years" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "SCHOOL_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { title, startDate, endDate } = body;

        if (!title || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const year = await prisma.academicYear.create({
            data: {
                title,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });

        return NextResponse.json(year);
    } catch (error: any) {
        console.error("ACADEMIC YEAR CREATE ERROR:", error);
        return NextResponse.json({
            error: "Failed to create academic year",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
