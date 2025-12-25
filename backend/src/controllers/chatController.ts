import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { chatMessageSchema } from '../utils/validators';
import { getAIResponse, getAIResponseStream } from '../services/aiService';
import { checkRateLimit } from '../services/rateLimitService';

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        // Check rate limit (10 messages per minute per user)
        const rateLimit = checkRateLimit(userId);
        if (!rateLimit.allowed) {
            const waitSeconds = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: `Please wait ${waitSeconds} seconds before sending another message`,
                remaining: rateLimit.remaining,
                resetAt: rateLimit.resetAt.toISOString()
            });
        }

        const validation = chatMessageSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors
            });
        }

        const { message } = validation.data;

        // Save user message
        await prisma.chatMessage.create({
            data: {
                userId,
                role: 'user',
                content: message
            }
        });

        // Get user context for AI
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { membership: true }
        });

        // Get available destinations
        const destinations = await prisma.destination.findMany({
            where: { status: 'available' }
        });

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Get AI response stream
        const result = await getAIResponseStream(message, user, destinations);

        let fullResponse = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            // Send chunk to client
            res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
        }

        // Save assistant message
        const assistantMessage = await prisma.chatMessage.create({
            data: {
                userId,
                role: 'assistant',
                content: fullResponse
            }
        });

        // Send final event with message ID and close stream
        res.write(`data: ${JSON.stringify({ done: true, messageId: assistantMessage.id })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Chat error:', error);
        // If headers sent, send error event
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`);
            res.end();
        } else {
            res.status(500).json({ error: 'Failed to process message' });
        }
    }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
    try {
        const messages = await prisma.chatMessage.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'asc' },
            take: 50 // Limit to last 50 messages
        });

        res.json({ messages });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ error: 'Failed to get chat history' });
    }
};

// Clear all chat history for user
export const clearChatHistory = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.chatMessage.deleteMany({
            where: { userId: req.user!.id }
        });

        res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
        console.error('Clear chat history error:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
};
