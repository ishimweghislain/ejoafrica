import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const scheme = await prisma.schemeOfWork.findUnique({
            where: { id },
            include: {
                course: true,
                class: true,
                academicYear: true,
                term: true,
                lessons: {
                    include: {
                        unit: true
                    },
                    orderBy: { startDate: 'asc' }
                }
            }
        });

        if (!scheme) return NextResponse.json({ error: "Scheme not found" }, { status: 404 });

        return NextResponse.json(scheme);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch scheme details" }, { status: 500 });
    }
}
