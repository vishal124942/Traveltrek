// Simple in-memory rate limiter for chat API
// Limits users to X requests per minute

interface RateLimitData {
    count: number;
    resetAt: Date;
}

const rateLimitStore = new Map<string, RateLimitData>();

// Config
const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = new Date();
    for (const [key, data] of rateLimitStore.entries()) {
        if (data.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export const checkRateLimit = (userId: string): { allowed: boolean; remaining: number; resetAt: Date } => {
    const now = new Date();
    const data = rateLimitStore.get(userId);

    // No existing rate limit data - create new
    if (!data || data.resetAt < now) {
        const resetAt = new Date(now.getTime() + WINDOW_MS);
        rateLimitStore.set(userId, { count: 1, resetAt });
        return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1, resetAt };
    }

    // Check if limit exceeded
    if (data.count >= MAX_REQUESTS_PER_MINUTE) {
        return { allowed: false, remaining: 0, resetAt: data.resetAt };
    }

    // Increment counter
    data.count++;
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - data.count, resetAt: data.resetAt };
};

export const getRateLimitInfo = (userId: string): { remaining: number; resetAt: Date | null } => {
    const data = rateLimitStore.get(userId);
    if (!data || data.resetAt < new Date()) {
        return { remaining: MAX_REQUESTS_PER_MINUTE, resetAt: null };
    }
    return { remaining: MAX_REQUESTS_PER_MINUTE - data.count, resetAt: data.resetAt };
};
