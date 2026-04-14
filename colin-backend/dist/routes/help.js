"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helpController_1 = require("../controllers/helpController");
const router = express_1.default.Router();
// Public-ish (still behind auth in UI; you can add authenticate if you want)
router.get('/help/categories', helpController_1.listHelpCategories);
router.get('/help/articles', helpController_1.listHelpArticles);
router.get('/help/articles/:id', helpController_1.getHelpArticleById);
router.get('/help/faqs', helpController_1.listHelpFaqs);
exports.default = router;
//# sourceMappingURL=help.js.map