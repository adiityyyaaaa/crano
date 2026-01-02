import express from 'express';
import {
    checkAvailability,
    createPackage,
    getPackage,
    getStudentPackages,
    cancelPackage,
    updatePaymentStatus
} from '../controllers/package';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Check slot availability
router.post('/check-availability', authenticateToken as any, checkAvailability as any);

// Create new package
router.post('/create', authenticateToken as any, createPackage as any);

// Get package details
router.get('/:packageId', authenticateToken as any, getPackage as any);

// Get all packages for a student
router.get('/student/:studentId', authenticateToken as any, getStudentPackages as any);

// Cancel package
router.delete('/:packageId/cancel', authenticateToken as any, cancelPackage as any);

// Update payment status
router.patch('/:packageId/payment', authenticateToken as any, updatePaymentStatus as any);

export default router;
