import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
        return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    try {
        const answers = await prisma.questionAnswer.findMany({
            where: { studentId },
            include: {
                question: {
                    include: {
                        course: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(answers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch question answers" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { questionId, studentId, answer, isCorrect } = body;

        const record = await prisma.questionAnswer.create({
            data: {
                questionId,
                studentId,
                answer,
                isCorrect,
            },
        });

        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: "Failed to record answer" }, { status: 500 });
    }
}
