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
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // @ts-ignore
        const classes = await prisma.class.findMany({
            include: {
                // @ts-ignore
                users: {
                    where: { role: "STUDENT" },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        // @ts-ignore
                        disciplineMarks: true,
                    }
                }
            }
        });

        const formattedClasses = classes.map((cls: any) => {
            // @ts-ignore
            const totalMarks = cls.users?.reduce((acc: number, u: any) => acc + (u.disciplineMarks || 0), 0) || 0;
            const average = cls.users?.length > 0 ? (totalMarks / cls.users.length).toFixed(1) : "40.0";
            return {
                ...cls,
                averageDiscipline: average
            };
        });

        // Calculate school overall average
        // @ts-ignore
        const allStudents = await prisma.user.findMany({
            where: { role: "STUDENT" },
            select: {
                id: true,
                // @ts-ignore
                disciplineMarks: true
            }
        });

        // @ts-ignore
        const schoolTotal = allStudents.reduce((acc: number, s: any) => acc + (s.disciplineMarks || 0), 0);
        const schoolAverage = allStudents.length > 0 ? (schoolTotal / allStudents.length).toFixed(1) : "40.0";

        return NextResponse.json({
            classes: formattedClasses,
            schoolAverage
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch discipline data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== "SCHOOL_ADMIN" && session.role !== "DOD" && session.role !== "DOS")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { studentId, marks } = body;
        const numMarks = parseInt(marks);

        if (isNaN(numMarks) || numMarks < 0 || numMarks > 40) {
            return NextResponse.json({ error: "Marks must be between 0 and 40" }, { status: 400 });
        }

        if (!studentId) {
            return NextResponse.json({ error: "Student identifier is required" }, { status: 400 });
        }

        // @ts-ignore
        const updatedStudent = await prisma.user.update({
            where: { id: studentId },
            data: {
                // @ts-ignore
                disciplineMarks: numMarks
            }
        });

        return NextResponse.json(updatedStudent);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to synchronize conduct data" }, { status: 500 });
    }
}
