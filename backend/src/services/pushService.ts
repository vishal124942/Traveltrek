import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
    if (firebaseInitialized) return;

    try {
        // Check if we have valid credentials
        if (!process.env.FIREBASE_PROJECT_ID ||
            !process.env.FIREBASE_PRIVATE_KEY ||
            !process.env.FIREBASE_CLIENT_EMAIL) {
            console.log('🔔 [DEV MODE] Firebase not configured, skipping initialization');
            return;
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            })
        });

        firebaseInitialized = true;
        console.log('🔔 Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
};

interface PushNotificationOptions {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

export const sendPushNotification = async (
    options: PushNotificationOptions
): Promise<boolean> => {
    try {
        initializeFirebase();

        // Skip if Firebase not initialized (development mode)
        if (!firebaseInitialized) {
            console.log('🔔 [DEV MODE] Push notification would be sent');
            console.log('🔔 Title:', options.title);
            console.log('🔔 Body:', options.body);
            return true;
        }

        const message = {
            token: options.token,
            notification: {
                title: options.title,
                body: options.body
            },
            data: options.data || {},
            android: {
                priority: 'high' as const,
                notification: {
                    sound: 'default',
                    channelId: 'traveltrek_default'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log('🔔 Push notification sent:', response);
        return true;
    } catch (error) {
        console.error('Push notification error:', error);
        return false;
    }
};

export const sendWelcomePush = async (
    fcmToken: string | null,
    name: string
): Promise<boolean> => {
    if (!fcmToken) {
        console.log('🔔 No FCM token, skipping push notification');
        return false;
    }

    const companyName = process.env.COMPANY_NAME || 'TravelTrek';

    return sendPushNotification({
        token: fcmToken,
        title: `Welcome to ${companyName}! 🌄`,
        body: `Hi ${name}, your adventure begins now. Explore destinations and plan your travels!`,
        data: {
            type: 'welcome',
            screen: 'home'
        }
    });
};
