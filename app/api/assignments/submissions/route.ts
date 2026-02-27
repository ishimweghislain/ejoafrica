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

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
        return NextResponse.json({ error: "Only students can submit assignments" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { assignmentId, answers, cheatingAttempt } = body; // answers: { questionId: string, answer: string }[]

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { questions: true }
        });

        if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

        // Calculate score
        let totalScore = 0;
        const answerRecords: any[] = [];

        for (const q of assignment.questions) {
            const studentAnswer = answers.find((a: any) => a.questionId === q.id)?.answer;
            const isCorrect = studentAnswer === q.correctAnswer;
            if (isCorrect) totalScore += q.marks;

            answerRecords.push({
                questionId: q.id,
                studentId: session.userId as string,
                answer: studentAnswer || "",
                isCorrect
            });
        }

        // Determine status
        let status = (assignment.deadline && new Date() > assignment.deadline) ? "LATE" : "COMPLETED";
        if (cheatingAttempt) status = "CHEATING";

        // Save everything in a transaction
        const submission = await prisma.$transaction(async (tx) => {
            // 1. Save answers
            await tx.questionAnswer.createMany({
                data: answerRecords
            });

            // 2. Save submission
            const sub = await tx.assignmentSubmission.create({
                data: {
                    assignmentId,
                    studentId: session.userId as string,
                    score: totalScore,
                    status,
                    // @ts-ignore - Prisma client out of sync
                    cheatingAttempt: !!cheatingAttempt
                }
            });

            // 3. Notify teacher
            const student = await tx.user.findUnique({ where: { id: session.userId as string } });
            await tx.notification.create({
                data: {
                    userId: assignment.teacherId,
                    title: cheatingAttempt ? "🚨 Cheating Attempt Alert" : "New Assignment Submission",
                    message: cheatingAttempt
                        ? `${student?.firstName} ${student?.lastName} tried to switch tabs during '${assignment.title}'. The assignment was auto-submitted.`
                        : `${student?.firstName} ${student?.lastName} completed '${assignment.title}'. Score: ${totalScore}`,
                    type: cheatingAttempt ? "ALARM" : "SUCCESS"
                }
            });

            return sub;
        });

        return NextResponse.json(submission);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
    }
}
