
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Teacher, Booking } from '../models';
import { getAvailableSlots, getFormattedTimeSlots } from '../services/availability';

export const getAllTeachers = async (req: Request, res: Response): Promise<any> => {
    try {
        const teachers = await Teacher.find().sort({ createdAt: -1 });
        res.json(teachers);
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
};

export const getTeacherById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher' });
    }
};

export const updateTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        const { subject, bio, experience, price, videoUrl, youtubeSubscribers, tags, grades, days, hours } = req.body;

        const teacher = await Teacher.findByIdAndUpdate(
            id,
            { subject, bio, experience, price, videoUrl, youtubeSubscribers, tags, grades, days, hours },
            { new: true, runValidators: true }
        );

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json({ message: 'Teacher profile updated successfully', teacher });
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({ error: 'Failed to update teacher profile' });
    }
};

export const getTeacherAvailability = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        if (!date || typeof date !== 'string') {
            return res.status(400).json({ error: 'Date is required' });
        }

        const availableSlots = await getAvailableSlots(id, date);
        res.json({ date, availableSlots });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
};

export const getTeacherStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Get bookings for this teacher
        const bookings = await Booking.find({
            teacherId: id,
            status: { $in: ['confirmed', 'pending'] }
        });

        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        const totalEarnings = confirmedBookings.reduce((sum, b) => sum + b.price, 0);
        const totalHours = confirmedBookings.length;
        const activeStudents = new Set(confirmedBookings.map(b => b.studentEmail)).size;

        res.json({
            totalEarnings,
            totalHours,
            activeStudents,
            rating: teacher.rating,
            reviews: teacher.reviews,
            upcomingClasses: bookings.filter(b => {
                const bookingDate = new Date(b.date);
                return bookingDate >= new Date() && b.status !== 'cancelled';
            }).length
        });
    } catch (error) {
        console.error('Get teacher stats error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher statistics' });
    }
};
