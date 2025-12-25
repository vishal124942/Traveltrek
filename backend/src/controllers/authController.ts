import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { registerSchema, loginSchema } from '../utils/validators';
import { triggerOnboarding } from '../services/onboardingService';

export const register = async (req: Request, res: Response) => {
    try {
        // Validate input
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors
            });
        }

        const { name, email, phone, password } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword
            }
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        // Trigger automated onboarding (async - don't wait)
        triggerOnboarding(user).catch(console.error);

        // Return success response
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        // Validate input
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors
            });
        }

        const { email, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { membership: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                hasMembership: !!user.membership
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Member Login - Login with Membership ID
export const memberLogin = async (req: Request, res: Response) => {
    try {
        const { membershipId, password } = req.body;

        if (!membershipId) {
            return res.status(400).json({ error: 'Membership ID is required' });
        }

        // Find membership by membershipId
        const membership = await prisma.membership.findUnique({
            where: { membershipId },
            include: { user: true }
        });

        if (!membership || !membership.user) {
            return res.status(401).json({ error: 'Invalid Membership ID' });
        }

        // Check if membership is active
        if (membership.status !== 'ACTIVE') {
            return res.status(401).json({
                error: 'Membership is not active yet. Please wait for admin approval.',
                status: membership.status
            });
        }

        // Check if user has set their password yet
        if (!membership.user.passwordSet) {
            // First time login - need to set password
            return res.json({
                needsPasswordSetup: true,
                message: 'Please set your password to continue',
                email: membership.user.email,
                membershipId: membership.membershipId
            });
        }

        // Password is set - validate it
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        if (!membership.user.password) {
            return res.status(500).json({ error: 'Account password error. Please contact support.' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, membership.user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: membership.user.id, email: membership.user.email, membershipId },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: membership.user.id,
                name: membership.user.name,
                email: membership.user.email,
                phone: membership.user.phone,
                role: membership.user.role,
                membershipId: membership.membershipId,
                membershipStatus: membership.status
            }
        });

    } catch (error) {
        console.error('Member login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Set Password - For first-time member login
export const setMemberPassword = async (req: Request, res: Response) => {
    try {
        const { membershipId, email, password, confirmPassword } = req.body;

        // Validation
        if (!membershipId || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Find membership and user
        const membership = await prisma.membership.findUnique({
            where: { membershipId },
            include: { user: true }
        });

        if (!membership || !membership.user) {
            return res.status(404).json({ error: 'Membership not found' });
        }

        // Verify email matches
        if (membership.user.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ error: 'Email does not match membership records' });
        }

        // Check if password already set
        if (membership.user.passwordSet) {
            return res.status(400).json({ error: 'Password already set. Please login or use forgot password.' });
        }

        // Hash and save password
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: membership.user.id },
            data: {
                password: hashedPassword,
                passwordSet: true
            }
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: membership.user.id, email: membership.user.email, membershipId },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        res.json({
            message: 'Password set successfully!',
            token,
            user: {
                id: membership.user.id,
                name: membership.user.name,
                email: membership.user.email,
                phone: membership.user.phone,
                role: membership.user.role,
                membershipId: membership.membershipId,
                membershipStatus: membership.status
            }
        });

    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ error: 'Failed to set password' });
    }
};

// Generate unique Membership ID (10-digit numeric format)
export const generateMembershipId = async (): Promise<string> => {
    const year = new Date().getFullYear();

    // Upsert counter for current year
    const counter = await prisma.membershipCounter.upsert({
        where: { year },
        update: { counter: { increment: 1 } },
        create: { year, counter: 1 }
    });

    // Format: 10-digit number (YYYYNNNNNN where YYYY is year and NNNNNN is sequential 6-digit number)
    const paddedNumber = counter.counter.toString().padStart(6, '0');
    return `${year}${paddedNumber}`;
};

// Forgot Password - Request OTP
import { generateOtp, storeOtp, verifyOtp } from '../services/otpService';
import { sendOtpEmail } from '../services/emailService';


export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true }
        });

        if (!user) {
            // Don't reveal if user exists
            return res.json({ message: 'If the email exists, an OTP will be sent' });
        }

        // Generate and store OTP
        const otp = generateOtp();
        storeOtp(user.id, 'forgot_password', email, otp);

        // Send OTP via email
        console.log(`[OTP] Sending OTP ${otp} to ${email} for password reset`);
        const emailSent = await sendOtpEmail(email, user.name, otp, 'password reset');

        if (!emailSent) {
            console.log(`[DEV] OTP for password reset: ${otp}`);
        }

        res.json({
            message: 'OTP sent to your email',
            userId: user.id // Need this for reset step
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

// Reset Password - Verify OTP and update password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // Verify OTP
        const result = verifyOtp(user.id, 'forgot_password', otp);

        if (!result.valid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

// Google Sign-In
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { idToken, email, name, googleId, photoUrl } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ error: 'Google authentication data is required' });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email },
            include: { membership: true }
        });

        if (!user) {
            // Create new user with Google info
            user = await prisma.user.create({
                data: {
                    name: name || email.split('@')[0],
                    email,
                    phone: '',
                    password: '', // No password for Google users
                    googleId
                },
                include: { membership: true }
            });

            // Trigger onboarding for new users
            triggerOnboarding(user).catch(console.error);
        } else if (!user.googleId) {
            // Link Google account to existing user
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId },
                include: { membership: true }
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        res.json({
            message: 'Google authentication successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                hasMembership: !!user.membership
            }
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
};
