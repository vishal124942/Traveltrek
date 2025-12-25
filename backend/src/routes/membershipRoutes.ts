import { Router } from 'express';
import { enrollMembership, getMembership, choosePlan, getPlans, markPaymentDone, cancelMembership } from '../controllers/membershipController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public route - no auth required (for website Join form)
router.post('/enroll', enrollMembership);

// Public route - for plan selection display
router.get('/plans', getPlans);

// All routes below require authentication
router.use(authMiddleware);

// Get user's membership
router.get('/', getMembership);

// Choose a plan (creates PENDING membership)
router.post('/choose-plan', choosePlan);

// Cancel pending membership
router.post('/cancel', cancelMembership);

// Mark payment as done (manual flow)
router.post('/payment-done', markPaymentDone);

export default router;
