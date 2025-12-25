import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsAppMessage = async (
    to: string,
    body: string
): Promise<boolean> => {
    try {
        // Skip if no credentials (development mode)
        if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.startsWith('AC') === false) {
            console.log('💬 [DEV MODE] WhatsApp would be sent to:', to);
            console.log('💬 Message:', body);
            return true;
        }

        // Format phone number for WhatsApp
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

        const message = await client.messages.create({
            body,
            from,
            to: formattedTo
        });

        console.log('💬 WhatsApp message sent:', message.sid);
        return true;
    } catch (error) {
        console.error('WhatsApp service error:', error);
        return false;
    }
};

export const sendWelcomeWhatsApp = async (
    phone: string,
    name: string
): Promise<boolean> => {
    const companyName = process.env.COMPANY_NAME || 'TravelTrek';

    // Using approved template format
    const message = `Hi ${name} 👋

Welcome to ${companyName}!

Your membership account has been created successfully.
You will receive travel updates and availability here.

Login anytime via the app 🌄`;

    return sendWhatsAppMessage(phone, message);
};

// Send Membership ID notification when membership is activated
export const sendMembershipIdNotification = async (
    phone: string,
    name: string,
    membershipId: string,
    planType: string
): Promise<boolean> => {
    const companyName = process.env.COMPANY_NAME || 'TravelTrek';
    const planName = planType === '3Y' ? '3-Year' : '1-Year';

    const message = `🎉 Congratulations ${name}!

Your ${companyName} membership has been activated!

📋 *Membership ID:* ${membershipId}
📅 *Plan:* ${planName} Membership

Use this Membership ID to login at our website.

Login at: https://traveltrek.com/member-login

Need help? Contact support@traveltrek.com

Happy travels! ✈️`;

    return sendWhatsAppMessage(phone, message);
};
