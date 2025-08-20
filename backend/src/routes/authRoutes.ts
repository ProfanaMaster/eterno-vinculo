import { Router } from 'express';
import { register, login, logout, getProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', requireAuth, getProfile);

export default router;