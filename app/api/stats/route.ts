import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [students, teachers, classes, courses, years, terms] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'TEACHER' } }),
            prisma.class.count(),
            prisma.course.count(),
            prisma.academicYear.count(),
            prisma.academicTerm.count(),
        ]);

        // Calculate setup progress
        const setupItems = [
            { id: 'years', label: 'Academic Year', done: years > 0 },
            { id: 'terms', label: 'Academic Term', done: terms > 0 },
            { id: 'classes', label: 'Academic Classes', done: classes > 0 },
            { id: 'teachers', label: 'Assign Teachers', done: teachers > 0 },
            { id: 'students', label: 'Register Students', done: students > 0 },
        ];

        const completed = setupItems.filter(item => item.done).length;
        const progress = Math.round((completed / setupItems.length) * 100);

        return NextResponse.json({
            students,
            teachers,
            classes,
            courses,
            setupItems,
            progress
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
