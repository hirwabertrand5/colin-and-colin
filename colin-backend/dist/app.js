"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const firmReports_1 = __importDefault(require("./routes/firmReports"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_js_1 = __importDefault(require("./routes/user.js"));
const case_js_1 = __importDefault(require("./routes/case.js"));
const task_js_1 = __importDefault(require("./routes/task.js"));
const event_js_1 = __importDefault(require("./routes/event.js"));
const document_js_1 = __importDefault(require("./routes/document.js"));
const invoice_js_1 = __importDefault(require("./routes/invoice.js"));
const audit_1 = __importDefault(require("./routes/audit"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const billing_1 = __importDefault(require("./routes/billing"));
const auditFeed_1 = __importDefault(require("./routes/auditFeed"));
const pettyCash_1 = __importDefault(require("./routes/pettyCash"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const timeLogs_1 = __importDefault(require("./routes/timeLogs"));
const taskAttachments_1 = __importDefault(require("./routes/taskAttachments"));
const performance_1 = __importDefault(require("./routes/performance"));
const clientReports_1 = __importDefault(require("./routes/clientReports"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const adminEmail_1 = __importDefault(require("./routes/adminEmail"));
const help_1 = __importDefault(require("./routes/help"));
const workflows_1 = __importDefault(require("./routes/workflows"));
const app = (0, express_1.default)();
// ✅ Allow multiple dev origins + configurable CLIENT_URL
const allowedOrigins = new Set([
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5173',
].filter(Boolean));
// 1) CORS FIRST
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow non-browser clients like Postman/curl (no Origin header)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.has(origin))
            return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
}));
// 2) Body parsers
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// 3) Cookies
app.use((0, cookie_parser_1.default)());
// 4) Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_js_1.default);
app.use('/api/cases', case_js_1.default);
app.use('/api', task_js_1.default);
app.use('/api', event_js_1.default);
app.use('/api', document_js_1.default);
app.use('/api', invoice_js_1.default);
app.use('/api', audit_1.default);
app.use('/api', auditFeed_1.default);
app.use('/api', calendar_1.default);
app.use('/api', billing_1.default);
app.use('/api', performance_1.default);
app.use('/api', firmReports_1.default);
app.use('/api/petty-cash', pettyCash_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/time-logs', timeLogs_1.default);
app.use('/api', taskAttachments_1.default);
app.use('/api', clientReports_1.default);
app.use('/api', dashboard_1.default);
app.use('/api', adminEmail_1.default);
app.use('/api', help_1.default);
app.use('/api/workflows', workflows_1.default);
// uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
exports.default = app;
//# sourceMappingURL=app.js.map