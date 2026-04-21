"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailResend = void 0;
const resend_1 = require("resend");
const sendEmailResend = async (to, subject, html) => {
    try {
        const apiKey = String(process.env.RESEND_API_KEY || '').trim();
        const from = String(process.env.EMAIL_FROM || '').trim();
        if (!apiKey)
            return { ok: false, error: 'Missing RESEND_API_KEY' };
        if (!from)
            return { ok: false, error: 'Missing EMAIL_FROM' };
        const resend = new resend_1.Resend(apiKey);
        const resp = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });
        const anyResp = resp;
        if (anyResp?.error)
            return { ok: false, error: anyResp.error.message || 'Resend send failed' };
        return { ok: true, id: anyResp?.data?.id };
    }
    catch (e) {
        return { ok: false, error: e?.message || 'Resend send failed' };
    }
};
exports.sendEmailResend = sendEmailResend;
//# sourceMappingURL=emailResendService.js.map