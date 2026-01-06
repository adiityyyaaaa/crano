
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models.js';
import { isTeacherAvailable } from '../services/availability.js';

export const createBooking = async (req: Request, res: Response): Promise<any> => {
  const { teacherId, teacherName, studentName, studentEmail, subject, date, time, price } = req.body;

  // Comprehensive validation
  if (!teacherId || !studentName || !studentEmail || !date || !time) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }

  if (!teacherName || !subject || !price) {
    return res.status(400).json({ error: 'Missing teacher name, subject, or price' });
  }

  // Validate teacherId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return res.status(400).json({ error: 'Invalid teacher ID' });
  }

  // Validate price is a positive number
  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(studentEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Check if teacher is available for this slot
    const available = await isTeacherAvailable(teacherId, date, time);
    if (!available) {
      return res.status(409).json({
        error: 'This time slot is not available. Please choose another time.'
      });
    }

    const newBooking = new Booking({
      teacherId,
      teacherName,
      studentName,
      studentEmail,
      subject,
      date,
      time,
      price: numPrice,
      status: 'pending' // Will be confirmed after payment
    });

    await newBooking.save();
    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Server error during booking process' });
  }
};

export const getBookingsByTeacher = async (req: Request, res: Response): Promise<any> => {
  try {
    const { teacherId } = req.params;

    // Validate teacherId
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    const bookings = await Booking.find({ teacherId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingsByStudentName = async (req: Request, res: Response): Promise<any> => {
  try {
    const { studentName } = req.params;
    const bookings = await Booking.find({ studentName }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Fetch student bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch student bookings' });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};
