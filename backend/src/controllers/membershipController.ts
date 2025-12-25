import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';

// Public enrollment - creates User + Pending Membership (no auth required)
export const enrollMembership = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, city, state, planType, password } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !planType) {
            return res.status(400).json({ error: 'Name, email, phone, and plan are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists. Please login.' });
        }

        // Get plan details
        const plan = await prisma.planConfig.findFirst({
            where: { planType, isActive: true }
        });

        if (!plan) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        // Create user and membership in a transaction
        // Note: User is created without password - they will set it on first login
        const result = await prisma.$transaction(async (tx) => {
            // Create user without password (they will set it on first login)
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    phone,
                    password: null, // No password initially
                    passwordSet: false, // Will be set to true when user creates password
                    role: 'USER'
                }
            });

            // Create pending membership
            const membership = await tx.membership.create({
                data: {
                    userId: user.id,
                    planType,
                    state,
                    totalDays: plan.days,
                    paymentAmount: plan.price,
                    status: 'PENDING',
                    paymentStatus: 'UNPAID'
                } as any
            });

            return { user, membership };
        });

        res.status(201).json({
            success: true,
            message: 'Enrollment request submitted successfully!',
            data: {
                userId: result.user.id,
                membershipId: result.membership.id,
                name: result.user.name,
                email: result.user.email,
                planType,
                state: (result.membership as any).state,
                status: 'PENDING'
            }
        });

    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ error: 'Failed to submit enrollment. Please try again.' });
    }
};

// Get user's membership with state-aware response
export const getMembership = async (req: AuthRequest, res: Response) => {
    try {
        const membership = await prisma.membership.findUnique({
            where: { userId: req.user!.id },
            include: { customDestinations: true }
        });

        if (!membership) {
            // No membership - return null with available plans
            const plans = await prisma.planConfig.findMany({
                where: { isActive: true },
                orderBy: { planType: 'asc' },
                include: { destinations: true }
            });

            return res.json({
                membership: null,
                status: 'NONE',
                message: 'No membership found. Choose a plan to get started.',
                plans
            });
        }

        // Check if membership is expired
        let status = membership.status;
        if (membership.endDate && new Date() > membership.endDate && status === 'ACTIVE') {
            status = 'EXPIRED';
            await prisma.membership.update({
                where: { id: membership.id },
                data: { status: 'EXPIRED' }
            });
        }

        // Calculate remaining days (including custom added days)
        const remainingDays = (membership.totalDays + (membership.customDaysAdded || 0)) - membership.usedDays;

        res.json({
            membership: {
                id: membership.id,
                planType: membership.planType,
                startDate: membership.startDate,
                endDate: membership.endDate,
                totalDays: membership.totalDays,
                usedDays: membership.usedDays,
                customDaysAdded: membership.customDaysAdded,
                remainingDays,
                status,
                paymentStatus: membership.paymentStatus,
                paymentAmount: membership.paymentAmount,
                customDestinations: membership.customDestinations.map(d => d.name) // Send names for filtering
            }
        });
    } catch (error) {
        console.error('Get membership error:', error);
        res.status(500).json({ error: 'Failed to get membership details' });
    }
};

