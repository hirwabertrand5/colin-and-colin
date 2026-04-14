import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getRecentInvoices: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listInvoices: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=invoiceQueryController.d.ts.map