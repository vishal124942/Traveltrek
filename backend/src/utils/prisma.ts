import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Handle cleanup on app shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
