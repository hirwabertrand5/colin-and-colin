import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const listAttachmentsForTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadAttachmentToTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTaskAttachment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=taskAttachmentController.d.ts.map