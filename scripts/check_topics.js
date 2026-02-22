const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTopics() {
    const topics = await prisma.topic.findMany({
        where: { courseId: '60d0cdd6-dc19-4e60-bb5e-86b44a43199c' },
        include: {
            subtopics: {
                include: { units: true }
            }
        }
    });
    console.log(JSON.stringify(topics, null, 2));
}

checkTopics().then(() => prisma.$disconnect());
