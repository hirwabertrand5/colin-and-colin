"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.getToken = exports.logout = exports.login = void 0;
const API_URL = 'http://localhost:5000/api';
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = yield res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Login failed');
    }
    return data;
});
exports.login = login;
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
exports.logout = logout;
const getToken = () => localStorage.getItem('token');
exports.getToken = getToken;
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
exports.getUser = getUser;
//# sourceMappingURL=authService.js.map