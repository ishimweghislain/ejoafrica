import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const teacher = await prisma.user.findFirst({
        where: {
            OR: [
                { firstName: { contains: 'FELIX', mode: 'insensitive' } },
                { lastName: { contains: 'FELIX', mode: 'insensitive' } }
            ]
        }
    });

    if (!teacher) {
        console.error('Teacher Felix not found');
        return;
    }

    let p1Class = await prisma.class.findFirst({ where: { name: { contains: 'Primary 1', mode: 'insensitive' } } });
    if (!p1Class) p1Class = await prisma.class.findFirst({ where: { name: { contains: 'P1', mode: 'insensitive' } } });

    const year = await prisma.academicYear.findFirst();
    const term = await prisma.academicTerm.findFirst();
    const course = await prisma.course.findFirst({
        where: {
            AND: [
                { title: { contains: 'P1', mode: 'insensitive' } },
                { title: { contains: 'MATH', mode: 'insensitive' } }
            ]
        }
    });

    if (!p1Class || !year || !term || !course) {
        console.error('Metadata missing:', { p1Class: !!p1Class, year: !!year, term: !!term, course: !!course });
        return;
    }

    console.log('Setting up for Felix...', { teacherId: teacher.id, courseId: course.id });

    // 1. Create Topics and Units
    const existingTopics = await prisma.topic.findMany({ where: { courseId: course.id } });
    if (existingTopics.length === 0) {
        await prisma.topic.create({
            data: {
                title: 'Number Operations',
                courseId: course.id,
                subtopics: {
                    create: {
                        title: 'Addition and Subtraction',
                        units: {
                            create: [
                                { title: 'Addition of single digits', periods: 2 },
                                { title: 'Subtraction of single digits', periods: 2 }
                            ]
                        }
                    }
                }
            }
        });
        console.log('Created Topics/Units');
    }

    // 2. Create Scheme of Work
    let scheme = await prisma.schemeOfWork.findFirst({
        where: { courseId: course.id, classId: p1Class.id }
    });

    if (!scheme) {
        scheme = await prisma.schemeOfWork.create({
            data: {
                courseId: course.id,
                classId: p1Class.id,
                academicYearId: year.id,
                termId: term.id,
                periodsPerWeek: 4,
                reference: 'Primary 1 Math Syllabus'
            }
        });
        console.log('Created Scheme of Work');
    }

    // 3. Add Lessons
    const units = await prisma.unit.findMany({
        where: { subtopic: { topic: { courseId: course.id } } }
    });

    if (units.length > 0) {
        const existingLessons = await prisma.lesson.findMany({ where: { schemeId: scheme.id } });
        if (existingLessons.length === 0) {
            await prisma.lesson.create({
                data: {
                    schemeId: scheme.id,
                    unitId: units[0].id,
                    title: 'Introduction to Addition',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 3600000),
                    teachingMethod: 'Interactive games',
                    evaluation: 'Class quiz'
                }
            });
            console.log('Created Sample Lesson');
        }
    }

    // 4. Create Timetable for Felix
    const existingTimetable = await prisma.timetable.findFirst({
        where: { teacherId: teacher.id, classId: p1Class.id }
    });

    if (!existingTimetable) {
        // Note: DayOfWeek is an enum in Prisma. MONDAY, WEDNESDAY should be exact.
        await prisma.timetable.create({
            data: {
                classId: p1Class.id,
                day: 0, // Monday
                startTime: '08:00',
                endTime: '09:00',
                courseId: course.id,
                teacherId: teacher.id,
                academicYearId: year.id,
                termId: term.id
            }
        });
        await prisma.timetable.create({
            data: {
                classId: p1Class.id,
                day: 2, // Wednesday
                startTime: '10:00',
                endTime: '11:00',
                courseId: course.id,
                teacherId: teacher.id,
                academicYearId: year.id,
                termId: term.id
            }
        });
        console.log('Created Timetable for Felix');
    }

    console.log('Felix setup complete!');
}

main().catch(e => {
    console.error('ERROR during setup:', e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
