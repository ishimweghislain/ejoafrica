const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAll() {
    const courses = await prisma.course.findMany({
        include: { _count: { select: { topics: true } } }
    });
    console.log(JSON.stringify(courses, null, 2));
}

listAll().then(() => prisma.$disconnect());
