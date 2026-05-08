export type SendEmailResult = {
    ok: true;
    id?: string;
} | {
    ok: false;
    error: string;
};
export declare const sendEmailResend: (to: string[], subject: string, html: string) => Promise<SendEmailResult>;
//# sourceMappingURL=emailResendService.d.ts.map