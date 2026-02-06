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
        const terms = await prisma.academicTerm.findMany({
            include: { academicYear: true },
            orderBy: { startDate: 'desc' }
        });
        return NextResponse.json(terms);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch academic terms" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "SCHOOL_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { title, startDate, endDate, academicYearId } = body;

        const term = await prisma.academicTerm.create({
            data: {
                title,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                academicYearId,
            },
        });

        return NextResponse.json(term);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create academic term" }, { status: 500 });
    }
}
