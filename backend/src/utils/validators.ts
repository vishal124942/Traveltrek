import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional()
});

export const fcmTokenSchema = z.object({
    fcmToken: z.string().min(1, 'FCM token is required')
});

export const chatMessageSchema = z.object({
    message: z.string().min(1, 'Message cannot be empty')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type FcmTokenInput = z.infer<typeof fcmTokenSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
