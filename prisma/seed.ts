import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Prisma 7 initialization
const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
    console.log("Seeding database...");

    try {
        // Delete all existing users as requested
        // Order matters due to foreign keys
        await prisma.studentDiscipline.deleteMany({});
        await prisma.lesson.deleteMany({});
        await prisma.schemeOfWork.deleteMany({});
        await prisma.timetable.deleteMany({});
        await prisma.unit.deleteMany({});
        await prisma.subtopic.deleteMany({});
        await prisma.topic.deleteMany({});
        await prisma.exam.deleteMany({});
        await prisma.course.deleteMany({});
        await prisma.class.deleteMany({});
        await prisma.academicTerm.deleteMany({});
        await prisma.academicYear.deleteMany({});
        await prisma.user.deleteMany({});

        const hashedPassword = await bcrypt.hash("ptestpassword1", 10);

        const users = [
            {
                email: "prodirector@programage.net",
                password: hashedPassword,
                firstName: "School",
                lastName: "Administrator",
                role: "SCHOOL_ADMIN" as any,
                school: "Lycée de Kigali",
            },
            {
                email: "prodirectorstudies@programage.net",
                password: hashedPassword,
                firstName: "Director",
                lastName: "of Studies",
                role: "DOS" as any,
                school: "Lycée de Kigali",
            },
            {
                email: "prodiscpline@programage.net",
                password: hashedPassword,
                firstName: "Director",
                lastName: "of Discipline",
                role: "DOD" as any,
                school: "Lycée de Kigali",
            },
            {
                email: "proteacher@programage.net",
                password: hashedPassword,
                firstName: "Pro",
                lastName: "Teacher",
                role: "TEACHER" as any,
                school: "Lycée de Kigali",
            },
            {
                email: "proparent@programage.net",
                password: hashedPassword,
                firstName: "Pro",
                lastName: "Parent",
                role: "PARENT" as any,
                school: "Lycée de Kigali",
            },
        ];

        for (const user of users) {
            await prisma.user.create({
                data: user,
            });
        }

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Seed error:", error);
        throw error;
    }
}

main()
    .catch((e) => {
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
