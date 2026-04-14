import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getMyNotificationPreferences: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMyNotificationPreferences: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=notificationPreferencesController.d.ts.map