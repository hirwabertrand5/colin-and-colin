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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestEmail = void 0;
const emailResendService_1 = require("../services/emailResendService");
const sendTestEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.email))
            return res.status(401).json({ message: 'Unauthorized.' });
        const to = ((_b = req.body) === null || _b === void 0 ? void 0 : _b.to) ? String(req.body.to).trim() : req.user.email;
        const result = yield (0, emailResendService_1.sendEmailResend)([to], 'Colin & Colin — Email Test', `<div style="font-family:Arial,sans-serif">
        <h3>Email is working</h3>
        <p>This is a test email from Colin & Colin Legal Ops platform (Resend).</p>
        <p><b>User:</b> ${req.user.name} (${req.user.email})</p>
        <p><b>Time:</b> ${new Date().toLocaleString()}</p>
      </div>`);
        if (!result.ok)
            return res.status(500).json({ message: `Email failed: ${result.error}` });
        return res.json({ message: `Email sent to ${to}.`, id: result.id });
    }
    catch (e) {
        return res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to send test email.' });
    }
});
exports.sendTestEmail = sendTestEmail;
//# sourceMappingURL=adminEmailController.js.map