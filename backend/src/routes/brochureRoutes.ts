import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { opsMiddleware, supportMiddleware } from '../middleware/adminMiddleware';
import {
    getAllBrochures,
    createBrochure,
    deleteBrochure
} from '../controllers/brochureController';

const router = Router();

router.use(authMiddleware);

router.get('/', supportMiddleware, getAllBrochures);
router.post('/', opsMiddleware, createBrochure);
router.delete('/:id', opsMiddleware, deleteBrochure);

export default router;
