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
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let studentsCount = 0;
        let teachersCount = 0;
        let classesCount = 0;
        let coursesCount = 0;

        if (session.role === "TEACHER") {
            const teacherCourses = await prisma.course.findMany({
                where: { teacherId: session.userId as string },
                include: { class: { include: { users: { where: { role: "STUDENT" } } } } }
            });

            const uniqueClasses = new Set(teacherCourses.map(c => c.classId));
            const uniqueStudents = new Set();
            teacherCourses.forEach((c: any) => c.class.users.forEach((u: any) => uniqueStudents.add(u.id)));

            studentsCount = uniqueStudents.size;
            classesCount = uniqueClasses.size;
            coursesCount = teacherCourses.length;
            teachersCount = 1;
        } else if (session.role === "PARENT") {
            const parent = await prisma.user.findUnique({
                where: { id: session.userId as string },
                include: { children: { include: { class: true, studyingCourses: true } } }
            });
            if (parent) {
                studentsCount = parent.children.length;
                const uniqueClasses = new Set(parent.children.map(c => c.classId).filter(Boolean));
                classesCount = uniqueClasses.size;
                const uniqueCourses = new Set();
                parent.children.forEach(c => c.studyingCourses.forEach(co => uniqueCourses.add(co.id)));
                coursesCount = uniqueCourses.size;
            }
        } else if (session.role === "STUDENT") {
            const student = await prisma.user.findUnique({
                where: { id: session.userId as string },
                include: { class: true, studyingCourses: true }
            });
            if (student) {
                studentsCount = 1;
                classesCount = student.class ? 1 : 0;
                coursesCount = student.studyingCourses.length;
            }
        } else {
            [studentsCount, teachersCount, classesCount, coursesCount] = await Promise.all([
                prisma.user.count({ where: { role: 'STUDENT' } }),
                prisma.user.count({ where: { role: 'TEACHER' } }),
                prisma.class.count(),
                prisma.course.count(),
            ]);
        }

        const [years, terms] = await Promise.all([
            prisma.academicYear.count(),
            prisma.academicTerm.count(),
        ]);

        // Calculate setup progress
        const setupItems = [
            { id: 'years', label: 'Academic Year', done: years > 0 },
            { id: 'terms', label: 'Academic Term', done: terms > 0 },
            { id: 'classes', label: 'Academic Classes', done: classesCount > 0 },
            { id: 'teachers', label: 'Assign Teachers', done: teachersCount > 0 },
            { id: 'students', label: 'Register Students', done: studentsCount > 0 },
        ];

        const completed = setupItems.filter(item => item.done).length;
        const progress = Math.round((completed / setupItems.length) * 100);

        return NextResponse.json({
            students: studentsCount,
            teachers: teachersCount,
            classes: classesCount,
            courses: coursesCount,
            setupItems,
            progress
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
