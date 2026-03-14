import { Request, Response } from 'express';
import User from '../models/userModel.js';

// Get all users (excluding passwordHash)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-passwordHash -__v');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// Add new user
export const addUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      role,
      passwordHash: password, // Will be hashed by pre-save hook
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
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user.' });
  }
};

// Reset user password
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password.' });
  }
};

// Toggle user active status
export const setUserActiveStatus = async (req: Request, res: Response) => {
  try {
    const { userId, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status.' });
  }
};

//update user 
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user.' });
  }
};
// Add at the end of your file
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.' });
  }
};