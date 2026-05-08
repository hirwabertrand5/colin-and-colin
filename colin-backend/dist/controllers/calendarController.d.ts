import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getFirmEvents: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCalendarTasks: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=calendarController.d.ts.map