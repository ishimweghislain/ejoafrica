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

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.userId as string },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await request.json().catch(() => ({}));

        if (id) {
            // @ts-ignore
            await prisma.notification.update({
                where: { id, userId: session.userId as string },
                data: { read: true }
            });
            return NextResponse.json({ message: "Notification marked as read" });
        }

        // @ts-ignore
        await prisma.notification.updateMany({
            where: { userId: session.userId as string, read: false },
            data: { read: true }
        });
        return NextResponse.json({ message: "All notifications marked as read" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}
