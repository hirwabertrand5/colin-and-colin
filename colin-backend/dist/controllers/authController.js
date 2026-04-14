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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_js_1 = __importDefault(require("../models/userModel.js"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = (req.body || {});
        // ✅ Prevent crash when body is missing
        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required.' });
        }
        const user = yield userModel_js_1.default.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        if (user.lockUntil && user.lockUntil > new Date()) {
            return res.status(403).json({ message: 'Account is locked. Try later.' });
        }
        const valid = yield user.comparePassword(password);
        if (!valid) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
            }
            yield user.save();
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        yield user.save();
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: 'JWT secret not configured.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.name, role: user.role, email: user.email }, secret, 
        // You can change this later if you want longer sessions
        { expiresIn: '7d' });
        return res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});
exports.login = login;
// registerUser (kept as you had)
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = (req.body || {});
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'name, email, password, role are required.' });
        }
        const userExists = yield userModel_js_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const user = new userModel_js_1.default({
            name,
            email,
            passwordHash: password, // Hashing happens in userModel pre-save hook
            role,
        });
        yield user.save();
        return res.status(201).json({ message: 'User created successfully.' });
    }
    catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Server error during registration.' });
    }
});
exports.registerUser = registerUser;
//# sourceMappingURL=authController.js.map