import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';

/**
 * Send a message
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { receiverId, receiverName, content } = req.body;

        if (!receiverId || !receiverName || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const message = new Message({
            senderId: req.user.userId,
            senderName: req.user.email.split('@')[0], // Use email prefix as name fallback
            senderRole: req.user.role,
            receiverId,
            receiverName,
            content,
            read: false
        });

        await message.save();

        res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

/**
 * Get conversation between two users
 */
export const getConversation = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { otherUserId } = req.params;

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const messages = await Message.find({
            $or: [
                { senderId: req.user.userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: req.user.userId }
            ]
        }).sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { senderId: otherUserId, receiverId: req.user.userId, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
};

/**
 * Get all conversations for a user
 */
export const getConversations = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get unique conversation partners
        const sent = await Message.distinct('receiverId', { senderId: req.user.userId });
        const received = await Message.distinct('senderId', { receiverId: req.user.userId });

        const uniqueUsers = [...new Set([...sent, ...received])];

        // Get last message for each conversation
        const conversations = await Promise.all(
            uniqueUsers.map(async (userId) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: req.user!.userId, receiverId: userId },
                        { senderId: userId, receiverId: req.user!.userId }
                    ]
                }).sort({ createdAt: -1 });

                const unreadCount = await Message.countDocuments({
                    senderId: userId,
                    receiverId: req.user!.userId,
                    read: false
                });

                return {
                    userId,
                    userName: lastMessage?.senderName || 'Unknown',
                    lastMessage: lastMessage?.content || '',
                    lastMessageTime: lastMessage?.createdAt,
                    unreadCount
                };
            })
        );

        res.json(conversations.sort((a, b) =>
            (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)
        ));
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { senderId } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        await Message.updateMany(
            { senderId, receiverId: req.user.userId, read: false },
            { read: true }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};
