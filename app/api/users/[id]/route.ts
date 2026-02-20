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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                children: {
                    include: {
                        class: true,
                    }
                },
                parents: true,
                class: true,
                studyingCourses: true,
            }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Remove password before returning
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
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
            classId
        } = body;

        const result = await prisma.$transaction(async (tx) => {
            const updateData: any = {
                firstName,
                lastName,
                email,
                role: role as any,
                phone,
                accountPin,
                country,
                city,
                address,
                school: school || "Lycée de Kigali",
                classId: classId || null,
            };

            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            if (body.courseIds) {
                updateData.studyingCourses = {
                    set: body.courseIds.map((id: string) => ({ id }))
                };
            }

            if (body.studentIds) {
                updateData.children = {
                    set: body.studentIds.map((id: string) => ({ id }))
                };
            }

            // 1. Update primary user
            const user = await tx.user.update({
                where: { id },
                data: updateData,
            });

            // 2. Handle Parents if Student update
            if (role === "STUDENT" && body.parent1) {
                const parentsToConnect = [];

                // Helper to find/create parent
                const handleParent = async (pData: any) => {
                    if (!pData || !pData.email) return null;
                    let p = await tx.user.findUnique({ where: { email: pData.email } });
                    if (!p) {
                        p = await tx.user.create({
                            data: {
                                firstName: pData.firstName,
                                lastName: pData.lastName,
                                email: pData.email,
                                password: pData.password ? await bcrypt.hash(pData.password, 10) : await bcrypt.hash("Parent123!", 10),
                                role: "PARENT",
                                phone: pData.phone,
                                school: school || "Lycée de Kigali",
                            }
                        });
                    }
                    return p.id;
                };

                const p1Id = await handleParent(body.parent1);
                if (p1Id) parentsToConnect.push({ id: p1Id });

                const p2Id = await handleParent(body.parent2);
                if (p2Id) parentsToConnect.push({ id: p2Id });

                // Update connections
                await tx.user.update({
                    where: { id },
                    data: { parents: { set: parentsToConnect } }
                });
            }

            return user;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
