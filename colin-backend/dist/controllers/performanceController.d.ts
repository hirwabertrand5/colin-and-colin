import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getMyPerformance: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTeamPerformance: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=performanceController.d.ts.map