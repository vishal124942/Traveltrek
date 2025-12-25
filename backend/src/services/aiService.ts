import { GoogleGenerativeAI } from '@google/generative-ai';
import { User, Membership, Destination } from '@prisma/client';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are a polite, honest travel assistant for TravelTrek, a membership-based travel company.

IMPORTANT RULES:
1. You must respond ONLY using company policies and user data provided to you.
2. Never promise guaranteed bookings or peak season availability.
3. If unsure about anything, say that the support team will assist further.
4. Be friendly, transparent, and human-like in your responses.
5. Keep responses concise but helpful.
6. Always refer to travel days as "membership days" or "travel days".

COMPANY POLICIES:
- Members purchase membership plans (1-Year with 6 days, or 3-Year with 18 days)
- Travel is allowed only to curated destinations
- Travel is allowed only during company-defined seasons (best months for each destination)
- Unused days do NOT carry over to the next year
- Members cannot book trips directly - they must contact support
- Availability depends on season and destination capacity

SUPPORT CONTACT:
- Email: ${process.env.SUPPORT_EMAIL || 'support@traveltrek.com'}
- Phone: ${process.env.SUPPORT_PHONE || '+91-9876543210'}`;

interface UserWithMembership extends User {
    membership: Membership | null;
}

export const getAIResponse = async (
    message: string,
    user: UserWithMembership | null,
    destinations: Destination[]
): Promise<string> => {
    try {
        // Check if API key is valid
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('xxx')) {
            return getFallbackResponse(message, user, destinations);
        }

        // Build user context
        const userContext = buildUserContext(user, destinations);
        const fullPrompt = SYSTEM_PROMPT + '\n\n' + userContext + '\n\nUser message: ' + message;

        // Use Gemini 2.0 Flash (latest experimental)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return text || 'I apologize, but I couldn\'t process your request. Please try again or contact our support team.';
    } catch (error) {
        console.error('AI service error:', error);
        // Return fallback response if Gemini fails
        return getFallbackResponse(message, user, destinations);
    }
};

export const getAIResponseStream = async (
    message: string,
    user: UserWithMembership | null,
    destinations: Destination[]
): Promise<any> => {
    try {
        // Check if API key is valid
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('xxx')) {
            // Fallback doesn't support streaming, so we just return the full text as a single chunk
            const fallback = getFallbackResponse(message, user, destinations);
            return {
                stream: (async function* () {
                    yield { text: () => fallback };
                })()
            };
        }

        // Build user context
        const userContext = buildUserContext(user, destinations);
        const fullPrompt = SYSTEM_PROMPT + '\n\n' + userContext + '\n\nUser message: ' + message;

        // Use Gemini 2.0 Flash (latest experimental)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContentStream(fullPrompt);
        return result;
    } catch (error) {
        console.error('AI service stream error:', error);
        const fallback = getFallbackResponse(message, user, destinations);
        return {
            stream: (async function* () {
                yield { text: () => fallback };
            })()
        };
    }
};

const buildUserContext = (
    user: UserWithMembership | null,
    destinations: Destination[]
): string => {
    let context = 'CURRENT USER DATA:\n';

    if (user) {
        context += `- Name: ${user.name}\n`;

        if (user.membership) {
            const remaining = user.membership.totalDays - user.membership.usedDays;
            context += `- Membership Plan: ${user.membership.planType === '1Y' ? '1-Year' : '3-Year'}\n`;
            context += `- Membership Status: ${user.membership.status}\n`;
            context += `- Total Days: ${user.membership.totalDays}\n`;
            context += `- Used Days: ${user.membership.usedDays}\n`;
            context += `- Remaining Days: ${remaining}\n`;
            if (user.membership.startDate) {
                context += `- Start Date: ${new Date(user.membership.startDate).toLocaleDateString()}\n`;
            }
            if (user.membership.endDate) {
                context += `- Expiry Date: ${new Date(user.membership.endDate).toLocaleDateString()}\n`;
            }
        } else {
            context += `- Membership: Not yet activated\n`;
        }
    }

    // Add available destinations
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    context += `\nCURRENT MONTH: ${currentMonth}\n`;
    context += '\nAVAILABLE DESTINATIONS:\n';

    destinations.forEach(dest => {
        try {
            const bestMonths = JSON.parse(dest.bestMonths);
            const isGoodMonth = bestMonths.includes(currentMonth);
            context += `- ${dest.name}: ${dest.durationDays} days, ${dest.difficulty} difficulty`;
            context += isGoodMonth ? ' (GOOD TIME TO VISIT)' : '';
            context += `\n  Best months: ${bestMonths.join(', ')}\n`;
        } catch {
            context += `- ${dest.name}: ${dest.durationDays} days\n`;
        }
    });

    return context;
};

// Fallback responses when Gemini is not available
const getFallbackResponse = (
    message: string,
    user: UserWithMembership | null,
    destinations: Destination[]
): string => {
    const lowerMessage = message.toLowerCase();

    // Check for common queries
    if (lowerMessage.includes('days') && (lowerMessage.includes('left') || lowerMessage.includes('remaining'))) {
        if (user?.membership) {
            const remaining = user.membership.totalDays - user.membership.usedDays;
            return `You have ${remaining} travel days remaining out of ${user.membership.totalDays} total days in your ${user.membership.planType === '1Y' ? '1-Year' : '3-Year'} membership. 🌄`;
        }
        return 'Your membership is not yet activated. Please contact our support team to activate your membership.';
    }

    if (lowerMessage.includes('expire') || lowerMessage.includes('expiry')) {
        if (user?.membership?.endDate) {
            const expiryDate = new Date(user.membership.endDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return `Your membership expires on ${expiryDate}. Make sure to use your remaining travel days before then! 📅`;
        }
        return 'Your membership expiry date will be set once your membership is activated.';
    }

    if (lowerMessage.includes('destination') && lowerMessage.includes('available')) {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const availableNow = destinations.filter(d => {
            try {
                const bestMonths = JSON.parse(d.bestMonths);
                return bestMonths.includes(currentMonth) && d.status === 'available';
            } catch {
                return false;
            }
        });

        if (availableNow.length > 0) {
            const names = availableNow.map(d => d.name).join(', ');
            return `Great news! The following destinations are ideal for visiting in ${currentMonth}: ${names}. Would you like more details about any of them? 🏔️`;
        }
        return `Currently, the best time to visit most of our destinations is different from ${currentMonth}. Check the Destinations section in the app for seasonal availability.`;
    }

    if (lowerMessage.includes('membership') && lowerMessage.includes('work')) {
        return `With TravelTrek membership, you get fixed travel days to visit our curated destinations during optimal seasons. 

📋 How it works:
1. Purchase a 1-Year (6 days) or 3-Year (18 days) membership
2. Browse our curated destinations
3. Contact support to plan your travel
4. Enjoy stress-free adventures!

Your days are valid throughout your membership period. Contact our team to get started! 😊`;
    }

    if (lowerMessage.includes('don\'t use') || lowerMessage.includes('unused')) {
        return `Unused travel days do not carry over to the next year. We encourage you to plan your adventures and make the most of your membership! If you need help planning, our support team is here to assist. 🌟`;
    }

    // Default response
    return `Thank you for your message! I'm here to help with questions about your membership, travel days, and destinations.

Some things I can help with:
• How many days do I have left?
• When does my membership expire?
• Which destinations are available this month?
• How does membership work?

For specific booking inquiries or complex questions, our support team at ${process.env.SUPPORT_EMAIL || 'support@traveltrek.com'} will be happy to assist! 🌄`;
};
