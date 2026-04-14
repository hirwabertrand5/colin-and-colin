"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentAuditFeed = void 0;
const auditLogModel_1 = __importDefault(require("../models/auditLogModel"));
const caseModel_1 = __importDefault(require("../models/caseModel"));
// GET /api/audit/recent?limit=20
const getRecentAuditFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const logs = yield auditLogModel_1.default.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        const caseIds = Array.from(new Set(logs.map((l) => String(l.caseId))));
        const cases = yield caseModel_1.default.find({ _id: { $in: caseIds } })
            .select('_id caseNo parties')
            .lean();
        const caseMap = new Map(cases.map((c) => [String(c._id), c]));
        res.json(logs.map((l) => {
            const c = caseMap.get(String(l.caseId));
            return Object.assign(Object.assign({}, l), { case: c ? { _id: String(c._id), caseNo: c.caseNo, parties: c.parties } : null });
        }));
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to fetch audit feed.' });
    }
});
exports.getRecentAuditFeed = getRecentAuditFeed;
//# sourceMappingURL=auditFeedController.js.map