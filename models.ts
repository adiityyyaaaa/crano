
import mongoose, { Schema, Document } from 'mongoose';

// --- User Schema ---
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);

// --- Booking Schema ---
export interface IBooking extends Document {
  teacherId: string;
  teacherName: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  date: string;
  time: string;
  price: number;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

// --- Teacher Schema ---
export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  subject2?: string;
  subject3?: string;
  bio: string;
  experience: string;
  price: number;
  avatar?: string;
  videoUrl?: string;
  youtubeSubscribers?: string;
  isVerified: boolean;
  tags: string[];
  grades?: string[];
  days?: string[];
  hours?: string[];
  rating: number;
  reviews: number;
  createdAt: Date;
}

const TeacherSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  subject2: { type: String },
  subject3: { type: String },
  bio: { type: String, required: true },
  experience: { type: String, required: true },
  price: { type: Number, required: true },
  avatar: { type: String },
  videoUrl: { type: String },
  youtubeSubscribers: { type: String },
  isVerified: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  grades: { type: [String], default: [] },
  days: { type: [String], default: [] },
  hours: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);

// --- Payment Schema ---
export interface IPayment extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  bookingId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  createdAt: { type: Date, default: Date.now }
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
