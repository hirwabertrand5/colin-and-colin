import { Request, Response } from 'express';
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const getStaffUsers: (req: Request, res: Response) => Promise<void>;
export declare const addUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resetUserPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const setUserActiveStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=userController.d.ts.map