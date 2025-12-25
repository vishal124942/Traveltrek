import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';

// Get all brochures
export const getAllBrochures = async (req: AuthRequest, res: Response) => {
    try {
        const brochures = await prisma.brochure.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ brochures });
    } catch (error) {
        console.error('Get brochures error:', error);
        res.status(500).json({ error: 'Failed to get brochures' });
    }
};

// Create a brochure
export const createBrochure = async (req: AuthRequest, res: Response) => {
    try {
        const { title, url } = req.body;

        if (!title || !url) {
            return res.status(400).json({ error: 'Title and URL are required' });
        }

        const brochure = await prisma.brochure.create({
            data: { title, url }
        });

        res.status(201).json({ message: 'Brochure created successfully', brochure });
    } catch (error) {
        console.error('Create brochure error:', error);
        res.status(500).json({ error: 'Failed to create brochure' });
    }
};

// Delete a brochure
export const deleteBrochure = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.brochure.delete({
            where: { id }
        });

        res.json({ message: 'Brochure deleted successfully' });
    } catch (error) {
        console.error('Delete brochure error:', error);
        res.status(500).json({ error: 'Failed to delete brochure' });
    }
};
