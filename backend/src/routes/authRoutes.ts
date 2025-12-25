import { Router } from 'express';
import { register, login, memberLogin, forgotPassword, resetPassword, googleAuth } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/member-login', memberLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

export default router;
