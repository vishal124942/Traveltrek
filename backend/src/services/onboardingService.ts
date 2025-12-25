import { User } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { sendWelcomeEmail } from './emailService';
import { sendWelcomePush } from './pushService';

export const triggerOnboarding = async (user: User): Promise<void> => {
    console.log(`🚀 Starting onboarding for user: ${user.email}`);

    try {
        // 1. Create default membership record (inactive until payment)
        await prisma.membership.create({
            data: {
                userId: user.id,
                planType: '1Y', // Default plan type
                totalDays: 6,   // Default for 1-year plan
                usedDays: 0,
                status: 'inactive'
                // startDate and endDate are null until activation
            }
        });
        console.log('✅ Default membership created');

        // 2. Send Welcome Email
        const emailSent = await sendWelcomeEmail(user.email, user.name);
        console.log(emailSent ? '✅ Welcome email sent' : '❌ Welcome email failed');


        // 4. Send Push Notification (if FCM token available)
        const pushSent = await sendWelcomePush(user.fcmToken, user.name);
        console.log(pushSent ? '✅ Push notification sent' : '⚠️ Push notification skipped (no token)');

        console.log(`🎉 Onboarding completed for user: ${user.email}`);
    } catch (error) {
        console.error('Onboarding error:', error);
        // Don't throw - onboarding failures shouldn't block registration
    }
};
