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

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
        return NextResponse.json({ error: "Only students can submit answers" }, { status: 403 });
    }

    const { id: assessmentId } = await params;

    try {
        const body = await request.json();
        const { questionId, answer, cheatingAttempt } = body;

        const assessment = await prisma.liveAssessment.findUnique({
            where: { id: assessmentId },
            include: { questions: true }
        });

        if (!assessment || assessment.status !== "LIVE") {
            return NextResponse.json({ error: "Assessment is not active" }, { status: 400 });
        }

        const question = assessment.questions.find((q: any) => q.id === questionId);
        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Check if student already answered this question
        const existingResponse = await prisma.liveResponse.findFirst({
            where: {
                assessmentId,
                studentId: session.userId as string,
                questionId
            }
        });

        if (existingResponse) {
            return NextResponse.json({ error: "You have already answered this question" }, { status: 400 });
        }

        const isCorrect = answer === question.correctAnswer;
        const marksObtained = isCorrect ? question.marks : 0;

        const response = await prisma.$transaction(async (tx) => {
            const res = await tx.liveResponse.create({
                data: {
                    assessmentId,
                    studentId: session.userId as string,
                    questionId,
                    answer: answer || "CHEATED_AUTO_SUBMIT",
                    isCorrect: !!isCorrect,
                    marksObtained: Number(marksObtained),
                    // @ts-ignore - Prisma client out of sync
                    cheatingAttempt: !!cheatingAttempt
                }
            });

            if (cheatingAttempt) {
                const student = await tx.user.findUnique({ where: { id: session.userId as string } });
                await tx.notification.create({
                    data: {
                        userId: assessment.teacherId,
                        title: "🚨 Live Assessment Cheating",
                        message: `${student?.firstName} ${student?.lastName} tried to switch tabs during '${assessment.title}'. System flagged the session.`,
                        type: "ALARM"
                    }
                });
            }

            return res;
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error("RESPONSE SUBMISSION ERROR:", error);
        return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: assessmentId } = await params;

    try {
        let where: any = { assessmentId };
        if (session.role === "STUDENT") {
            where.studentId = session.userId;
        }

        const responses = await prisma.liveResponse.findMany({
            where,
            include: {
                student: true,
                question: true
            }
        });

        return NextResponse.json(responses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
    }
}
