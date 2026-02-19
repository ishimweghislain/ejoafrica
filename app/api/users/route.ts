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
    const classId = searchParams.get("classId");

    try {
        const where: any = {};
        if (role && role !== "ALL") where.role = role as any;
        if (parentId) {
            where.parents = { some: { id: parentId } };
        }
        if (classId) where.classId = classId;

        const users = await prisma.user.findMany({
            where,
            include: {
                class: true,
                // @ts-ignore
                studyingCourses: true,
                parents: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
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

        const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash("ChangeMe123!", 10);

        // Start a transaction to ensure all users are created correctly
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the primary user (Student/Teacher/etc)
            const user = await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    role: role as any,
                    phone,
                    accountPin,
                    country,
                    city,
                    address,
                    school: school || "Lycée de Kigali",
                    classId: classId || null,
                    // Link courses if student
                    // @ts-ignore
                    studyingCourses: (role === "STUDENT" && courseIds) ? {
                        connect: courseIds.map((id: string) => ({ id }))
                    } : undefined,
                    // Link children if parent
                    // @ts-ignore
                    children: (role === "PARENT" && body.studentIds) ? {
                        connect: body.studentIds.map((id: string) => ({ id }))
                    } : undefined,
                },
            });

            // 2. Handle Parents if Student
            if (role === "STUDENT" && parent1 && parent1.email) {
                const parentsToConnect = [];

                const handleParent = async (pData: any) => {
                    if (!pData || !pData.email) return null;
                    let p = await tx.user.findUnique({ where: { email: pData.email } });
                    if (!p) {
                        const pPassword = pData.password || "Parent123!";
                        p = await tx.user.create({
                            data: {
                                firstName: pData.firstName,
                                lastName: pData.lastName,
                                email: pData.email,
                                password: await bcrypt.hash(pPassword, 10),
                                role: "PARENT",
                                phone: pData.phone,
                                school: school || "Lycée de Kigali",
                            }
                        });
                    }
                    return p.id;
                };

                const p1Id = await handleParent(parent1);
                if (p1Id) parentsToConnect.push({ id: p1Id });

                const p2Id = await handleParent(parent2);
                if (p2Id) parentsToConnect.push({ id: p2Id });

                if (parentsToConnect.length > 0) {
                    await tx.user.update({
                        where: { id: user.id },
                        data: { parents: { connect: parentsToConnect } }
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
