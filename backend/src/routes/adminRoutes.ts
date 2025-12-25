import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { opsMiddleware, supportMiddleware } from '../middleware/adminMiddleware';
import {
    getAllUsers,
    getAllMemberships,
    activateMembership,
    rejectMembership,
    extendMembership,
    getPlanConfigs,
    updatePlanConfig,
    updateMembership,
    getDashboardStats
} from '../controllers/adminController';
import {
    getAllDestinations,
    createDestination,
    updateDestination,
    deleteDestination
} from '../controllers/destinationController';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

// Dashboard stats - all admin roles
router.get('/stats', supportMiddleware, getDashboardStats);

// User management - support can view
router.get('/users', supportMiddleware, getAllUsers);

// Membership management - ops can manage
router.get('/memberships', supportMiddleware, getAllMemberships);
router.post('/memberships/:id/activate', opsMiddleware, activateMembership);
router.post('/memberships/:id/reject', opsMiddleware, rejectMembership);
router.post('/memberships/:id/extend', opsMiddleware, extendMembership);

// Plan configuration - ops can manage
router.get('/plans', supportMiddleware, getPlanConfigs);
router.put('/plans/:id', opsMiddleware, updatePlanConfig);

// User membership customization - ops can manage
router.put('/users/:id/membership', opsMiddleware, updateMembership);

// Destination management - ops can manage
router.get('/destinations', supportMiddleware, getAllDestinations);
router.post('/destinations', opsMiddleware, createDestination);
router.put('/destinations/:id', opsMiddleware, updateDestination);
router.delete('/destinations/:id', opsMiddleware, deleteDestination);

export default router;
