import { Router } from 'express';
import { getAllDestinations, getDestinationById } from '../controllers/destinationController';

const router = Router();

// Public routes - no auth required
router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);

export default router;
