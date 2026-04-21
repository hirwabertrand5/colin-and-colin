"use strict";
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
const listHelpCategories = async (_req, res) => {
    // simple for now; later can be dynamic
    res.json(DEFAULT_CATEGORIES);
};
exports.listHelpCategories = listHelpCategories;
const listHelpArticles = async (req, res) => {
    try {
        const { category = 'all', q = '' } = req.query;
        const filter = { isPublished: true };
        if (category && category !== 'all')
            filter.category = String(category);
        let query = helpArticleModel_1.default.find(filter);
        const search = String(q || '').trim();
        if (search) {
            // Use text index
            query = helpArticleModel_1.default.find({ ...filter, $text: { $search: search } });
        }
        const items = await query
            .sort({ order: 1, createdAt: -1 })
            .select('_id title description category type updatedAt')
            .lean();
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to load help articles.' });
    }
};
exports.listHelpArticles = listHelpArticles;
const getHelpArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await helpArticleModel_1.default.findOne({ _id: id, isPublished: true }).lean();
        if (!item)
            return res.status(404).json({ message: 'Article not found.' });
        res.json(item);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to load help article.' });
    }
};
exports.getHelpArticleById = getHelpArticleById;
const listHelpFaqs = async (_req, res) => {
    try {
        const faqs = await helpFaqModel_1.default.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean();
        res.json(faqs);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to load FAQs.' });
    }
};
exports.listHelpFaqs = listHelpFaqs;
//# sourceMappingURL=helpController.js.map