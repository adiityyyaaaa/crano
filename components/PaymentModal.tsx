import React, { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: {
        _id: string;
        teacherName: string;
        subject: string;
        date: string;
        time: string;
        price: number;
        isPackage?: boolean;
        packageType?: 'single' | 'weekly' | 'monthly';
        totalClasses?: number;
        finalPrice?: number;
    };
    onPaymentSuccess: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess, booking }) => {
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    const isPackageBooking = booking.isPackage || false;
    const displayPrice = isPackageBooking ? (booking.finalPrice || booking.price) : booking.price;
    const displayTitle = isPackageBooking
        ? `${booking.packageType?.charAt(0).toUpperCase()}${booking.packageType?.slice(1)} Package`
        : 'Single Class';

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!razorpayLoaded) {
            setError('Payment system is loading. Please wait...');
            return;
        }

        setPaymentStatus('processing');
        setError(null);

        try {
            // Create Razorpay order
            const orderResponse = await fetch(getApiUrl('api/payment/create-order'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: booking._id,
                    amount: displayPrice
                })
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create payment order');
            }

            const orderData = await orderResponse.json();

            // Razorpay options
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Crano Education',
                description: `${displayTitle} - ${booking.subject} with ${booking.teacherName} `,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch(getApiUrl('api/payment/verify'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId: booking._id
                            })
                        });

                        if (!verifyResponse.ok) {
                            throw new Error('Payment verification failed');
                        }

                        setPaymentStatus('success');
                        onPaymentSuccess();
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        setError('Payment verification failed. Please contact support.');
                        setPaymentStatus('failed');
                    }
                },
                prefill: {
                    name: localStorage.getItem('userName') || '',
                    email: localStorage.getItem('userEmail') || '',
                },
                theme: {
                    color: '#2563eb'
                },
                modal: {
                    ondismiss: function () {
                        setPaymentStatus('idle');
                        // Record payment failure
                        fetch(getApiUrl('api/payment/failure'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderId: orderData.orderId,
                                bookingId: booking._id
                            })
                        });
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Payment error:', error);
            setError(error.message || 'Payment failed. Please try again.');
            setPaymentStatus('failed');
        }
    };

    const isProcessing = paymentStatus === 'processing';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-10 pt-12">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="text-blue-600" size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">
                            Complete Payment
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Secure payment powered by Razorpay
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Teacher</span>
                            <span className="font-bold text-slate-900">{booking.teacherName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subject</span>
                            <span className="font-bold text-slate-900">{booking.subject}</span>
                        </div>
                        {isPackageBooking && booking.totalClasses && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Classes</span>
                                <span className="font-bold text-slate-900">{booking.totalClasses} sessions</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">{isPackageBooking ? 'Starts' : 'Date & Time'}</span>
                            <span className="font-bold text-slate-900">{booking.date} • {booking.time}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between">
                            <span className="text-slate-900 font-bold">Total Amount</span>
                            <span className="text-2xl font-black text-blue-600">₹{displayPrice}</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || !razorpayLoaded}
                        className={`w - full bg - blue - 600 text - white py - 4 rounded - xl font - black text - lg hover: bg - blue - 700 transition - all shadow - lg shadow - blue - 100 flex items - center justify - center space - x - 2 ${(isProcessing || !razorpayLoaded) ? 'opacity-80 cursor-not-allowed' : ''
                            } `}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Processing...</span>
                            </>
                        ) : !razorpayLoaded ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                <span>Pay ₹{displayPrice}</span>
                            </>
                        )}
                    </button>

                    <p className="text-xs text-slate-400 text-center mt-6">
                        Your payment is secure and encrypted. We never store your card details.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
