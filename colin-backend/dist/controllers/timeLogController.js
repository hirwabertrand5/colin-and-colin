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
exports.getMyTimeLogSummary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const taskTimeLogModel_1 = __importDefault(require("../models/taskTimeLogModel"));
const getMyTimeLogSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res.status(401).json({ message: 'Unauthorized.' });
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({ message: 'from and to are required (YYYY-MM-DD).' });
        }
        const fromDate = new Date(String(from));
        const toDate = new Date(String(to));
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({ message: 'Invalid from/to dates.' });
        }
        // make "to" inclusive
        toDate.setHours(23, 59, 59, 999);
        const userObjectId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const agg = yield taskTimeLogModel_1.default.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    loggedAt: { $gte: fromDate, $lte: toDate },
                },
            },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: '$hours' },
                },
            },
        ]);
        const totalHours = ((_b = agg === null || agg === void 0 ? void 0 : agg[0]) === null || _b === void 0 ? void 0 : _b.totalHours) ? Number(agg[0].totalHours) : 0;
        res.json({ totalHours: Math.round(totalHours * 10) / 10 });
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to compute time log summary.' });
    }
});
exports.getMyTimeLogSummary = getMyTimeLogSummary;
//# sourceMappingURL=timeLogController.js.map