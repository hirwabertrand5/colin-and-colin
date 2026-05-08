"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const taskController_1 = require("../controllers/taskController");
const router = express_1.default.Router();
const TASK_ASSIGN_ROLES = ['managing_director', 'executive_assistant', 'associate'];
router.get('/cases/:caseId/tasks', authMiddleware_1.authenticate, taskController_1.getTasksForCase);
router.post('/cases/:caseId/tasks', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(TASK_ASSIGN_ROLES), taskController_1.addTaskToCase);
router.get('/tasks', authMiddleware_1.authenticate, taskController_1.getAllTasks);
router.get('/tasks/:taskId', authMiddleware_1.authenticate, taskController_1.getTaskById);
router.put('/tasks/:taskId', authMiddleware_1.authenticate, taskController_1.updateTask);
router.delete('/tasks/:taskId', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(TASK_ASSIGN_ROLES), taskController_1.deleteTask);
// checklist
router.post('/tasks/:taskId/checklist', authMiddleware_1.authenticate, taskController_1.addChecklistItem);
router.patch('/tasks/:taskId/checklist/:itemId/toggle', authMiddleware_1.authenticate, taskController_1.toggleChecklistItem);
router.delete('/tasks/:taskId/checklist/:itemId', authMiddleware_1.authenticate, taskController_1.deleteChecklistItem);
// approval workflow
router.post('/tasks/:taskId/submit', authMiddleware_1.authenticate, taskController_1.submitTaskForApproval);
router.post('/tasks/:taskId/approve', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['managing_director']), taskController_1.approveTask);
router.post('/tasks/:taskId/reject', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['managing_director']), taskController_1.rejectTask);
// time logs
router.get('/tasks/:taskId/time-logs', authMiddleware_1.authenticate, taskController_1.getTimeLogsForTask);
router.post('/tasks/:taskId/time-logs', authMiddleware_1.authenticate, taskController_1.addTimeLogToTask);
exports.default = router;
//# sourceMappingURL=task.js.map