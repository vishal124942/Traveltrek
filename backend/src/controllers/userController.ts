import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { updateProfileSchema, fcmTokenSchema } from '../utils/validators';
import { generateOtp, storeOtp, verifyOtp } from '../services/otpService';
import { sendOtpEmail } from '../services/emailService';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const validation = updateProfileSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user!.id },
            data: validation.data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true
            }
        });

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const updateFcmToken = async (req: AuthRequest, res: Response) => {
    try {
        const validation = fcmTokenSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors
            });
        }

        await prisma.user.update({
            where: { id: req.user!.id },
            data: { fcmToken: validation.data.fcmToken }
        });

        res.json({ message: 'FCM token updated successfully' });
    } catch (error) {
        console.error('Update FCM token error:', error);
        res.status(500).json({ error: 'Failed to update FCM token' });
    }
};

// Request OTP for profile change (name/phone)
export const requestProfileChange = async (req: AuthRequest, res: Response) => {
    try {
        const { field, newValue } = req.body;

        // Validate field
        if (!['name', 'phone'].includes(field)) {
            return res.status(400).json({ error: 'Invalid field. Only name and phone require OTP.' });
        }

        if (!newValue || newValue.trim().length === 0) {
            return res.status(400).json({ error: 'New value is required' });
        }

        // Get user email
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { email: true, name: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate and store OTP
        const otp = generateOtp();
        storeOtp(req.user!.id, field, newValue.trim(), otp);

        // Send OTP via email
        const emailSent = await sendOtpEmail(user.email, user.name, otp, field);

        if (!emailSent) {
            console.log(`[DEV] OTP for ${field} change: ${otp}`);
        }

        res.json({
            message: 'OTP sent to your email',
            field
        });
    } catch (error) {
        console.error('Request profile change error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

// Verify OTP and apply profile change
export const verifyProfileChange = async (req: AuthRequest, res: Response) => {
    try {
        const { field, newValue, otp } = req.body;

        if (!field || !newValue || !otp) {
            return res.status(400).json({ error: 'Field, new value, and OTP are required' });
        }

        // Verify OTP
        const result = verifyOtp(req.user!.id, field, otp);

        if (!result.valid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Update the profile field
        const updateData: Record<string, string> = {};
        updateData[field] = result.newValue!;

        const updatedUser = await prisma.user.update({
            where: { id: req.user!.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true
            }
        });

        res.json({
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
            user: updatedUser
        });
    } catch (error) {
        console.error('Verify profile change error:', error);
        res.status(500).json({ error: 'Failed to verify and update' });
    }
};

// Request OTP for password change
export const requestPasswordChange = async (req: AuthRequest, res: Response) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get user email
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { email: true, name: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash the new password before storing
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Generate and store OTP with hashed password
        const otp = generateOtp();
        storeOtp(req.user!.id, 'password', hashedPassword, otp);

        // Send OTP via email
        console.log(`[OTP] Sending OTP ${otp} to ${user.email} for password change`);
        const emailSent = await sendOtpEmail(user.email, user.name, otp, 'password');

        if (!emailSent) {
            console.log(`[DEV] OTP for password change: ${otp}`);
        }

        res.json({
            message: 'OTP sent to your registered email'
        });
    } catch (error) {
        console.error('Request password change error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

// Verify OTP and change password
export const verifyPasswordChange = async (req: AuthRequest, res: Response) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ error: 'OTP is required' });
        }

        // Verify OTP
        const result = verifyOtp(req.user!.id, 'password', otp);

        if (!result.valid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Update password with the pre-hashed value
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { password: result.newValue! }
        });

        res.json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Verify password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
