/**
 * Slot Service for Managing Teacher Availability
 * Handles slot booking, checking, and conflict detection
 */

import { SlotAvailability } from '../models/SlotAvailability.js';
import { PackageSession } from '../models/PackageSession.js';

interface TimeSlot {
    date: string;
    time: string;
    endTime: string;
}

interface ConflictInfo {
    slot: TimeSlot;
    reason: string;
    alternatives: string[];
}

export class SlotService {
    /**
     * Check if a specific slot is available
     */
    static async checkSlotAvailability(
        teacherId: string,
        date: string,
        startTime: string
    ): Promise<boolean> {
        const slot = await SlotAvailability.findOne({
            teacherId,
            date: new Date(date),
            startTime
        });

        return slot ? slot.isAvailable : true;
    }

    /**
     * Check multiple slots for availability
     */
    static async checkMultipleSlots(
        teacherId: string,
        slots: TimeSlot[]
    ): Promise<{ available: TimeSlot[]; conflicts: ConflictInfo[] }> {
        const available: TimeSlot[] = [];
        const conflicts: ConflictInfo[] = [];

        for (const slot of slots) {
            const isAvailable = await this.checkSlotAvailability(teacherId, slot.date, slot.time);

            if (isAvailable) {
                available.push(slot);
            } else {
                const alternatives = await this.findAlternativeSlots(teacherId, slot.date, slot.time);
                conflicts.push({
                    slot,
                    reason: 'Already booked',
                    alternatives
                });
            }
        }

        return { available, conflicts };
    }

    /**
     * Block a slot for booking
     */
    static async blockSlot(
        teacherId: string,
        date: string,
        startTime: string,
        endTime: string,
        studentId: string,
        studentName: string,
        bookingId?: string,
        packageSessionId?: string
    ): Promise<void> {
        await SlotAvailability.create({
            teacherId,
            date: new Date(date),
            startTime,
            endTime,
            isAvailable: false,
            bookedByStudentId: studentId,
            bookedByStudentName: studentName,
            bookingId,
            packageSessionId,
            bookingType: packageSessionId ? 'package' : 'single'
        });
    }

    /**
     * Block multiple slots (for package bookings)
     */
    static async blockMultipleSlots(
        teacherId: string,
        slots: TimeSlot[],
        studentId: string,
        studentName: string,
        sessions: any[]
    ): Promise<void> {
        const promises = slots.map((slot, index) =>
            this.blockSlot(
                teacherId,
                slot.date,
                slot.time,
                slot.endTime,
                studentId,
                studentName,
                undefined,
                sessions[index]?._id
            )
        );

        await Promise.all(promises);
    }

    /**
     * Release a slot (for cancellations)
     */
    static async releaseSlot(teacherId: string, date: string, startTime: string): Promise<void> {
        await SlotAvailability.deleteOne({
            teacherId,
            date: new Date(date),
            startTime
        });
    }

    /**
     * Release multiple slots
     */
    static async releaseMultipleSlots(slotIds: string[]): Promise<void> {
        await SlotAvailability.deleteMany({
            _id: { $in: slotIds }
        });
    }

    /**
     * Find alternative time slots
     */
    static async findAlternativeSlots(
        teacherId: string,
        date: string,
        requestedTime: string
    ): Promise<string[]> {
        // Get all booked slots for this teacher on this date
        const bookedSlots = await SlotAvailability.find({
            teacherId,
            date: new Date(date),
            isAvailable: false
        }).select('startTime');

        const bookedTimes = bookedSlots.map(slot => slot.startTime);

        // Common time slots (you can customize based on teacher's availability)
        const commonSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
            '06:00 PM', '07:00 PM', '08:00 PM'
        ];

        // Filter out booked slots and the requested time
        const alternatives = commonSlots.filter(
            slot => !bookedTimes.includes(slot) && slot !== requestedTime
        );

        return alternatives.slice(0, 3); // Return top 3 alternatives
    }

    /**
     * Generate weekly slots for package booking
     */
    static generateWeeklySlots(
        startDate: Date,
        selectedDays: string[],
        time: string,
        endTime: string
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];
        const dayMap: { [key: string]: number } = {
            'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
        };

        // Generate slots for 7 days
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });

            if (selectedDays.includes(dayName)) {
                slots.push({
                    date: currentDate.toISOString().split('T')[0],
                    time,
                    endTime
                });
            }
        }

        return slots;
    }

    /**
     * Generate monthly slots for package booking
     */
    static generateMonthlySlots(
        startDate: Date,
        selectedDays: string[],
        time: string,
        endTime: string
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];

        // Generate slots for 30 days
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });

            if (selectedDays.includes(dayName)) {
                slots.push({
                    date: currentDate.toISOString().split('T')[0],
                    time,
                    endTime
                });
            }
        }

        return slots;
    }

    /**
     * Calculate end time from start time (add 1 hour)
     */
    static calculateEndTime(startTime: string): string {
        // Validate input
        if (!startTime || typeof startTime !== 'string') {
            console.error('Invalid startTime provided to calculateEndTime:', startTime);
            return '11:00 AM'; // Default fallback
        }

        const parts = startTime.split(' ');
        if (parts.length !== 2) {
            console.error('Invalid time format (expected "HH:MM AM/PM"):', startTime);
            return '11:00 AM'; // Default fallback
        }

        const [time, period] = parts;
        const timeParts = time.split(':');

        if (timeParts.length !== 2) {
            console.error('Invalid time format (expected "HH:MM"):', time);
            return '11:00 AM'; // Default fallback
        }

        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);

        // Validate parsed values
        if (isNaN(hours) || isNaN(minutes)) {
            console.error('Invalid hours or minutes:', { hours, minutes, startTime });
            return '11:00 AM'; // Default fallback
        }

        let endHour = hours + 1;
        let endPeriod = period;

        if (endHour === 12 && period === 'AM') {
            endPeriod = 'PM';
        } else if (endHour > 12) {
            endHour = endHour - 12;
        }

        return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${endPeriod}`;
    }
}

export default SlotService;
