const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findMath() {
    const courses = await prisma.course.findMany({
        where: { title: { contains: 'Mathematics', mode: 'insensitive' } },
        include: { _count: { select: { topics: true } } }
    });
    console.log(JSON.stringify(courses, null, 2));
}

findMath().then(() => prisma.$disconnect());
