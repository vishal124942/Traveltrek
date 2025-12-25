import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

// Roles that have admin access
const ADMIN_ROLES = ['ADMIN', 'OPS', 'SUPPORT'];

export const adminMiddleware = (allowedRoles?: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role || 'USER';
        const roles = allowedRoles || ADMIN_ROLES;

        console.log('AdminMiddleware Debug:', {
            userId: req.user.id,
            userRole,
            allowedRoles: roles,
            hasAccess: roles.includes(userRole)
        });

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                error: 'Access denied. Admin privileges required.',
                debug: { userRole, allowedRoles: roles } // Return debug info to client
            });
        }

        next();
    };
};

// Full admin access (ADMIN only)
export const adminOnlyMiddleware = adminMiddleware(['ADMIN']);

// Operations access (ADMIN + OPS)
export const opsMiddleware = adminMiddleware(['ADMIN', 'OPS']);

// Support access (ADMIN + OPS + SUPPORT) - read mostly
export const supportMiddleware = adminMiddleware(['ADMIN', 'OPS', 'SUPPORT']);
