import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getTasksForCase,
  addTaskToCase,
  updateTask,
  deleteTask,
  submitTaskForApproval,
  approveTask,
  rejectTask,
  getAllTasks,
  getTaskById,
  addChecklistItem,
toggleChecklistItem,
deleteChecklistItem,
getTimeLogsForTask,
addTimeLogToTask,
} from '../controllers/taskController';

const router = express.Router();

router.get('/cases/:caseId/tasks', authenticate, getTasksForCase);
router.post('/cases/:caseId/tasks', authenticate, addTaskToCase);
router.get('/tasks', authenticate, getAllTasks);
router.put('/tasks/:taskId', authenticate, updateTask);
router.delete('/tasks/:taskId', authenticate, deleteTask);
router.get('/tasks/:taskId', authenticate, getTaskById);

router.post('/tasks/:taskId/checklist', authenticate, addChecklistItem);
router.patch('/tasks/:taskId/checklist/:itemId/toggle', authenticate, toggleChecklistItem);
router.delete('/tasks/:taskId/checklist/:itemId', authenticate, deleteChecklistItem);

// approval workflow
router.post('/tasks/:taskId/submit', authenticate, submitTaskForApproval);
router.post('/tasks/:taskId/approve', authenticate, approveTask);
router.post('/tasks/:taskId/reject', authenticate, rejectTask);
router.get('/tasks/:taskId/time-logs', authenticate, getTimeLogsForTask);
router.post('/tasks/:taskId/time-logs', authenticate, addTimeLogToTask);
export default router;