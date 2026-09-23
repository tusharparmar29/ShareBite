const User = require('../models/User');
const { isValidObjectId } = require('../validators/donationValidator');

// @desc    Get all users with optional filtering (e.g. pending NGOs)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { role, verificationStatus, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) {
      query.role = role.toLowerCase();
    }

    if (verificationStatus) {
      query.verificationStatus = verificationStatus.toUpperCase();
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          pages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject an NGO account
// @route   PATCH /api/admin/ngos/:id/verify
// @access  Private (Admin only)
const verifyNgo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.'
      });
    }

    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Status is required and must be 'VERIFIED' or 'REJECTED'."
      });
    }

    const normalizedStatus = status.toUpperCase().trim();
    if (!['VERIFIED', 'REJECTED'].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status. Allowed values are 'VERIFIED' or 'REJECTED'."
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.role !== 'ngo') {
      return res.status(400).json({
        success: false,
        message: `Cannot verify account: User role is '${user.role}', not 'ngo'. Only NGO accounts can be verified or rejected.`
      });
    }

    user.verificationStatus = normalizedStatus;
    await user.save();

    res.status(200).json({
      success: true,
      message: `NGO verification status updated to '${normalizedStatus}' successfully.`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  verifyNgo
};
