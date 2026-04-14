import mongoose, { Document } from 'mongoose';
export type UserRole = 'managing_director' | 'associate' | 'executive_assistant';
export interface IUser extends Document {
    email: string;
    name: string;
    role: UserRole;
    passwordHash: string;
    isActive: boolean;
    loginAttempts: number;
    lockUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=userModel.d.ts.map