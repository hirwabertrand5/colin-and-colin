"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.setUserActiveStatus = exports.resetUserPassword = exports.addUser = exports.getStaffUsers = exports.getAllUsers = void 0;
const userModel_js_1 = __importDefault(require("../models/userModel.js"));
// Get all users (excluding passwordHash)
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel_js_1.default.find({}, '-passwordHash -__v');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
};
exports.getAllUsers = getAllUsers;
// ✅ NEW: Get active staff users for assignment dropdown
const getStaffUsers = async (req, res) => {
    try {
        const staff = await userModel_js_1.default.find({
            isActive: true,
            role: {
                $in: [
                    'managing_director',
                    'lawyer',
                    'associate',
                    'assistant',
                    'executive_assistant',
                    'intern',
                ],
            },
        }, 'name email role isActive').sort({ name: 1 });
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch staff users.' });
    }
};
exports.getStaffUsers = getStaffUsers;
// Add new user
const addUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const userExists = await userModel_js_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const user = new userModel_js_1.default({
            name,
            email,
            role,
            passwordHash: password,
            isActive: true,
            loginAttempts: 0,
        });
        await user.save();
        res.status(201).json({
            message: 'User created successfully.',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create user.' });
    }
};
exports.addUser = addUser;
// Reset user password
const resetUserPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const user = await userModel_js_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.passwordHash = newPassword;
        await user.save();
        res.json({ message: 'Password reset successfully.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to reset password.' });
    }
};
exports.resetUserPassword = resetUserPassword;
// Toggle user active status
const setUserActiveStatus = async (req, res) => {
    try {
        const { userId, isActive } = req.body;
        const user = await userModel_js_1.default.findByIdAndUpdate(userId, { isActive }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
            user,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update user status.' });
    }
};
exports.setUserActiveStatus = setUserActiveStatus;
// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const user = await userModel_js_1.default.findByIdAndUpdate(id, { name, email, role }, { new: true });
        if (!user)
            return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update user.' });
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel_js_1.default.findByIdAndDelete(id);
        if (!user)
            return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map