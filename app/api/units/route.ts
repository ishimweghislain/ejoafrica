import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, subtopicId, periods, knowledge, skills, attitudes } = body;
        const unit = await prisma.unit.create({
            data: {
                title,
                subtopicId,
                periods: parseInt(periods) || 0,
                knowledge,
                skills,
                attitudes
            }
        });
        return NextResponse.json(unit);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
    }
}
