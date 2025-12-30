
import express from 'express';
import { register, login, logout } from '../controllers/auth';

const router = express.Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/logout', logout as any);

export default router;
