import { Request, Response } from 'express';
import { Payment, Booking } from '../models';
import { BookingPackage } from '../models/BookingPackage';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a Razorpay order for booking payment
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ error: 'Booking ID and amount are required' });
        }

        // Try to find either a regular booking or a package booking
        let booking = await Booking.findById(bookingId);
        let bookingPackage = null;
        let studentEmail = '';
        let studentName = '';

        if (!booking) {
            // Check if it's a package booking
            bookingPackage = await BookingPackage.findById(bookingId);
            if (!bookingPackage) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            studentEmail = bookingPackage.studentId;
            studentName = bookingPackage.studentName;
        } else {
            studentEmail = booking.studentEmail;
            studentName = booking.studentName;
        }

        // Create Razorpay order
        const order = await createRazorpayOrder(
            amount,
            'INR',
            `booking_${bookingId}`
        );

        // Save payment record
        const payment = new Payment({
            userId: req.user?.userId || studentEmail,
            userName: studentName,
            userEmail: studentEmail,
            bookingId,
            razorpayOrderId: order.id,
            amount,
            currency: 'INR',
            status: 'created'
        });

        await payment.save();

        // Update booking or package with order ID
        if (booking) {
            booking.razorpayOrderId = order.id;
            booking.status = 'pending';
            await booking.save();
        } else if (bookingPackage) {
            bookingPackage.razorpayOrderId = order.id;
            bookingPackage.paymentStatus = 'pending';
            await bookingPackage.save();
        }

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification details' });
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Update payment record
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (payment) {
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'paid';
            await payment.save();
        }

        // Try to update booking or package
        let booking = await Booking.findById(bookingId);
        let bookingPackage = null;

        if (booking) {
            booking.razorpayPaymentId = razorpay_payment_id;
            booking.razorpaySignature = razorpay_signature;
            booking.status = 'confirmed';
            await booking.save();
        } else {
            bookingPackage = await BookingPackage.findById(bookingId);
            if (bookingPackage) {
                bookingPackage.razorpayPaymentId = razorpay_payment_id;
                bookingPackage.razorpaySignature = razorpay_signature;
                bookingPackage.paymentStatus = 'paid';
                await bookingPackage.save();
            }
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            booking: booking || bookingPackage
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

/**
 * Get payment history for a user
 */
export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { userId } = req.params;

        const payments = await Payment.find({ userId })
            .populate('bookingId')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = async (req: Request, res: Response): Promise<any> => {
    try {
        const { orderId, bookingId } = req.body;

        // Update payment status
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment) {
            payment.status = 'failed';
            await payment.save();
        }

        // Try to update booking or package status
        let booking = await Booking.findById(bookingId);
        let bookingPackage = null;

        if (booking) {
            booking.status = 'cancelled';
            await booking.save();
        } else {
            bookingPackage = await BookingPackage.findById(bookingId);
            if (bookingPackage) {
                bookingPackage.paymentStatus = 'failed';
                await bookingPackage.save();
            }
        }

        res.json({ message: 'Payment failure recorded' });
    } catch (error) {
        console.error('Handle payment failure error:', error);
        res.status(500).json({ error: 'Failed to handle payment failure' });
    }
};
