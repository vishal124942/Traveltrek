import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';

// Get all users with their memberships
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                membership: {
                    select: {
                        id: true,
                        planType: true,
                        status: true,
                        paymentStatus: true,
                        totalDays: true,
                        usedDays: true,
                        startDate: true,
                        endDate: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
};

// Get all memberships (with filters)
export const getAllMemberships = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;

        const where = status ? { status: status as string } : {};

        const memberships = await prisma.membership.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ memberships });
    } catch (error) {
        console.error('Get memberships error:', error);
        res.status(500).json({ error: 'Failed to get memberships' });
    }
};

// Activate a membership (PENDING -> ACTIVE)
export const activateMembership = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const membership = await prisma.membership.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!membership) {
            return res.status(404).json({ error: 'Membership not found' });
        }

        if (membership.status === 'ACTIVE') {
            return res.status(400).json({ error: 'Membership is already active' });
        }

        // Generate unique Membership ID
        const { generateMembershipId } = await import('./authController');
        const membershipId = await generateMembershipId();

        // Calculate dates based on plan
        const startDate = new Date();
        const endDate = new Date();
        let yearsToAdd = 1;
        if (membership.planType === '3Y') yearsToAdd = 3;
        else if (membership.planType === '5Y') yearsToAdd = 5;

        endDate.setFullYear(endDate.getFullYear() + yearsToAdd);

        const updatedMembership = await prisma.membership.update({
            where: { id },
            data: {
                membershipId,
                status: 'ACTIVE',
                paymentStatus: 'PAID',
                startDate,
                endDate,
                activatedAt: new Date(),
            } as any
        });

        // Send Email notification with Membership ID
        const { sendMembershipIdEmail } = await import('../services/emailService');
        await sendMembershipIdEmail(
            membership.user.email,
            membership.user.name,
            membershipId,
            membership.planType
        );

        res.json({
            message: 'Membership activated successfully',
            membershipId,
            membership: updatedMembership
        });
    } catch (error) {
        console.error('Activate membership error:', error);
        res.status(500).json({ error: 'Failed to activate membership' });
    }
};

// Reject a membership request
export const rejectMembership = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const membership = await prisma.membership.findUnique({
            where: { id }
        });

        if (!membership) {
            return res.status(404).json({ error: 'Membership not found' });
        }

        // Delete the membership request
        await prisma.membership.delete({
            where: { id }
        });

        res.json({ message: 'Membership request rejected', reason });
    } catch (error) {
        console.error('Reject membership error:', error);
        res.status(500).json({ error: 'Failed to reject membership' });
    }
};

// Extend membership days
export const extendMembership = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { additionalDays, extendEndDate } = req.body;

        const membership = await prisma.membership.findUnique({
            where: { id }
        });

        if (!membership) {
            return res.status(404).json({ error: 'Membership not found' });
        }

        const updateData: any = {};

        if (additionalDays) {
            updateData.totalDays = membership.totalDays + additionalDays;
        }

        if (extendEndDate && membership.endDate) {
            const newEndDate = new Date(membership.endDate);
            newEndDate.setDate(newEndDate.getDate() + extendEndDate);
            updateData.endDate = newEndDate;
        }

        const updatedMembership = await prisma.membership.update({
            where: { id },
            data: updateData
        });

        res.json({
            message: 'Membership extended successfully',
            membership: updatedMembership
        });
    } catch (error) {
        console.error('Extend membership error:', error);
        res.status(500).json({ error: 'Failed to extend membership' });
    }
};

// Get plan configurations
export const getPlanConfigs = async (req: AuthRequest, res: Response) => {
    try {
        let plans = await prisma.planConfig.findMany({
            orderBy: { planType: 'asc' },
            include: { destinations: true }
        });

        // Create default plans if none exist
        if (plans.length === 0) {
            await prisma.planConfig.createMany({
                data: [
                    { planType: '1Y', name: '1-Year Membership', days: 6, price: 9999 },
                    { planType: '3Y', name: '3-Year Membership', days: 18, price: 24999 },
                ]
            });
            plans = await prisma.planConfig.findMany({
                orderBy: { planType: 'asc' },
                include: { destinations: true }
            });
        }

        res.json({ plans });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to get plan configurations' });
    }
};

// Update plan configuration
export const updatePlanConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, days, price, isActive, destinationIds } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (days !== undefined) updateData.days = days;
        if (price !== undefined) updateData.price = price;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (destinationIds !== undefined) updateData.destinationIds = destinationIds;

        const plan = await prisma.planConfig.update({
            where: { id },
            data: updateData,
            include: { destinations: true }
        });

        res.json({ message: 'Plan updated successfully', plan });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({ error: 'Failed to update plan configuration' });
    }
};

// Update membership (Custom overrides)
export const updateMembership = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { customDaysAdded, customDestinationIds } = req.body;

        const updateData: any = {};
        if (customDaysAdded !== undefined) updateData.customDaysAdded = customDaysAdded;
        if (customDestinationIds !== undefined) updateData.customDestinationIds = customDestinationIds;

        const membership = await prisma.membership.update({
            where: { id },
            data: updateData,
            include: { user: true, customDestinations: true }
        });

        res.json({ message: 'Membership updated successfully', membership });
    } catch (error) {
        console.error('Update membership error:', error);
        res.status(500).json({ error: 'Failed to update membership' });
    }
};

// Dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const [
            totalUsers,
            totalMemberships,
            activeMemberships,
            pendingMemberships,
            totalDestinations
        ] = await Promise.all([
            prisma.user.count(),
            prisma.membership.count(),
            prisma.membership.count({ where: { status: 'ACTIVE' } }),
            prisma.membership.count({ where: { status: 'PENDING' } }),
            prisma.destination.count()
        ]);

        res.json({
            stats: {
                totalUsers,
                totalMemberships,
                activeMemberships,
                pendingMemberships,
                totalDestinations
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
};
