"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadReportPdf = exports.getReportById = exports.generateReportForCase = exports.listReportsForCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const caseModel_1 = __importDefault(require("../models/caseModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const auditLogModel_1 = __importDefault(require("../models/auditLogModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const documentModel_1 = __importDefault(require("../models/documentModel"));
const clientReportModel_1 = __importDefault(require("../models/clientReportModel"));
const playwright_1 = require("playwright");
const safe = (v) => (v === null || v === undefined ? '' : String(v));
const formatDate = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
const wrapHtmlDoc = (title, bodyHtml) => {
    // A4 print defaults + basic grayscale styling
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    html, body { font-family: Arial, sans-serif; color: #111; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
};
const buildHtml = (payload) => {
    const periodLabel = `${formatDate(payload.periodStart)} to ${formatDate(payload.periodEnd)}`;
    return `
  <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.45">
    <div style="margin-bottom: 14px;">
      <h2 style="margin:0 0 6px 0;">Case Progress Report</h2>
      <div style="color:#555;">
        Period: <strong>${periodLabel}</strong>
      </div>
    </div>

    <div style="border:1px solid #eee; border-radius:10px; padding:14px; margin: 12px 0;">
      <h3 style="margin:0 0 10px 0;">Case Summary</h3>
      <table style="width:100%; border-collapse: collapse;">
        <tr>
          <td style="padding:6px 0; color:#666; width:160px;">Case No</td>
          <td style="padding:6px 0;"><strong>${safe(payload.caseNo)}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#666;">Parties</td>
          <td style="padding:6px 0;"><strong>${safe(payload.parties)}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#666;">Case Type</td>
          <td style="padding:6px 0;">${safe(payload.caseType)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#666;">Current Stage</td>
          <td style="padding:6px 0;">${safe(payload.status)}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin:18px 0 8px;">Key Updates</h3>
    ${payload.updates.length === 0
        ? `<div style="color:#777;">No major updates recorded in this period.</div>`
        : `<ul style="padding-left:18px; margin:0;">
            ${payload.updates
            .slice(0, 20)
            .map((u) => {
            const who = u.actorName ? ` — <span style="color:#555;">${safe(u.actorName)}</span>` : '';
            const detail = u.detail ? ` <span style="color:#555;">(${safe(u.detail)})</span>` : '';
            return `<li style="margin:8px 0;">
                  <strong>${safe(u.createdAt)}</strong>${who}<br/>
                  <span>${safe(u.message)}</span>${detail}
                </li>`;
        })
            .join('')}
          </ul>`}

    <h3 style="margin:18px 0 8px;">Tasks Snapshot</h3>
    ${payload.tasks.length === 0
        ? `<div style="color:#777;">No tasks found.</div>`
        : `<table style="width:100%; border-collapse: collapse; border:1px solid #eee; border-radius:10px; overflow:hidden;">
            <thead>
              <tr style="background:#f7f7f7;">
                <th style="text-align:left; padding:10px; font-size:12px; color:#555;">Title</th>
                <th style="text-align:left; padding:10px; font-size:12px; color:#555;">Status</th>
                <th style="text-align:left; padding:10px; font-size:12px; color:#555;">Priority</th>
                <th style="text-align:left; padding:10px; font-size:12px; color:#555;">Assignee</th>
                <th style="text-align:left; padding:10px; font-size:12px; color:#555;">Due</th>
              </tr>
            </thead>
            <tbody>
              ${payload.tasks
            .slice(0, 20)
            .map((t) => `
                  <tr>
                    <td style="padding:10px; border-top:1px solid #eee;">${safe(t.title)}</td>
                    <td style="padding:10px; border-top:1px solid #eee;">${safe(t.status)}</td>
                    <td style="padding:10px; border-top:1px solid #eee;">${safe(t.priority || '')}</td>
                    <td style="padding:10px; border-top:1px solid #eee;">${safe(t.assignee)}</td>
                    <td style="padding:10px; border-top:1px solid #eee;">${safe(t.dueDate || '')}</td>
                  </tr>`)
            .join('')}
            </tbody>
          </table>`}

    <h3 style="margin:18px 0 8px;">Upcoming Events</h3>
    ${payload.events.length === 0
        ? `<div style="color:#777;">No upcoming events.</div>`
        : `<ul style="padding-left:18px; margin:0;">
            ${payload.events
            .slice(0, 12)
            .map((e) => {
            const when = `${safe(e.date)}${e.time ? ` ${safe(e.time)}` : ''}`;
            const desc = e.description ? `<div style="color:#555; margin-top:4px;">${safe(e.description)}</div>` : '';
            return `<li style="margin:8px 0;">
                  <strong>${when}</strong> — ${safe(e.type)}: ${safe(e.title)}
                  ${desc}
                </li>`;
        })
            .join('')}
          </ul>`}

    <h3 style="margin:18px 0 8px;">Documents Added</h3>
    ${payload.documents.length === 0
        ? `<div style="color:#777;">No documents added in this period.</div>`
        : `<ul style="padding-left:18px; margin:0;">
            ${payload.documents
            .slice(0, 15)
            .map((d) => {
            const meta = [d.category ? `Category: ${safe(d.category)}` : null, d.size ? `Size: ${safe(d.size)}` : null]
                .filter(Boolean)
                .join(' • ');
            return `<li style="margin:8px 0;">
                  <strong>${safe(d.uploadedDate)}</strong> — ${safe(d.name)}
                  <div style="color:#555; margin-top:4px;">Uploaded by ${safe(d.uploadedBy)}${meta ? ` • ${meta}` : ''}</div>
                </li>`;
        })
            .join('')}
          </ul>`}

    <hr style="margin:22px 0; border:none; border-top:1px solid #eee;" />
    <div style="color:#666; font-size:12px;">
      Generated by Colin & Colin Legal Operations Platform.
    </div>
  </div>
  `;
};
const listReportsForCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        const reports = await clientReportModel_1.default.find({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
        }).sort({ createdAt: -1 });
        res.json(reports);
    }
    catch {
        res.status(500).json({ message: 'Failed to load reports.' });
    }
};
exports.listReportsForCase = listReportsForCase;
const generateReportForCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        const now = new Date();
        const periodDays = Number(req.body?.periodDays || 30);
        const periodEnd = now;
        const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const todayStr = formatDate(now);
        const [tasks, audit, events, docs] = await Promise.all([
            taskModel_1.default.find({ caseId: new mongoose_1.default.Types.ObjectId(caseId) }).sort({ dueDate: 1, createdAt: -1 }).lean(),
            auditLogModel_1.default.find({
                caseId: new mongoose_1.default.Types.ObjectId(caseId),
                createdAt: { $gte: periodStart, $lte: periodEnd },
            })
                .sort({ createdAt: -1 })
                .lean(),
            eventModel_1.default.find({
                caseId: new mongoose_1.default.Types.ObjectId(caseId),
                date: { $gte: todayStr },
            })
                .sort({ date: 1 })
                .lean(),
            documentModel_1.default.find({
                caseId: new mongoose_1.default.Types.ObjectId(caseId),
                createdAt: { $gte: periodStart, $lte: periodEnd },
            })
                .sort({ createdAt: -1 })
                .lean(),
        ]);
        const recipients = (c.clientContacts || []).filter((r) => r.email);
        const subject = `Case Report — ${safe(c.caseNo)} — ${safe(c.parties)} — ${formatDate(periodStart)} to ${formatDate(periodEnd)}`;
        const html = buildHtml({
            caseNo: c.caseNo,
            parties: c.parties,
            caseType: c.caseType,
            status: c.status,
            periodStart,
            periodEnd,
            updates: (audit || []).map((a) => ({
                createdAt: new Date(a.createdAt).toLocaleString(),
                message: safe(a.message),
                ...(a.action ? { action: safe(a.action) } : {}),
                ...(a.detail ? { detail: safe(a.detail) } : {}),
                ...(a.actorName ? { actorName: safe(a.actorName) } : {}),
            })),
            tasks: (tasks || []).map((t) => ({
                title: safe(t.title),
                status: safe(t.status),
                assignee: safe(t.assignee),
                ...(t.priority ? { priority: safe(t.priority) } : {}),
                ...(t.dueDate ? { dueDate: safe(t.dueDate) } : {}),
            })),
            events: (events || []).map((e) => ({
                title: safe(e.title),
                type: safe(e.type),
                date: safe(e.date),
                ...(e.time ? { time: safe(e.time) } : {}),
                ...(e.description ? { description: safe(e.description) } : {}),
            })),
            documents: (docs || []).map((d) => ({
                name: safe(d.name),
                uploadedDate: d.uploadedDate ? safe(d.uploadedDate) : new Date(d.createdAt).toLocaleDateString(),
                uploadedBy: safe(d.uploadedBy),
                ...(d.category ? { category: safe(d.category) } : {}),
                ...(d.size ? { size: safe(d.size) } : {}),
            })),
        });
        const report = await clientReportModel_1.default.create({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
            trigger: 'manual',
            status: 'Draft',
            periodStart,
            periodEnd,
            subject,
            recipients,
            contentHtml: html,
            generatedBy: req.user?.name || 'System',
            ...(req.user?.id ? { generatedByUserId: new mongoose_1.default.Types.ObjectId(req.user.id) } : {}),
        });
        await caseModel_1.default.findByIdAndUpdate(caseId, { 'reporting.lastGeneratedAt': now });
        res.status(201).json(report);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to generate report.' });
    }
};
exports.generateReportForCase = generateReportForCase;
const getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await clientReportModel_1.default.findById(reportId);
        if (!report)
            return res.status(404).json({ message: 'Report not found.' });
        res.json(report);
    }
    catch {
        res.status(500).json({ message: 'Failed to load report.' });
    }
};
exports.getReportById = getReportById;
// ✅ NEW: PDF download endpoint (no email)
const downloadReportPdf = async (req, res) => {
    const { reportId } = req.params;
    if (!reportId)
        return res.status(400).json({ message: 'Missing reportId' });
    const report = await clientReportModel_1.default.findById(reportId);
    if (!report)
        return res.status(404).json({ message: 'Report not found.' });
    // Try to build a meaningful filename
    const filenameSafe = String(report.subject || 'case-report')
        .replace(/[^\w\s\-().]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120);
    const fileName = `${filenameSafe}.pdf`;
    const htmlDoc = wrapHtmlDoc(report.subject || 'Case Report', report.contentHtml || '<div>No content</div>');
    // Render PDF
    const browser = await playwright_1.chromium.launch();
    try {
        const page = await browser.newPage();
        await page.setContent(htmlDoc, { waitUntil: 'networkidle' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(pdfBuffer);
    }
    finally {
        await browser.close();
    }
};
exports.downloadReportPdf = downloadReportPdf;
//# sourceMappingURL=clientReportController.js.map