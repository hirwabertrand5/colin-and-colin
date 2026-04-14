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
exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.addEventToCase = exports.getEventsForCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const auditService_1 = require("../services/auditService");
const actorFromReq = (req) => {
    var _a, _b;
    return ({
        actorName: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System',
        actorUserId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
    });
};
// Get all events for a case
const getEventsForCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const events = yield eventModel_1.default.find({ caseId: new mongoose_1.default.Types.ObjectId(caseId) }).sort({ date: 1, time: 1 });
        res.json(events);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to fetch events.' });
    }
});
exports.getEventsForCase = getEventsForCase;
// Add event to a case
const addEventToCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const newEvent = new eventModel_1.default(Object.assign(Object.assign({}, req.body), { caseId: new mongoose_1.default.Types.ObjectId(caseId) }));
        yield newEvent.save();
        const actor = actorFromReq(req);
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId, actorName: actor.actorName }, (actor.actorUserId ? { actorUserId: actor.actorUserId } : {})), { action: 'EVENT_CREATED', message: 'Created event', detail: `${newEvent.type || 'Event'} • ${newEvent.title || 'Untitled'} • ${newEvent.date || '-'} ${newEvent.time || ''}`.trim() }));
        res.status(201).json(newEvent);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to create event.' });
    }
});
exports.addEventToCase = addEventToCase;
// Get single event
const getEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let eventId = req.params.eventId;
        if (Array.isArray(eventId))
            eventId = eventId[0];
        if (!eventId)
            return res.status(400).json({ message: 'Missing eventId' });
        const event = yield eventModel_1.default.findById(eventId);
        if (!event)
            return res.status(404).json({ message: 'Event not found.' });
        res.json(event);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to fetch event.' });
    }
});
exports.getEventById = getEventById;
// Update event
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let eventId = req.params.eventId;
        if (Array.isArray(eventId))
            eventId = eventId[0];
        if (!eventId)
            return res.status(400).json({ message: 'Missing eventId' });
        const before = yield eventModel_1.default.findById(eventId);
        const updated = yield eventModel_1.default.findByIdAndUpdate(eventId, req.body, { new: true });
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
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(updated.caseId), actorName: actor.actorName }, (actor.actorUserId ? { actorUserId: actor.actorUserId } : {})), { action: 'EVENT_UPDATED', message: 'Updated event', detail: `${updated.title || 'Untitled'}${changes.length ? ' • ' + changes.join(' • ') : ''}` }));
        res.json(updated);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to update event.' });
    }
});
exports.updateEvent = updateEvent;
// Delete event
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let eventId = req.params.eventId;
        if (Array.isArray(eventId))
            eventId = eventId[0];
        if (!eventId)
            return res.status(400).json({ message: 'Missing eventId' });
        const deleted = yield eventModel_1.default.findByIdAndDelete(eventId);
        if (!deleted)
            return res.status(404).json({ message: 'Event not found.' });
        const actor = actorFromReq(req);
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(deleted.caseId), actorName: actor.actorName }, (actor.actorUserId ? { actorUserId: actor.actorUserId } : {})), { action: 'EVENT_DELETED', message: 'Deleted event', detail: deleted.title || 'Untitled' }));
        res.json({ message: 'Event deleted.' });
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to delete event.' });
    }
});
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=eventController.js.map