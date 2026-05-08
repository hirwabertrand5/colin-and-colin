import multer from 'multer';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const upload: multer.Multer;
export declare const getDocumentsForCase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addDocumentToCase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteDocument: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=documentController.d.ts.map