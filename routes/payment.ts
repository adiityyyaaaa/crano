import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory, handlePaymentFailure } from '../controllers/payment';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/create-order', createOrder as any);
router.post('/verify', verifyPayment as any);
router.post('/failure', handlePaymentFailure as any);
router.get('/history/:userId', authenticateToken as any, getPaymentHistory as any);

export default router;
