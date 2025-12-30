
import express from 'express';
import { createBooking, getBookingsByTeacher, getBookingsByStudentName, cancelBooking, updateBookingStatus } from '../controllers/booking';

const router = express.Router();

router.post('/', createBooking as any);
router.get('/student/:studentName', getBookingsByStudentName as any);
router.get('/:teacherId', getBookingsByTeacher as any);
router.patch('/:bookingId/cancel', cancelBooking as any);
router.patch('/:bookingId/status', updateBookingStatus as any);

export default router;
