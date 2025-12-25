"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding...');
    // Seed Destinations
    const destinations = [
        {
            name: 'Manali Valley Trek',
            description: 'Experience the breathtaking beauty of the Himalayas with this scenic valley trek.',
            durationDays: 3,
            bestMonths: JSON.stringify(['March', 'April', 'May', 'September', 'October']),
            difficulty: 'easy',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'
        },
        {
            name: 'Leh Ladakh Expedition',
            description: 'Discover the magical landscapes of Ladakh, from ancient monasteries to pristine lakes.',
            durationDays: 6,
            bestMonths: JSON.stringify(['June', 'July', 'August', 'September']),
            difficulty: 'moderate',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
        },
        {
            name: 'Spiti Valley Adventure',
            description: 'Explore the remote cold desert mountain valley in the Himalayas.',
            durationDays: 5,
            bestMonths: JSON.stringify(['May', 'June', 'September', 'October']),
            difficulty: 'difficult',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800'
        },
        {
            name: 'Rishikesh Riverside Retreat',
            description: 'A peaceful getaway by the holy Ganges with yoga and meditation.',
            durationDays: 2,
            bestMonths: JSON.stringify(['October', 'November', 'February', 'March']),
            difficulty: 'easy',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800'
        },
        {
            name: 'Kashmir Paradise Tour',
            description: 'Experience the beauty of Dal Lake, Gulmarg, and Pahalgam.',
            durationDays: 4,
            bestMonths: JSON.stringify(['April', 'May', 'June', 'September', 'October']),
            difficulty: 'easy',
            status: 'coming_soon',
            imageUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800'
        },
        {
            name: 'Meghalaya Living Root Bridges',
            description: 'Trek to the famous living root bridges and explore pristine waterfalls.',
            durationDays: 4,
            bestMonths: JSON.stringify(['October', 'November', 'December', 'January', 'February']),
            difficulty: 'moderate',
            status: 'not_available',
            imageUrl: 'https://images.unsplash.com/photo-1611605645802-c21be743c321?w=800'
        }
    ];
    for (const destination of destinations) {
        await prisma.destination.create({
            data: destination
        });
    }
    console.log(`Created ${destinations.length} destinations`);
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map