"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.getToken = exports.logout = exports.login = void 0;
const API_URL = 'http://localhost:5000/api';
const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Login failed');
    }
    return data;
};
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