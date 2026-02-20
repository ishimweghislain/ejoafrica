import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { firstName: { contains: 'Felix', mode: 'insensitive' } },
                { lastName: { contains: 'Felix', mode: 'insensitive' } }
            ]
        },
        include: {
            courses: true,
            class: true
        }
    });

    const p1Class = await prisma.class.findFirst({
        where: { name: { contains: 'P1', mode: 'insensitive' } }
    });

    console.log('Felix Users:', JSON.stringify(users, null, 2));
    console.log('P1 Class:', JSON.stringify(p1Class, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
