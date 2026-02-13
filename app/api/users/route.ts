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

    try {
        const users = await prisma.user.findMany({
            where: role ? { role: role as any } : {},
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
            classId
        } = body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
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
            },
        });

        return NextResponse.json(user);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
