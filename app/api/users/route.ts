import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
    const role = searchParams.get("role");
    const parentId = searchParams.get("parentId");

    try {
        const where: any = {};
        if (role && role !== "ALL") where.role = role as any;
        if (parentId) {
            where.parents = { some: { id: parentId } };
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                class: true,
                studyingCourses: true,
                parents: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "SCHOOL_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            phone,
            accountPin,
            country,
            city,
            address,
            school,
            classId,
            courseIds,
            parent1,
            parent2
        } = body;

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        // Start a transaction to ensure all users are created correctly
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the primary user (Student/Teacher/etc)
            const user = await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword || await bcrypt.hash("ChangeMe123!", 10),
                    role: role as any,
                    phone,
                    accountPin,
                    country,
                    city,
                    address,
                    school: school || "Lycée de Kigali",
                    classId: classId || null,
                    // Link courses if student
                    studyingCourses: (role === "STUDENT" && courseIds) ? {
                        connect: courseIds.map((id: string) => ({ id }))
                    } : undefined,
                    // Link children if parent
                    children: (role === "PARENT" && body.studentIds) ? {
                        connect: body.studentIds.map((id: string) => ({ id }))
                    } : undefined,
                },
            });

            // 2. Handle Parents if Student
            if (role === "STUDENT" && parent1 && parent1.email) {
                // Find or create Parent 1
                let p1 = await tx.user.findUnique({ where: { email: parent1.email } });
                if (!p1) {
                    const p1HashedPassword = parent1.password ? await bcrypt.hash(parent1.password, 10) : hashedPassword;
                    p1 = await tx.user.create({
                        data: {
                            firstName: parent1.firstName,
                            lastName: parent1.lastName,
                            email: parent1.email,
                            password: p1HashedPassword || await bcrypt.hash("Parent123!", 10),
                            role: "PARENT",
                            phone: parent1.phone,
                            school: school || "Lycée de Kigali",
                        }
                    });
                }

                // Link Parent 1 to Student
                await tx.user.update({
                    where: { id: user.id },
                    data: { parents: { connect: { id: p1.id } } }
                });

                // Optional Parent 2
                if (parent2 && parent2.email) {
                    let p2 = await tx.user.findUnique({ where: { email: parent2.email } });
                    if (!p2) {
                        const p2HashedPassword = parent2.password ? await bcrypt.hash(parent2.password, 10) : hashedPassword;
                        p2 = await tx.user.create({
                            data: {
                                firstName: parent2.firstName,
                                lastName: parent2.lastName,
                                email: parent2.email,
                                password: p2HashedPassword || await bcrypt.hash("Parent123!", 10),
                                role: "PARENT",
                                phone: parent2.phone,
                                school: school || "Lycée de Kigali",
                            }
                        });
                    }
                    await tx.user.update({
                        where: { id: user.id },
                        data: { parents: { connect: { id: p2.id } } }
                    });
                }
            }

            return user;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("User Creation Error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "One or more emails already exist in the system architecture." }, { status: 400 });
        }
        return NextResponse.json({ error: `Internal Protocol Failure: ${error.message}` }, { status: 500 });
    }
}
