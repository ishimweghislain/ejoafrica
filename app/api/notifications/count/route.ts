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
    if (!session) return NextResponse.json({ count: 0 });

    try {
        const count = await prisma.notification.count({
            where: {
                userId: session.userId as string,
                read: false
            }
        });
        return NextResponse.json({ count });
    } catch (error) {
        return NextResponse.json({ count: 0 });
    }
}
