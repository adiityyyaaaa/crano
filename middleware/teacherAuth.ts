import { Response, NextFunction } from 'express';
import { Teacher } from '../models';
import { AuthRequest } from './auth';

/**
 * Middleware to verify user is a registered teacher
 */
export const verifyTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user has a teacher profile
        const teacher = await Teacher.findOne({ userId: req.user.userId });

        if (!teacher) {
            return res.status(403).json({
                error: 'Teacher profile required',
                message: 'You need to create a teacher profile to access this feature'
            });
        }

        // Attach teacher data to request for use in route handlers
        (req as any).teacher = teacher;
        next();
    } catch (error) {
        console.error('Teacher verification error:', error);
        res.status(500).json({ error: 'Failed to verify teacher status' });
    }
};
