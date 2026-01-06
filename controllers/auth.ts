
import { Request, Response } from 'express';
import { User, Teacher } from '../models.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const newUser = new User({
      name,
      email,
      password: await hashPassword(password),
      role: role || 'student'
    });

    await newUser.save();

    // If teacher, create teacher profile
    if (role === 'teacher') {
      const { subject, subject2, subject3, bio, videoUrl, experience, price, grades, days, hours } = req.body;

      if (!subject || !bio || !experience || !price) {
        return res.status(400).json({ error: 'Teacher registration requires subject, bio, experience, and price' });
      }

      if (!days || !Array.isArray(days) || days.length === 0) {
        return res.status(400).json({ error: 'Please select at least one available day' });
      }

      if (!hours || !Array.isArray(hours) || hours.length === 0) {
        return res.status(400).json({ error: 'Please select at least one available time slot' });
      }

      const newTeacher = new Teacher({
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        subject,
        subject2: subject2 || undefined,
        subject3: subject3 || undefined,
        bio,
        experience,
        price: Number(price),
        videoUrl: videoUrl || undefined,
        isVerified: false,
        tags: [subject, subject2, subject3].filter(Boolean),
        grades: grades || [],
        days: days,
        hours: hours,
        rating: 0,
        reviews: 0
      });

      await newTeacher.save();
    }

    // Generate JWT token
    const token = generateToken(String(newUser._id), newUser.email, newUser.role);

    res.status(201).json({
      message: 'User registered successfully',
      role: newUser.role,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(String(user._id), user.email, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logout successful' });
};
