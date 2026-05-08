import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getActiveFund: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listFunds: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createFund: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const closeActiveFund: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listExpensesForFund: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createExpense: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteExpense: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=pettyCashController.d.ts.map