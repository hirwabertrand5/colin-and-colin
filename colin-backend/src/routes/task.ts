import express from 'express';
import { getTasksForCase, addTaskToCase } from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { updateTask, deleteTask } from '../controllers/taskController.js';
const router = express.Router();

router.get('/cases/:caseId/tasks', authenticate, getTasksForCase);
router.post('/cases/:caseId/tasks', authenticate, addTaskToCase);
router.put('/tasks/:taskId', authenticate, updateTask);
router.delete('/tasks/:taskId', authenticate, deleteTask);

export default router;