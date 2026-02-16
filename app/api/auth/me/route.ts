import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_for_dev_only"
);

export async function GET() {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                school: true,
                phone: true,
                accountPin: true,
                country: true,
                city: true,
                address: true,
                profileImage: true,
                classId: true,
                children: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (err) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}
