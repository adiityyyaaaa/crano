
import express from 'express';
import { getAllTeachers, getTeacherById, updateTeacher, getTeacherAvailability, getTeacherStats } from '../controllers/teacher';

const router = express.Router();

router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.get('/:id/availability', getTeacherAvailability);
router.get('/:id/stats', getTeacherStats);

export default router;
