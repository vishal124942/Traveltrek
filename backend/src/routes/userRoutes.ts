import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    updateFcmToken,
    requestProfileChange,
    verifyProfileChange,
    requestPasswordChange,
    verifyPasswordChange
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/fcm-token', updateFcmToken);

// OTP-based profile changes
router.post('/profile/request-change', requestProfileChange);
router.post('/profile/verify-change', verifyProfileChange);

// Password change with OTP
router.post('/password/request-change', requestPasswordChange);
router.post('/password/verify-change', verifyPasswordChange);

export default router;
