import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const classes = await prisma.class.findMany();
    const years = await prisma.academicYear.findMany({ include: { terms: true } });
    console.log('CLASSES:', JSON.stringify(classes, null, 2));
    console.log('YEARS:', JSON.stringify(years, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
