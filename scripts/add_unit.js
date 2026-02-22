const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addUnit() {
    const unit = await prisma.unit.create({
        data: {
            title: 'Mathematics Fundamental Unit 1',
            subtopicId: '453fa845-9d7b-46f4-a7e5-296a12f895e0',
            periods: 4,
            knowledge: 'Understand basic integration principles',
            skills: 'Calculate simple integrals',
            attitudes: 'Appreciate the beauty of calculus'
        }
    });
    console.log('Unit created:', unit);
}

addUnit().then(() => prisma.$disconnect());
