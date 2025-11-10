// backend/src/controllers/authController.js
const User = require('../models/user.model');
const { generateToken } = require('../config/authConfig');
const { validateEmail, validatePassword, sanitizeInput } = require('../utils/validators');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialization } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    
    if (!validateEmail(email))
      return res.status(400).json({ message: 'Invalid email format.' });
    
    if (!validatePassword(password))
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'User with this email already exists.' });

    const user = await User.create({ name, email, password, role, phone, specialization });
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, role: user.role, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email))
      return res.status(400).json({ message: 'Invalid email format.' });

    const user = await User.findOne({ email: sanitizeInput(email) });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, role: user.role, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  // In stateless JWT systems, logout = handled on client
  res.status(200).json({ message: 'Logout successful (client should delete token)' });
};