// User selects a plan - creates PENDING membership
export const choosePlan = async (req: AuthRequest, res: Response) => {
    try {
        const { planType } = req.body;

        if (!planType || !['1Y', '3Y', '5Y'].includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type. Use "1Y", "3Y", or "5Y".' });
        }

        // Check if user already has a membership
        const existingMembership = await prisma.membership.findUnique({
            where: { userId: req.user!.id }
        });

        if (existingMembership) {
            if (existingMembership.status === 'ACTIVE') {
                return res.status(400).json({ error: 'You already have an active membership.' });
            }
            if (existingMembership.status === 'PENDING') {
                return res.status(400).json({
                    error: 'You already have a pending membership request.',
                    membership: existingMembership
                });
            }
        }

        // Get plan config for pricing
        const planConfig = await prisma.planConfig.findUnique({
            where: { planType }
        });

        if (!planConfig) {
            return res.status(400).json({ error: 'Plan configuration not found.' });
        }

        // Create or update membership as PENDING
        const membership = existingMembership
            ? await prisma.membership.update({
                where: { id: existingMembership.id },
                data: {
                    planType,
                    totalDays: planConfig.days,
                    status: 'PENDING',
                    paymentStatus: 'UNPAID',
                    paymentAmount: planConfig.price,
                    startDate: null,
                    endDate: null,
                    activatedAt: null,
                    usedDays: 0
                }
            })
            : await prisma.membership.create({
                data: {
                    userId: req.user!.id,
                    planType,
                    totalDays: planConfig.days,
                    status: 'PENDING',
                    paymentStatus: 'UNPAID',
                    paymentAmount: planConfig.price
                }
            });

        res.status(201).json({
            message: 'Plan selected successfully. Please complete payment.',
            membership: {
                ...membership,
                planName: planConfig.name,
                price: planConfig.price
            }
        });
    } catch (error) {
        console.error('Choose plan error:', error);
        res.status(500).json({ error: 'Failed to select plan' });
    }
};

// Get available plans (public for mobile app)
export const getPlans = async (req: AuthRequest, res: Response) => {
    try {
        let plans = await prisma.planConfig.findMany({
            where: { isActive: true },
            orderBy: { planType: 'asc' }
        });

        // Create default plans if none exist
        if (plans.length === 0) {
            await prisma.planConfig.createMany({
                data: [
                    { planType: '1Y', name: '1-Year Membership', days: 6, price: 9999 },
                    { planType: '3Y', name: '3-Year Membership', days: 18, price: 24999 },
                    { planType: '5Y', name: '5-Year Membership', days: 30, price: 39999 },
                ]
            });
            plans = await prisma.planConfig.findMany({
                where: { isActive: true },
                orderBy: { planType: 'asc' }
            });
        }

        res.json({ plans });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to get plans' });
    }
};

// User marks payment as done (for manual payment flow)
export const markPaymentDone = async (req: AuthRequest, res: Response) => {
    try {
        const { paymentMethod, transactionId, notes } = req.body;

        const membership = await prisma.membership.findUnique({
            where: { userId: req.user!.id }
        });

        if (!membership) {
            return res.status(404).json({ error: 'No membership found' });
        }

        if (membership.status !== 'PENDING') {
            return res.status(400).json({ error: 'Membership is not in pending state' });
        }

        // Create payment record
        await prisma.payment.create({
            data: {
                userId: req.user!.id,
                membershipId: membership.id,
                amount: membership.paymentAmount || 0,
                method: paymentMethod,
                gatewayReference: transactionId,
                notes,
                status: 'SUCCESS'
            }
        });

        // Update membership payment status (still PENDING until admin approves)
        await prisma.membership.update({
            where: { id: membership.id },
            data: { paymentStatus: 'PAID' }
        });

        res.json({
            message: 'Payment recorded. Our team will verify and activate your membership shortly.'
        });
    } catch (error) {
        console.error('Mark payment error:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

// Cancel pending membership
export const cancelMembership = async (req: AuthRequest, res: Response) => {
    try {
        const membership = await prisma.membership.findUnique({
            where: { userId: req.user!.id }
        });

        if (!membership) {
            return res.status(404).json({ error: 'No membership found' });
        }

        if (membership.status !== 'PENDING') {
            return res.status(400).json({ error: 'Cannot cancel active or expired membership' });
        }

        await prisma.membership.delete({
            where: { id: membership.id }
        });

        res.json({ message: 'Membership request cancelled' });
    } catch (error) {
        console.error('Cancel membership error:', error);
        res.status(500).json({ error: 'Failed to cancel membership' });
    }
};
