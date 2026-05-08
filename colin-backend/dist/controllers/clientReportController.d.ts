import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const listReportsForCase: (req: AuthRequest, res: Response) => Promise<void>;
export declare const generateReportForCase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getReportById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const downloadReportPdf: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=clientReportController.d.ts.map