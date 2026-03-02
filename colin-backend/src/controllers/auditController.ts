import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AuditLog from '../models/auditLogModel';

export const getAuditForCase = async (req: Request, res: Response) => {
  try {
    let caseId = req.params.caseId as any;
    if (Array.isArray(caseId)) caseId = caseId[0];
    if (!caseId) return res.status(400).json({ message: 'Missing caseId' });

    const logs = await AuditLog.find({
      caseId: new mongoose.Types.ObjectId(caseId),
    })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(logs);
  } catch {
    res.status(500).json({ message: 'Failed to fetch audit logs.' });
  }
};