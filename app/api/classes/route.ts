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
        const classes = await prisma.class.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(classes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== "SCHOOL_ADMIN" && session.role !== "DOS")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Class name is required" }, { status: 400 });
        }

        const newClass = await prisma.class.create({
            data: { name },
        });

        return NextResponse.json(newClass);
    } catch (error: any) {
        console.error("CLASS CREATE ERROR:", error);
        return NextResponse.json({
            error: "Failed to create class",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
