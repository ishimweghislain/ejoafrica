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
    { params }: { params: Promise<{ studentId: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { studentId } = await params;

    // Check if the requester is the student themselves, their parent, or staff
    let authorized = false;
    const role = session.role as string;
    const userId = session.userId as string;

    if (userId === studentId) {
        authorized = true;
    } else if (role === "PARENT") {
        const parent = await prisma.user.findUnique({
            where: { id: userId },
            include: { children: { select: { id: true } } }
        });
        if (parent?.children.some(c => c.id === studentId)) {
            authorized = true;
        }
    } else if (["SCHOOL_ADMIN", "DOS", "DOD", "TEACHER"].includes(role)) {
        authorized = true;
    }

    if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                disciplineMarks: true,
                disciplinaryReports: {
                    include: {
                        reporter: {
                            select: { firstName: true, lastName: true, role: true }
                        }
                    },
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

        return NextResponse.json(student);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch discipline record" }, { status: 500 });
    }
}
