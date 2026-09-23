const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// @desc    Register a new user (donor or ngo)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegister(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(' ')
      });
    }

    const { name, email, password, role, phone, address, city, profileImage } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Role is strictly restricted to donor or ngo for public registration
    const targetRole = role ? role.toLowerCase() : 'donor';

    // verificationStatus strictly set by backend logic
    const verificationStatus = targetRole === 'ngo' ? 'PENDING' : 'VERIFIED';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: targetRole,
      phone: phone ? String(phone).trim() : '',
      address: address ? String(address).trim() : '',
      city: city ? String(city).trim() : '',
      profileImage: profileImage ? String(profileImage).trim() : '',
      verificationStatus
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLogin(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(' ')
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Explicitly select password field since select: false on schema
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user retrieved successfully',
    data: {
      user: req.user
    }
  });
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
