export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}
export declare const login: (email: string, password: string) => Promise<LoginResponse>;
export declare const logout: () => void;
export declare const getToken: () => string | null;
export declare const getUser: () => any;
//# sourceMappingURL=authService.d.ts.map