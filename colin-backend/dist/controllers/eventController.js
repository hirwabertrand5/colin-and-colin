"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.addEventToCase = exports.getEventsForCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const auditService_1 = require("../services/auditService");
const actorFromReq = (req) => ({
    actorName: req.user?.name || 'System',
    actorUserId: req.user?.id,
});
// Get all events for a case
const getEventsForCase = async (req, res) => {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const events = await eventModel_1.default.find({ caseId: new mongoose_1.default.Types.ObjectId(caseId) }).sort({ date: 1, time: 1 });
        res.json(events);
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch events.' });
    }
};
exports.getEventsForCase = getEventsForCase;
// Add event to a case
const addEventToCase = async (req, res) => {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const newEvent = new eventModel_1.default({ ...req.body, caseId: new mongoose_1.default.Types.ObjectId(caseId) });
        await newEvent.save();
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId,
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'EVENT_CREATED',
            message: 'Created event',
            detail: `${newEvent.type || 'Event'} • ${newEvent.title || 'Untitled'} • ${newEvent.date || '-'} ${newEvent.time || ''}`.trim(),
        });
        res.status(201).json(newEvent);
    }
    catch {
        res.status(500).json({ message: 'Failed to create event.' });
    }
};
exports.addEventToCase = addEventToCase;
// Get single event
const getEventById = async (req, res) => {
    try {
        let eventId = req.params.eventId;
        if (Array.isArray(eventId))
            eventId = eventId[0];
        if (!eventId)
            return res.status(400).json({ message: 'Missing eventId' });
        const event = await eventModel_1.default.findById(eventId);
        if (!event)
            return res.status(404).json({ message: 'Event not found.' });
        res.json(event);
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch event.' });
    }
};
exports.getEventById = getEventById;
// Update event
const updateEvent = async (req, res) => {
    try {
        let eventId = req.params.eventId;
        if (Array.isArray(eventId))
            eventId = eventId[0];
        if (!eventId)
            return res.status(400).json({ message: 'Missing eventId' });
        const before = await eventModel_1.default.findById(eventId);
        const updated = await eventModel_1.default.findByIdAndUpdate(eventId, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Event not found.' });
        const changes = [];
        if (before) {
            if (req.body.date && req.body.date !== before.date)
                changes.push(`Date: ${before.date} → ${req.body.date}`);
            if (req.body.time && req.body.time !== before.time)
                changes.push(`Time: ${before.time} → ${req.body.time}`);
            if (req.body.type && req.body.type !== before.type)
                changes.push(`Type: ${before.type} → ${req.body.type}`);
            if (req.body.title && req.body.title !== before.title)
                changes.push(`Title changed`);
        }
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(updated.caseId),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'EVENT_UPDATED',
            message: 'Updated event',
            detail: `${updated.title || 'Untitled'}${changes.length ? ' • ' + changes.join(' • ') : ''}`,
        });
        res.json(updated);
    }
    catch {
        res.status(500).json({ message: 'Failed to update event.' });
    }
};
exports.updateEvent = updateEvent;
// Delete event
const deleteEvent = async (req, res) => {
    try {
        let eventId = req.params.eventId;
        if (Array.isArray(eventId))
            eventId = eventId[0];
        if (!eventId)
            return res.status(400).json({ message: 'Missing eventId' });
        const deleted = await eventModel_1.default.findByIdAndDelete(eventId);
        if (!deleted)
            return res.status(404).json({ message: 'Event not found.' });
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(deleted.caseId),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'EVENT_DELETED',
            message: 'Deleted event',
            detail: deleted.title || 'Untitled',
        });
        res.json({ message: 'Event deleted.' });
    }
    catch {
        res.status(500).json({ message: 'Failed to delete event.' });
    }
};
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=eventController.js.map