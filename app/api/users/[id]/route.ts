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

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(user);
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
