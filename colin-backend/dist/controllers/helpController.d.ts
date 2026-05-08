import { Request, Response } from 'express';
export declare const listHelpCategories: (_req: Request, res: Response) => Promise<void>;
export declare const listHelpArticles: (req: Request, res: Response) => Promise<void>;
export declare const getHelpArticleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listHelpFaqs: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=helpController.d.ts.map