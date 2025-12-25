// Simple in-memory OTP service
// For production, use Redis or a proper cache

interface OtpData {
    otp: string;
    field: string;
    newValue: string;
    expiresAt: Date;
}

const otpStore = new Map<string, OtpData>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
    const now = new Date();
    for (const [key, data] of otpStore.entries()) {
        if (data.expiresAt < now) {
            otpStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOtp = (userId: string, field: string, newValue: string, otp: string): void => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    otpStore.set(`${userId}:${field}`, {
        otp,
        field,
        newValue,
        expiresAt
    });
};

export const verifyOtp = (userId: string, field: string, otp: string): { valid: boolean; newValue?: string } => {
    const key = `${userId}:${field}`;
    const data = otpStore.get(key);

    if (!data) {
        return { valid: false };
    }

    if (data.expiresAt < new Date()) {
        otpStore.delete(key);
        return { valid: false };
    }

    if (data.otp !== otp) {
        return { valid: false };
    }

    // OTP is valid - delete it and return the new value
    otpStore.delete(key);
    return { valid: true, newValue: data.newValue };
};
