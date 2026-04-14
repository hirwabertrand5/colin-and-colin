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
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const reminderScheduler_1 = require("./jobs/reminderScheduler");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const app_1 = __importDefault(require("./app"));
const db_js_1 = __importDefault(require("./config/db.js"));
const seedDueDiligence_1 = require("./seed/seedDueDiligence");
const PORT = process.env.PORT || 5000;
(0, db_js_1.default)().then(() => __awaiter(void 0, void 0, void 0, function* () {
    // ✅ seed workflow templates
    yield (0, seedDueDiligence_1.seedDueDiligenceTemplate)();
    app_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        (0, reminderScheduler_1.startReminderScheduler)();
    });
}));
//# sourceMappingURL=server.js.map