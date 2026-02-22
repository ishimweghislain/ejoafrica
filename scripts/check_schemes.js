const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchemes() {
    const schemes = await prisma.schemeOfWork.findMany({
        include: {
            course: true,
            class: true,
            academicYear: true,
            term: true
        }
    });
    console.log(JSON.stringify(schemes, null, 2));
}

checkSchemes().then(() => prisma.$disconnect());
