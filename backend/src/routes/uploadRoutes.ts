import { Router } from 'express';
import { upload, uploadFile } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Only admins/ops/support can upload files
router.post('/', authMiddleware, adminMiddleware(), upload.single('file'), uploadFile);

export default router;
