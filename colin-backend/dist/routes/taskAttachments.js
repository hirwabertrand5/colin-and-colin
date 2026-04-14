"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const documentController_1 = require("../controllers/documentController");
const taskAttachmentController_1 = require("../controllers/taskAttachmentController");
const router = express_1.default.Router();
router.get('/tasks/:taskId/attachments', authMiddleware_1.authenticate, taskAttachmentController_1.listAttachmentsForTask);
router.post('/tasks/:taskId/attachments', authMiddleware_1.authenticate, documentController_1.upload.single('file'), taskAttachmentController_1.uploadAttachmentToTask);
router.delete('/task-attachments/:attachmentId', authMiddleware_1.authenticate, taskAttachmentController_1.deleteTaskAttachment);
exports.default = router;
//# sourceMappingURL=taskAttachments.js.map