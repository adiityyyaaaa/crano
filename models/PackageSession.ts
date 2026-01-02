import mongoose, { Schema, Document } from 'mongoose';

export interface IPackageSession extends Document {
    packageId: string;
    studentId: string;
    teacherId: string;
    scheduledDate: Date;
    scheduledTime: string;
    durationMinutes: number;
    status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'rescheduled';
    meetingLink?: string;
    recordingUrl?: string;
    studentJoined: boolean;
    teacherJoined: boolean;
    actualStartTime?: Date;
    actualEndTime?: Date;
    completedAt?: Date;
    createdAt: Date;
}

const PackageSessionSchema: Schema = new Schema({
    packageId: { type: Schema.Types.ObjectId, ref: 'BookingPackage', required: true },
    studentId: { type: String, required: true },
    teacherId: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'missed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
    },
    meetingLink: { type: String },
    recordingUrl: { type: String },
    studentJoined: { type: Boolean, default: false },
    teacherJoined: { type: Boolean, default: false },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    completedAt: { type: Date }
}, {
    timestamps: true
});

// Indexes for efficient querying
PackageSessionSchema.index({ packageId: 1 });
PackageSessionSchema.index({ scheduledDate: 1, teacherId: 1 });
PackageSessionSchema.index({ studentId: 1, status: 1 });
PackageSessionSchema.index({ teacherId: 1, scheduledDate: 1 });

export const PackageSession = mongoose.model<IPackageSession>('PackageSession', PackageSessionSchema);
