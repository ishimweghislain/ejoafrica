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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== "SCHOOL_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { title, startDate, endDate, academicYearId } = body;

        const updatedTerm = await prisma.academicTerm.update({
            where: { id },
            data: {
                title,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                academicYearId,
            },
        });

        return NextResponse.json(updatedTerm);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update term" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== "SCHOOL_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        await prisma.academicTerm.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Term deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete term" }, { status: 500 });
    }
}
