import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getAllCases: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createCase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCaseById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteCase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=caseController.d.ts.map