import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingPackage extends Document {
    studentId: string;
    studentName: string;
    teacherId: string;
    teacherName: string;
    subject: string;
    packageType: 'single' | 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    totalClasses: number;
    pricePerClass: number;
    totalPrice: number;
    discountPercent: number;
    finalPrice: number;
    sameTimeDaily: boolean;
    defaultStartTime?: string;
    selectedDays: string[]; // ['Mon', 'Tue', 'Wed', etc.]
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingPackageSchema: Schema = new Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    teacherId: { type: String, required: true },
    teacherName: { type: String, required: true },
    subject: { type: String, required: true },
    packageType: {
        type: String,
        enum: ['single', 'weekly', 'monthly'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalClasses: { type: Number, required: true },
    pricePerClass: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true },
    sameTimeDaily: { type: Boolean, default: true },
    defaultStartTime: { type: String },
    selectedDays: [{ type: String }],
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'cancelled'],
        default: 'active'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String }
}, {
    timestamps: true
});

// Indexes for performance
BookingPackageSchema.index({ studentId: 1, status: 1 });
BookingPackageSchema.index({ teacherId: 1, status: 1 });
BookingPackageSchema.index({ startDate: 1, endDate: 1 });

export const BookingPackage = mongoose.model<IBookingPackage>('BookingPackage', BookingPackageSchema);
