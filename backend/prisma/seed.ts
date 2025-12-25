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
        {
            planType: '5Y',
            name: '5-Year Membership',
            days: 30,
            price: 60000,
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

    // Seed Destinations
    console.log('Seeding destinations...');

    const destinations = [
        {
            name: 'Manali',
            description: 'A breathtaking hill station in Himachal Pradesh, perfect for adventure enthusiasts and nature lovers.',
            durationDays: 3,
            bestMonths: '["March", "April", "May", "June", "October", "November"]',
            difficulty: 'moderate',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9993a23?w=800',
        },
        {
            name: 'Goa',
            description: 'India\'s beach paradise with stunning coastlines, vibrant nightlife, and Portuguese heritage.',
            durationDays: 4,
            bestMonths: '["November", "December", "January", "February", "March"]',
            difficulty: 'easy',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
        },
        {
            name: 'Kerala Backwaters',
            description: 'Experience the serene backwaters of Kerala on a traditional houseboat cruise.',
            durationDays: 3,
            bestMonths: '["September", "October", "November", "December", "January", "February"]',
            difficulty: 'easy',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
        },
        {
            name: 'Jaipur',
            description: 'The Pink City with majestic forts, palaces, and rich Rajasthani culture.',
            durationDays: 2,
            bestMonths: '["October", "November", "December", "January", "February", "March"]',
            difficulty: 'easy',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
        },
        {
            name: 'Ladakh',
            description: 'The land of high passes, stunning monasteries, and breathtaking Himalayan landscapes.',
            durationDays: 6,
            bestMonths: '["June", "July", "August", "September"]',
            difficulty: 'difficult',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
        },
        {
            name: 'Udaipur',
            description: 'The City of Lakes with stunning palaces, romantic boat rides, and royal heritage.',
            durationDays: 2,
            bestMonths: '["September", "October", "November", "December", "January", "February", "March"]',
            difficulty: 'easy',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800',
        },
        {
            name: 'Rishikesh',
            description: 'The yoga capital of the world, offering spiritual retreats and adventure sports by the Ganges.',
            durationDays: 2,
            bestMonths: '["February", "March", "April", "May", "September", "October", "November"]',
            difficulty: 'moderate',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1617516202459-f1d95d57ae57?w=800',
        },
        {
            name: 'Andaman Islands',
            description: 'Pristine beaches, crystal-clear waters, and incredible marine life await.',
            durationDays: 5,
            bestMonths: '["October", "November", "December", "January", "February", "March", "April", "May"]',
            difficulty: 'moderate',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        },
    ];

    for (const dest of destinations) {
        const exists = await prisma.destination.findFirst({
            where: { name: dest.name },
        });

        if (!exists) {
            await prisma.destination.create({
                data: dest,
            });
            console.log(`Created destination: ${dest.name}`);
        } else {
            console.log(`Destination already exists: ${dest.name}`);
        }
    }

    console.log('Destinations seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
