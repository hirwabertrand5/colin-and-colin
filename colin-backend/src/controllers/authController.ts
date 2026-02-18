import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(403).json({ message: 'Account is locked. Try later.' });
  }

  // Use the comparePassword method from your userModel
  const valid = await user.comparePassword(password);
  if (!valid) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await user.save();
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  user.loginAttempts = 0;
  // Use 'as any' to bypass the strict 'exactOptionalPropertyTypes' check for Date
  user.lockUntil = undefined as any;
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// Added the missing registerUser export
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const user = new User({
      name,
      email,
      passwordHash: password, // Hashing happens in userModel pre-save hook
      role
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
};
