import Razorpay from 'razorpay';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance: Razorpay | null = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
} else {
    console.warn('⚠️  Razorpay credentials not configured. Payment features will not work.');
}

export { razorpayInstance };

export const createRazorpayOrder = async (amount: number, currency: string = 'INR', receipt: string) => {
    if (!razorpayInstance) {
        throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.');
    }

    try {
        const order = await razorpayInstance.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
            receipt,
        });
        return order;
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw error;
    }
};

export const verifyRazorpaySignature = (
    orderId: string,
    paymentId: string,
    signature: string
): boolean => {
    if (!RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay secret key not configured');
    }

    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

    return generated_signature === signature;
};
