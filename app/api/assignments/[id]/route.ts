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
        const assignment = await prisma.assignment.findUnique({
            where: { id },
            include: {
                class: {
                    include: {
                        users: true
                    }
                },
                course: true,
                teacher: true,
                questions: true,
                submissions: {
                    include: { student: true }
                }
            }
        });
        if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        return NextResponse.json(assignment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 });
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
        const { title, description, deadline } = body;

        const assignment = await prisma.assignment.update({
            where: { id },
            data: {
                title,
                description,
                deadline: deadline ? new Date(deadline) : null
            }
        });

        return NextResponse.json(assignment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
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
        await prisma.assignment.delete({ where: { id } });
        return NextResponse.json({ message: "Assignment deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
    }
}
