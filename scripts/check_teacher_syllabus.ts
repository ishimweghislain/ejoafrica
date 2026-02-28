import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USER INFO ---');
    const user = await prisma.user.findUnique({
        where: { email: 'english@gmail.com' },
    });

    if (!user) {
        console.log('User not found: english@gmail.com');
        return;
    }

    console.log(`User found: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    console.log('\n--- SCHEMES FOR THIS TEACHER ---');
    const schemes = await prisma.schemeOfWork.findMany({
        where: { teacherId: user.id },
        include: {
            course: {
                include: {
                    topics: {
                        include: {
                            subtopics: {
                                include: { units: true }
                            }
                        }
                    }
                }
            },
            class: true
        }
    });

    if (schemes.length === 0) {
        console.log('No schemes found for this teacher.');
    }

    schemes.forEach(s => {
        console.log(`\nScheme ID: ${s.id}`);
        console.log(`Course: ${s.course.title} (ID: ${s.course.id})`);
        console.log(`Class: ${s.class.name} (ID: ${s.class.id})`);
        console.log(`Topics count: ${s.course.topics.length}`);

        s.course.topics.forEach(t => {
            console.log(`  Topic: ${t.title}`);
            t.subtopics.forEach(st => {
                console.log(`    Subtopic: ${st.title}`);
                st.units.forEach(u => {
                    console.log(`      Unit: ${u.title} (${u.periods} periods)`);
                });
            });
        });
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
