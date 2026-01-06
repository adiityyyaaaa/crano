import { Teacher, Booking } from '../models.js';

export interface TimeSlot {
    hour: string;
    available: boolean;
}

/**
 * Check if a teacher is available on a specific date and time
 */
export const isTeacherAvailable = async (
    teacherId: string,
    date: string,
    time: string
): Promise<boolean> => {
    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return false;
        }

        // Check if the day is in teacher's available days
        const requestedDate = new Date(date);
        const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'short' });

        if (!teacher.days || !teacher.days.includes(dayName)) {
            return false;
        }

        // Check if the time slot is in teacher's available hours
        if (!teacher.hours || teacher.hours.length === 0) {
            return true; // If no specific hours set, assume all hours are available
        }

        // Check if there's already a booking for this slot
        const existingBooking = await Booking.findOne({
            teacherId,
            date,
            time,
            status: { $in: ['pending', 'confirmed'] }
        });

        return !existingBooking;
    } catch (error) {
        console.error('Error checking availability:', error);
        return false;
    }
};

/**
 * Get all available time slots for a teacher on a specific date
 */
export const getAvailableSlots = async (
    teacherId: string,
    date: string
): Promise<string[]> => {
    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return [];
        }

        const requestedDate = new Date(date);
        const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'short' });

        if (!teacher.days || !teacher.days.includes(dayName)) {
            return [];
        }

        // Get all bookings for this teacher on this date
        const bookings = await Booking.find({
            teacherId,
            date,
            status: { $in: ['pending', 'confirmed'] }
        });

        const bookedTimes = bookings.map(b => b.time);

        // If teacher has specific hours, use those; otherwise use default slots
        const availableHours = teacher.hours && teacher.hours.length > 0
            ? teacher.hours
            : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

        // Filter out booked slots
        return availableHours.filter(hour => !bookedTimes.includes(hour));
    } catch (error) {
        console.error('Error getting available slots:', error);
        return [];
    }
};

/**
 * Convert hour range format (e.g., "9-10") to display format (e.g., "09:00 AM")
 */
export const formatHourRange = (hourRange: string): string => {
    const [start] = hourRange.split('-').map(h => parseInt(h));
    const hour = start % 12 || 12;
    const period = start < 12 ? 'AM' : 'PM';
    return `${hour.toString().padStart(2, '0')}:00 ${period}`;
};

/**
 * Get formatted time slots from teacher's hours array
 */
export const getFormattedTimeSlots = (hours: string[]): string[] => {
    return hours.map(formatHourRange);
};
