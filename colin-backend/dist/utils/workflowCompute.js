"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInstanceSteps = exports.addMinutes = exports.slaToMinutes = exports.feeToMoney = exports.parseFirstNumber = exports.normalizeCurrency = void 0;
const normalizeCurrency = (raw) => {
    const v = (raw || '').trim().toUpperCase();
    if (!v)
        return undefined;
    if (v === 'FRW')
        return 'RWF';
    return v;
};
exports.normalizeCurrency = normalizeCurrency;
const parseFirstNumber = (text) => {
    const cleaned = String(text || '')
        .replace(/\u00A0/g, ' ')
        .replace(/[, ]+/g, '')
        .trim();
    const m = cleaned.match(/(\d+(\.\d+)?)/);
    if (!m)
        return undefined;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : undefined;
};
exports.parseFirstNumber = parseFirstNumber;
const feeToMoney = (fee) => {
    if (!fee)
        return {};
    if (fee.type === 'fixed' && typeof fee.min === 'number') {
        const currency = (0, exports.normalizeCurrency)(fee.currency);
        return { amount: fee.min, ...(currency ? { currency } : {}), ...(fee.text ? { text: fee.text } : {}) };
    }
    if (fee.type === 'range' && typeof fee.min === 'number') {
        const currency = (0, exports.normalizeCurrency)(fee.currency);
        return { amount: fee.min, ...(currency ? { currency } : {}), ...(fee.text ? { text: fee.text } : {}) };
    }
    if (fee.type === 'percentage')
        return { text: fee.text || `${fee.percentage ?? ''}%` };
    if (fee.type === 'included')
        return { text: fee.text || 'Included' };
    if (fee.text) {
        const amount = (0, exports.parseFirstNumber)(fee.text);
        const currency = (0, exports.normalizeCurrency)(fee.currency) ||
            (fee.text.toLowerCase().includes('rwf') || fee.text.toLowerCase().includes('frw') ? 'RWF' : undefined);
        return {
            ...(typeof amount === 'number' ? { amount } : {}),
            ...(currency ? { currency } : {}),
            text: fee.text,
        };
    }
    return {};
};
exports.feeToMoney = feeToMoney;
const UNIT_TO_MINUTES = {
    hour: 60,
    hours: 60,
    hr: 60,
    hrs: 60,
    h: 60,
    day: 60 * 24,
    days: 60 * 24,
    d: 60 * 24,
    week: 60 * 24 * 7,
    weeks: 60 * 24 * 7,
    w: 60 * 24 * 7,
};
const slaToMinutes = (sla) => {
    if (!sla)
        return {};
    // Prefer numeric config
    if (typeof sla.max === 'number' && sla.unit) {
        const unit = String(sla.unit);
        const mult = UNIT_TO_MINUTES[unit] || (unit === 'hours' ? 60 : unit === 'days' ? 60 * 24 : unit === 'weeks' ? 60 * 24 * 7 : undefined);
        if (mult) {
            const minutes = Math.max(0, Math.round(sla.max * mult));
            return { minutes, ...(sla.text ? { text: sla.text } : {}) };
        }
    }
    if (typeof sla.min === 'number' && sla.unit) {
        const unit = String(sla.unit);
        const mult = UNIT_TO_MINUTES[unit] || (unit === 'hours' ? 60 : unit === 'days' ? 60 * 24 : unit === 'weeks' ? 60 * 24 * 7 : undefined);
        if (mult) {
            const minutes = Math.max(0, Math.round(sla.min * mult));
            return { minutes, ...(sla.text ? { text: sla.text } : {}) };
        }
    }
    const text = (sla.text || '').trim();
    if (!text)
        return {};
    // Minimal parser for: "48", "48 hours", "1 day 12 hours", "1d 12h"
    const tokens = text
        .toLowerCase()
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    // if only a number, assume hours
    if (/^\d+(\.\d+)?$/.test(tokens)) {
        const n = Number(tokens);
        return Number.isFinite(n) ? { minutes: Math.round(n * 60), text } : {};
    }
    let total = 0;
    let matched = false;
    const re = /(\d+(\.\d+)?)\s*(weeks?|w|days?|d|hours?|hrs?|hr|h)\b/g;
    let m;
    while ((m = re.exec(tokens))) {
        const n = Number(m[1]);
        const unit = String(m[3] || '');
        const mult = UNIT_TO_MINUTES[unit];
        if (Number.isFinite(n) && mult) {
            total += n * mult;
            matched = true;
        }
    }
    return matched ? { minutes: Math.max(0, Math.round(total)), text } : { text };
};
exports.slaToMinutes = slaToMinutes;
const addMinutes = (start, minutes) => {
    if (!minutes || minutes <= 0)
        return new Date(start);
    return new Date(start.getTime() + minutes * 60000);
};
exports.addMinutes = addMinutes;
const buildInstanceSteps = (template, startDate) => {
    const sorted = (template?.steps || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    let cursor = new Date(startDate);
    return sorted.map((s, idx) => {
        const slaInfo = (0, exports.slaToMinutes)(s.sla);
        const feeInfo = (0, exports.feeToMoney)(s.fee);
        const stepStartAt = new Date(cursor);
        const dueAt = (0, exports.addMinutes)(stepStartAt, slaInfo.minutes);
        cursor = new Date(dueAt);
        return {
            stepKey: s.key,
            title: s.title,
            stageKey: s.stageKey,
            order: s.order,
            status: idx === 0 ? 'In Progress' : 'Not Started',
            startAt: stepStartAt,
            dueAt,
            feeAmount: typeof feeInfo.amount === 'number' ? feeInfo.amount : undefined,
            feeCurrency: feeInfo.currency,
            feeText: feeInfo.text,
            slaMinutes: typeof slaInfo.minutes === 'number' ? slaInfo.minutes : undefined,
            slaText: slaInfo.text,
            responsibleRole: typeof s.responsibleRole === 'string' ? s.responsibleRole : undefined,
            outputs: (s.outputs || []).map((o) => ({
                key: o.key,
                name: o.name,
                required: Boolean(o.required),
                category: o.category,
            })),
        };
    });
};
exports.buildInstanceSteps = buildInstanceSteps;
//# sourceMappingURL=workflowCompute.js.map