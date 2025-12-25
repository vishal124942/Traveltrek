import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding plans...');

    const plans = [
        {
            planType: '1Y',
            name: '1-Year Membership',
            days: 6,
            price: 15000,
            isActive: true,
        },
        {
            planType: '3Y',
            name: '3-Year Membership',
            days: 18,
            price: 40000,
            isActive: true,
        },
    ];

    for (const plan of plans) {
        const exists = await prisma.planConfig.findUnique({
            where: { planType: plan.planType },
        });

        if (!exists) {
            await prisma.planConfig.create({
                data: plan,
            });
            console.log(`Created plan: ${plan.name}`);
        } else {
            console.log(`Plan already exists: ${plan.name}`);
        }
    }

    console.log('Seeding completed.');

    // Seed Admin User
    const adminEmail = 'admin@traveltrek.com';
    const adminPassword = 'admin123'; // In a real app, use env vars

    // We need to hash the password. 
    // The backend uses 'bcrypt' (native), not 'bcryptjs'.
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
        },
        create: {
            email: adminEmail,
            name: 'Super Admin',
            password: hashedPassword,
            phone: '0000000000',
            role: 'ADMIN',
        },
    });

    console.log(`Admin user seeded: ${adminEmail} / ${adminPassword}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
