import { Request, Response } from 'express';
export declare const getInvoicesForCase: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addInvoiceToCase: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadProof: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadInvoiceFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=invoiceController.d.ts.map