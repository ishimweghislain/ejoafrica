import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { title, periods, knowledge, skills, attitudes } = body;
        const unit = await prisma.unit.update({
            where: { id },
            data: {
                title,
                periods: periods ? parseInt(periods.toString()) : undefined,
                knowledge,
                skills,
                attitudes
            }
        });
        return NextResponse.json(unit);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await prisma.unit.delete({ where: { id } });
        return NextResponse.json({ message: "Unit deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
    }
}
