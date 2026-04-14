"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const documentController_js_1 = require("../controllers/documentController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
router.get('/cases/:caseId/documents', authMiddleware_js_1.authenticate, documentController_js_1.getDocumentsForCase);
router.post('/cases/:caseId/documents', authMiddleware_js_1.authenticate, documentController_js_1.upload.single('file'), documentController_js_1.addDocumentToCase);
router.delete('/documents/:docId', authMiddleware_js_1.authenticate, documentController_js_1.deleteDocument);
exports.default = router;
//# sourceMappingURL=document.js.map