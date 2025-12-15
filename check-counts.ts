
import { prisma } from './lib/prisma';

async function checkCounts() {
  try {
    const userCount = await prisma.user.count();
    const articleCount = await prisma.article.count();
    const resourceCount = await prisma.resource.count();
    const announcementCount = await prisma.announcement.count();
    const categoryCount = await prisma.category.count();

    console.log('--- Database Counts ---');
    console.log(`Users: ${userCount}`);
    console.log(`Articles: ${articleCount}`);
    console.log(`Resources: ${resourceCount}`);
    console.log(`Announcements: ${announcementCount}`);
    console.log(`Categories: ${categoryCount}`);
    console.log('-----------------------');
  } catch (error) {
    console.error('Error counting:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();
