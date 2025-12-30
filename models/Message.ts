import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    senderId: string;
    senderName: string;
    senderRole: 'student' | 'teacher';
    receiverId: string;
    receiverName: string;
    content: string;
    read: boolean;
    createdAt: Date;
}

const MessageSchema: Schema = new Schema({
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['student', 'teacher'], required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
