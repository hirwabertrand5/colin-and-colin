"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not set in environment variables');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Support different payload keys
        const userId = decoded.id || decoded.userId || decoded._id || decoded.sub;
        if (!userId) {
            return res.status(401).json({ message: 'Invalid token payload (missing user id).' });
        }
        const user = await userModel_1.default.findById(userId).select('name email role isActive');
        if (!user)
            return res.status(401).json({ message: 'User not found.' });
        if (user.isActive === false)
            return res.status(403).json({ message: 'User is inactive.' });
        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authMiddleware.js.map