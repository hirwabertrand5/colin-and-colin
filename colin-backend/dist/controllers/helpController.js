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
exports.listHelpFaqs = exports.getHelpArticleById = exports.listHelpArticles = exports.listHelpCategories = void 0;
const helpArticleModel_1 = __importDefault(require("../models/helpArticleModel"));
const helpFaqModel_1 = __importDefault(require("../models/helpFaqModel"));
const DEFAULT_CATEGORIES = [
    { id: 'all', label: 'All Topics' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'cases', label: 'Case Management' },
    { id: 'tasks', label: 'Tasks & Workflows' },
    { id: 'billing', label: 'Billing & Invoices' },
];
const listHelpCategories = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // simple for now; later can be dynamic
    res.json(DEFAULT_CATEGORIES);
});
exports.listHelpCategories = listHelpCategories;
const listHelpArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category = 'all', q = '' } = req.query;
        const filter = { isPublished: true };
        if (category && category !== 'all')
            filter.category = String(category);
        let query = helpArticleModel_1.default.find(filter);
        const search = String(q || '').trim();
        if (search) {
            // Use text index
            query = helpArticleModel_1.default.find(Object.assign(Object.assign({}, filter), { $text: { $search: search } }));
        }
        const items = yield query
            .sort({ order: 1, createdAt: -1 })
            .select('_id title description category type updatedAt')
            .lean();
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load help articles.' });
    }
});
exports.listHelpArticles = listHelpArticles;
const getHelpArticleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield helpArticleModel_1.default.findOne({ _id: id, isPublished: true }).lean();
        if (!item)
            return res.status(404).json({ message: 'Article not found.' });
        res.json(item);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load help article.' });
    }
});
exports.getHelpArticleById = getHelpArticleById;
const listHelpFaqs = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faqs = yield helpFaqModel_1.default.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean();
        res.json(faqs);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load FAQs.' });
    }
});
exports.listHelpFaqs = listHelpFaqs;
//# sourceMappingURL=helpController.js.map