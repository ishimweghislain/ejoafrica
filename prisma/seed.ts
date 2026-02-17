import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
    console.log("Starting comprehensive seed...");

    try {
        // Cleanup sequence
        await prisma.studentDiscipline.deleteMany({});
        await prisma.lesson.deleteMany({});
        await prisma.schemeOfWork.deleteMany({});
        await prisma.timetable.deleteMany({});
        await prisma.unit.deleteMany({});
        await prisma.subtopic.deleteMany({});
        await prisma.topic.deleteMany({});
        await prisma.course.deleteMany({});
        await prisma.class.deleteMany({});
        await prisma.academicTerm.deleteMany({});
        await prisma.academicYear.deleteMany({});
        await prisma.user.deleteMany({});

        const hashedPassword = await bcrypt.hash("ptestpassword1", 10);

        // 1. Core Admin Users
        console.log("Creating administrative nodes...");
        const schoolAdmin = await prisma.user.create({
            data: {
                email: "admin@eshuri.rw",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
                role: "SCHOOL_ADMIN",
                school: "Lycée de Kigali",
            }
        });

        const dos = await prisma.user.create({
            data: {
                email: "dos@eshuri.rw",
                password: hashedPassword,
                firstName: "Director",
                lastName: "of Studies",
                role: "DOS",
                school: "Lycée de Kigali",
            }
        });

        const dod = await prisma.user.create({
            data: {
                email: "dod@eshuri.rw",
                password: hashedPassword,
                firstName: "Director",
                lastName: "of Discipline",
                role: "DOD",
                school: "Lycée de Kigali",
            }
        });

        // 2. Academic Infrastructure
        console.log("Creating academic infrastructure...");
        const year = await prisma.academicYear.create({
            data: {
                title: "2025-2026",
                startDate: new Date("2025-09-01"),
                endDate: new Date("2026-07-30"),
            }
        });

        const terms = await Promise.all([
            prisma.academicTerm.create({ data: { title: "Term 1", academicYearId: year.id, startDate: new Date("2025-09-01"), endDate: new Date("2025-12-15") } }),
            prisma.academicTerm.create({ data: { title: "Term 2", academicYearId: year.id, startDate: new Date("2026-01-05"), endDate: new Date("2026-04-10") } }),
            prisma.academicTerm.create({ data: { title: "Term 3", academicYearId: year.id, startDate: new Date("2026-04-20"), endDate: new Date("2026-07-30") } }),
        ]);

        const classNames = ["Senior 1", "Senior 2", "Senior 3", "Senior 4 MPC", "Senior 5 MPC", "Senior 6 MPC"];
        const classes = await Promise.all(classNames.map(name => prisma.class.create({ data: { name } })));

        // 3. Teaching Faculty
        console.log("Provisioning teaching faculty...");
        const teachers = await Promise.all([
            { email: "math@eshuri.rw", firstName: "Jean", lastName: "Kagame" },
            { email: "physics@eshuri.rw", firstName: "Alice", lastName: "Mutesi" },
            { email: "chemistry@eshuri.rw", firstName: "Paul", lastName: "Rwigara" },
        ].map(t => prisma.user.create({
            data: {
                ...t,
                password: hashedPassword,
                role: "TEACHER",
                school: "Lycée de Kigali"
            }
        })));

        // 4. Student Enrollment
        console.log("Syncing student population...");
        const studentNames = [
            { first: "Innocent", last: "Habimana" },
            { first: "Grace", last: "Umutesi" },
            { first: "David", last: "Ishimwe" },
            { first: "Sandrine", last: "Uwase" },
            { first: "Eric", last: "Mugisha" },
            { first: "Bella", last: "Gisa" }
        ];

        for (let i = 0; i < classes.length; i++) {
            for (let j = 0; j < studentNames.length; j++) {
                // @ts-ignore
                await prisma.user.create({
                    data: {
                        email: `student.${i}.${j}@eshuri.rw`,
                        password: hashedPassword,
                        firstName: studentNames[j].first,
                        lastName: studentNames[j].last,
                        role: "STUDENT",
                        school: "Lycée de Kigali",
                        // @ts-ignore
                        classId: classes[i].id,
                        disciplineMarks: 40 - Math.floor(Math.random() * 10)
                    }
                });
            }
        }

        // 5. Curriculum Mapping
        console.log("Engineering course nodes...");
        const courses = await Promise.all([
            prisma.course.create({
                data: {
                    title: "Mathematics",
                    classId: classes[0].id,
                    teacherId: teachers[0].id,
                    academicYearId: year.id,
                    termId: terms[0].id,
                    hoursPerWeek: 6
                }
            }),
            prisma.course.create({
                data: {
                    title: "Physics",
                    classId: classes[5].id,
                    teacherId: teachers[1].id,
                    academicYearId: year.id,
                    termId: terms[0].id,
                    hoursPerWeek: 5
                }
            })
        ]);

        console.log("Full spectrum seed complete!");
    } catch (err) {
        console.error("Infrastructure failure:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
