"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const caseController_js_1 = require("../controllers/caseController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
/**
 * ✅ Option 2:
 * - MD + Exec: full CRUD
 * - Associate: can GET only their assigned cases (controller enforces)
 */
router.get('/', authMiddleware_js_1.authenticate, caseController_js_1.getAllCases);
router.get('/:id', authMiddleware_js_1.authenticate, caseController_js_1.getCaseById);
router.post('/', authMiddleware_js_1.authenticate, caseController_js_1.createCase);
router.put('/:id', authMiddleware_js_1.authenticate, caseController_js_1.updateCase);
router.delete('/:id', authMiddleware_js_1.authenticate, caseController_js_1.deleteCase);
exports.default = router;
//# sourceMappingURL=case.js.map