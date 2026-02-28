import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USER INFO ---');
    const user = await prisma.user.findUnique({
        where: { email: 'english@gmail.com' },
        include: {
            schemes: {
                include: {
                    course: true,
                    class: true
                }
            }
        }
    });

    if (!user) {
        console.log('User not found: english@gmail.com');
        return;
    }

    console.log(`User found: ${user.firstName} ${user.lastName} (ID: ${user.id}, Role: ${user.role})`);
    console.log(`Directly linked schemes: ${user.schemes.length}`);
    user.schemes.forEach(s => {
        console.log(` - Scheme: ${s.id}, Course: ${s.course.title}, Class: ${s.class.name}`);
    });

    console.log('\n--- ALL SCHEMES CHECK ---');
    const allSchemes = await prisma.schemeOfWork.findMany({
        where: { teacherId: user.id },
        include: {
            course: true,
            class: true
        }
    });
    console.log(`Total schemes for teacherId ${user.id}: ${allSchemes.length}`);
    allSchemes.forEach(s => {
        console.log(` - Scheme: ${s.id}, Course: ${s.course.title}, Class: ${s.class.name}`);
    });

    console.log('\n--- ALL SCHEMES IN DB ---');
    const dbSchemes = await prisma.schemeOfWork.findMany({
        include: {
            course: true,
            class: true,
            teacher: true
        }
    });
    console.log(`Total schemes in DB: ${dbSchemes.length}`);
    dbSchemes.forEach(s => {
        console.log(` - Scheme: ${s.id}, Course: ${s.course?.title}, Class: ${s.class?.name}, Teacher: ${s.teacher?.email}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
