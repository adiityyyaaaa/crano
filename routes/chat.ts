import express from 'express';
import { sendMessage, getConversation, getConversations, markAsRead } from '../controllers/chat.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', authenticateToken as any, sendMessage as any);
router.get('/conversation/:otherUserId', authenticateToken as any, getConversation as any);
router.get('/conversations', authenticateToken as any, getConversations as any);
router.post('/mark-read', authenticateToken as any, markAsRead as any);

export default router;
