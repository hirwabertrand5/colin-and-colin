"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const firmReportsController_1 = require("../controllers/firmReportsController");
const router = express_1.default.Router();
router.get('/reports/firm', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['managing_director']), firmReportsController_1.getFirmReports);
exports.default = router;
//# sourceMappingURL=firmReports.js.map