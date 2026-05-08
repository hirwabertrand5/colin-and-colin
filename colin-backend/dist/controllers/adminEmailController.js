"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestEmail = void 0;
const emailResendService_1 = require("../services/emailResendService");
const sendTestEmail = async (req, res) => {
    try {
        if (!req.user?.email)
            return res.status(401).json({ message: 'Unauthorized.' });
        const to = req.body?.to ? String(req.body.to).trim() : req.user.email;
        const result = await (0, emailResendService_1.sendEmailResend)([to], 'Colin & Colin — Email Test', `<div style="font-family:Arial,sans-serif">
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
        return res.status(500).json({ message: e?.message || 'Failed to send test email.' });
    }
};
exports.sendTestEmail = sendTestEmail;
//# sourceMappingURL=adminEmailController.js.map