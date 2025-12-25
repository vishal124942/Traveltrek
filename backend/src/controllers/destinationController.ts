import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllDestinations = async (req: Request, res: Response) => {
    try {
        const destinations = await prisma.destination.findMany({
            orderBy: { name: 'asc' }
        });

        // Parse bestMonths from JSON string
        const formattedDestinations = destinations.map(dest => ({
            ...dest,
            bestMonths: JSON.parse(dest.bestMonths)
        }));

        res.json({ destinations: formattedDestinations });
    } catch (error) {
        console.error('Get destinations error:', error);
        res.status(500).json({ error: 'Failed to get destinations' });
    }
};

export const getDestinationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const destination = await prisma.destination.findUnique({
            where: { id }
        });

        if (!destination) {
            return res.status(404).json({ error: 'Destination not found' });
        }

        res.json({
            destination: {
                ...destination,
                bestMonths: JSON.parse(destination.bestMonths)
            }
        });
    } catch (error) {
        console.error('Get destination error:', error);
        res.status(500).json({ error: 'Failed to get destination' });
    }
};

// Admin CRUD operations
export const createDestination = async (req: Request, res: Response) => {
    try {
        const { name, description, durationDays, bestMonths, difficulty, status, imageUrl } = req.body;

        const destination = await prisma.destination.create({
            data: {
                name,
                description,
                durationDays,
                bestMonths: JSON.stringify(bestMonths),
                difficulty,
                status: status || 'available',
                imageUrl
            }
        });

        res.status(201).json({
            message: 'Destination created successfully',
            destination: {
                ...destination,
                bestMonths: JSON.parse(destination.bestMonths)
            }
        });
    } catch (error) {
        console.error('Create destination error:', error);
        res.status(500).json({ error: 'Failed to create destination' });
    }
};

export const updateDestination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, durationDays, bestMonths, difficulty, status, imageUrl } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (durationDays !== undefined) updateData.durationDays = durationDays;
        if (bestMonths !== undefined) updateData.bestMonths = JSON.stringify(bestMonths);
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (status !== undefined) updateData.status = status;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

        const destination = await prisma.destination.update({
            where: { id },
            data: updateData
        });

        res.json({
            message: 'Destination updated successfully',
            destination: {
                ...destination,
                bestMonths: JSON.parse(destination.bestMonths)
            }
        });
    } catch (error) {
        console.error('Update destination error:', error);
        res.status(500).json({ error: 'Failed to update destination' });
    }
};

export const deleteDestination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.destination.delete({
            where: { id }
        });

        res.json({ message: 'Destination deleted successfully' });
    } catch (error) {
        console.error('Delete destination error:', error);
        res.status(500).json({ error: 'Failed to delete destination' });
    }
};
