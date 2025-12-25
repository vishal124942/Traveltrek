import { Router } from 'express';
import { register, login, memberLogin, setMemberPassword, forgotPassword, resetPassword, googleAuth } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/member-login', memberLogin);
router.post('/set-password', setMemberPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

export default router;
