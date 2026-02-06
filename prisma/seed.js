require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding the database...");

    // Delete all existing users as requested
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
            role: "SCHOOL_ADMIN",
            school: "Lycée de Kigali",
        },
        {
            email: "prodirectorstudies@programage.net",
            password: hashedPassword,
            firstName: "Director",
            lastName: "of Studies",
            role: "DOS",
            school: "Lycée de Kigali",
        },
        {
            email: "prodiscpline@programage.net",
            password: hashedPassword,
            firstName: "Director",
            lastName: "of Discipline",
            role: "DOD",
            school: "Lycée de Kigali",
        },
        {
            email: "proteacher@programage.net",
            password: hashedPassword,
            firstName: "Pro",
            lastName: "Teacher",
            role: "TEACHER",
            school: "Lycée de Kigali",
        },
        {
            email: "proparent@programage.net",
            password: hashedPassword,
            firstName: "Pro",
            lastName: "Parent",
            role: "PARENT",
            school: "Lycée de Kigali",
        },
    ];

    for (const user of users) {
        await prisma.user.create({
            data: user,
        });
    }

    console.log("Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
