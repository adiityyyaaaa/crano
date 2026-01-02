import { Request, Response } from 'express';
import { BookingPackage } from '../models/BookingPackage';
import { PackageSession } from '../models/PackageSession';
import { SlotService } from '../services/slotService';
import { PricingService } from '../services/pricingService';
import { AuthRequest } from '../middleware/auth';

/**
 * Check availability for package booking
 */
export const checkAvailability = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { teacherId, slots } = req.body;

        if (!teacherId || !slots || !Array.isArray(slots)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { available, conflicts } = await SlotService.checkMultipleSlots(teacherId, slots);

        res.json({
            available,
            conflicts,
            hasConflicts: conflicts.length > 0
        });
    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({ error: 'Failed to check availability' });
    }
};

/**
 * Create a new package booking
 */
export const createPackage = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const {
            teacherId,
            teacherName,
            subject,
            packageType,
            selectedDays,
            sameTimeDaily,
            defaultStartTime,
            pricePerClass,
            startDate
        } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Validate required fields
        if (!teacherId || !packageType || !selectedDays || !pricePerClass) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate pricing
        const numberOfClasses = selectedDays.length;
        const pricing = PricingService.calculatePackagePrice(packageType, pricePerClass, numberOfClasses);

        // Calculate package duration
        const duration = PricingService.getPackageDuration(packageType);
        const start = new Date(startDate || Date.now());
        const end = new Date(start);
        end.setDate(start.getDate() + duration);

        // Create package
        const bookingPackage = new BookingPackage({
            studentId: req.user.userId,
            studentName: req.user.email.split('@')[0],
            teacherId,
            teacherName,
            subject,
            packageType,
            startDate: start,
            endDate: end,
            totalClasses: pricing.totalClasses,
            pricePerClass: pricing.basePrice,
            totalPrice: pricing.totalPrice,
            discountPercent: pricing.discountPercent,
            finalPrice: pricing.finalPrice,
            sameTimeDaily,
            defaultStartTime,
            selectedDays,
            status: 'active',
            paymentStatus: 'pending'
        });

        await bookingPackage.save();

        // Generate time slots based on package type
        const endTime = SlotService.calculateEndTime(defaultStartTime);
        let slots;

        if (packageType === 'weekly') {
            slots = SlotService.generateWeeklySlots(start, selectedDays, defaultStartTime, endTime);
        } else if (packageType === 'monthly') {
            slots = SlotService.generateMonthlySlots(start, selectedDays, defaultStartTime, endTime);
        } else {
            // Single class
            slots = [{
                date: start.toISOString().split('T')[0],
                time: defaultStartTime,
                endTime
            }];
        }

        // Create individual sessions
        const sessions = await Promise.all(
            slots.map(slot =>
                PackageSession.create({
                    packageId: bookingPackage._id,
                    studentId: req.user!.userId,
                    teacherId,
                    scheduledDate: new Date(slot.date),
                    scheduledTime: slot.time,
                    durationMinutes: 60,
                    status: 'scheduled'
                })
            )
        );

        // Block slots in availability
        await SlotService.blockMultipleSlots(
            teacherId,
            slots,
            req.user.userId,
            req.user.email.split('@')[0],
            sessions
        );

        res.status(201).json({
            message: 'Package created successfully',
            package: bookingPackage,
            sessions,
            pricing
        });
    } catch (error: any) {
        console.error('Create package error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to create package',
            details: error.message
        });
    }
};

/**
 * Get package details
 */
export const getPackage = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { packageId } = req.params;

        const bookingPackage = await BookingPackage.findById(packageId);
        if (!bookingPackage) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const sessions = await PackageSession.find({ packageId }).sort({ scheduledDate: 1 });

        res.json({
            package: bookingPackage,
            sessions
        });
    } catch (error) {
        console.error('Get package error:', error);
        res.status(500).json({ error: 'Failed to fetch package' });
    }
};

/**
 * Get all packages for a student
 */
export const getStudentPackages = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { studentId } = req.params;

        const packages = await BookingPackage.find({ studentId }).sort({ createdAt: -1 });

        res.json(packages);
    } catch (error) {
        console.error('Get student packages error:', error);
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
};

/**
 * Cancel a package
 */
export const cancelPackage = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { packageId } = req.params;

        const bookingPackage = await BookingPackage.findById(packageId);
        if (!bookingPackage) {
            return res.status(404).json({ error: 'Package not found' });
        }

        // Update package status
        bookingPackage.status = 'cancelled';
        await bookingPackage.save();

        // Cancel all future sessions
        const now = new Date();
        await PackageSession.updateMany(
            {
                packageId,
                scheduledDate: { $gte: now },
                status: 'scheduled'
            },
            { status: 'cancelled' }
        );

        // Release future slots
        const futureSessions = await PackageSession.find({
            packageId,
            scheduledDate: { $gte: now },
            status: 'cancelled'
        });

        for (const session of futureSessions) {
            await SlotService.releaseSlot(
                bookingPackage.teacherId,
                session.scheduledDate.toISOString().split('T')[0],
                session.scheduledTime
            );
        }

        res.json({ message: 'Package cancelled successfully' });
    } catch (error) {
        console.error('Cancel package error:', error);
        res.status(500).json({ error: 'Failed to cancel package' });
    }
};

/**
 * Update package payment status
 */
export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { packageId } = req.params;
        const { paymentStatus, razorpayOrderId, razorpayPaymentId } = req.body;

        const bookingPackage = await BookingPackage.findById(packageId);
        if (!bookingPackage) {
            return res.status(404).json({ error: 'Package not found' });
        }

        bookingPackage.paymentStatus = paymentStatus;
        if (razorpayOrderId) bookingPackage.razorpayOrderId = razorpayOrderId;
        if (razorpayPaymentId) bookingPackage.razorpayPaymentId = razorpayPaymentId;

        await bookingPackage.save();

        res.json({ message: 'Payment status updated', package: bookingPackage });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
};
