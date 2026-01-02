import mongoose, { Schema, Document } from 'mongoose';

export interface ISlotAvailability extends Document {
    teacherId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    bookedByStudentId?: string;
    bookedByStudentName?: string;
    bookingId?: string;
    packageSessionId?: string;
    bookingType: 'single' | 'package';
    createdAt: Date;
}

const SlotAvailabilitySchema: Schema = new Schema({
    teacherId: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    bookedByStudentId: { type: String },
    bookedByStudentName: { type: String },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    packageSessionId: { type: Schema.Types.ObjectId, ref: 'PackageSession' },
    bookingType: { type: String, enum: ['single', 'package'], default: 'single' }
}, {
    timestamps: true
});

// Unique constraint to prevent double booking
SlotAvailabilitySchema.index({ teacherId: 1, date: 1, startTime: 1 }, { unique: true });

// Indexes for efficient querying
SlotAvailabilitySchema.index({ teacherId: 1, date: 1, isAvailable: 1 });
SlotAvailabilitySchema.index({ bookedByStudentId: 1 });

export const SlotAvailability = mongoose.model<ISlotAvailability>('SlotAvailability', SlotAvailabilitySchema);
