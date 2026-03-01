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
    } catch { return null; }
}

/**
 * GET /api/messages?studentId=xxx  → get conversation thread for a student
 */
export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

    try {
        const messages = await prisma.notification.findMany({
            where: {
                OR: [
                    // Messages TO parents about this student (tagged with studentId in message)
                    { message: { contains: studentId } },
                ],
                type: "MESSAGE"
            },
            include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
            orderBy: { createdAt: "asc" }
        });
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

/**
 * POST /api/messages
 * Body: { studentId, message, targetParentIds? }
 * DOD sends → notifies parent(s) and student
 * Parent sends → notifies DOD users
 */
export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.role as string;
    const senderId = session.userId as string;

    try {
        const body = await request.json();
        const { studentId, message, targetParentIds } = body;

        if (!studentId || !message?.trim()) {
            return NextResponse.json({ error: "studentId and message are required" }, { status: 400 });
        }

        // Fetch student with parents
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            include: {
                parents: { select: { id: true, firstName: true, lastName: true } },
                class: { select: { name: true } }
            }
        });

        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { firstName: true, lastName: true, role: true }
        });

        const senderName = sender ? `${sender.firstName} ${sender.lastName}` : role;
        const notifications: Promise<any>[] = [];

        if (["DOD", "DOS", "SCHOOL_ADMIN"].includes(role)) {
            // School sends to parents
            const parentsToNotify = targetParentIds?.length > 0
                ? student.parents.filter(p => targetParentIds.includes(p.id))
                : student.parents;

            for (const parent of parentsToNotify) {
                notifications.push(
                    prisma.notification.create({
                        data: {
                            userId: parent.id,
                            title: `Message about ${student.firstName} ${student.lastName}`,
                            message: `[STUDENT:${studentId}] ${message}`,
                            type: "MESSAGE",
                        }
                    })
                );
            }

            // Also notify student
            notifications.push(
                prisma.notification.create({
                    data: {
                        userId: studentId,
                        title: `Message from ${senderName} (${role})`,
                        message: `[STUDENT:${studentId}] ${message}`,
                        type: "MESSAGE",
                    }
                })
            );

        } else if (role === "PARENT") {
            // Parent replies — notify DOD/DOS/Admin users
            const admins = await prisma.user.findMany({
                where: { role: { in: ["DOD", "DOS", "SCHOOL_ADMIN"] } },
                select: { id: true }
            });

            for (const admin of admins) {
                notifications.push(
                    prisma.notification.create({
                        data: {
                            userId: admin.id,
                            title: `Parent Reply — ${student.firstName} ${student.lastName}`,
                            message: `[STUDENT:${studentId}] [FROM:${senderId}] ${message}`,
                            type: "MESSAGE",
                        }
                    })
                );
            }
        }

        await Promise.all(notifications);
        return NextResponse.json({ sent: notifications.length, message: "Sent successfully" });

    } catch (error) {
        console.error("Message send error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
