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
exports.sendEmailResend = void 0;
const resend_1 = require("resend");
const sendEmailResend = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const apiKey = String(process.env.RESEND_API_KEY || '').trim();
        const from = String(process.env.EMAIL_FROM || '').trim();
        if (!apiKey)
            return { ok: false, error: 'Missing RESEND_API_KEY' };
        if (!from)
            return { ok: false, error: 'Missing EMAIL_FROM' };
        const resend = new resend_1.Resend(apiKey);
        const resp = yield resend.emails.send({
            from,
            to,
            subject,
            html,
        });
        const anyResp = resp;
        if (anyResp === null || anyResp === void 0 ? void 0 : anyResp.error)
            return { ok: false, error: anyResp.error.message || 'Resend send failed' };
        return { ok: true, id: (_a = anyResp === null || anyResp === void 0 ? void 0 : anyResp.data) === null || _a === void 0 ? void 0 : _a.id };
    }
    catch (e) {
        return { ok: false, error: (e === null || e === void 0 ? void 0 : e.message) || 'Resend send failed' };
    }
});
exports.sendEmailResend = sendEmailResend;
//# sourceMappingURL=emailResendService.js.map