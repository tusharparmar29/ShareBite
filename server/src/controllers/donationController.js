const Donation = require('../models/Donation');
const {
  validateCreateDonation,
  validateUpdateDonation,
  isValidObjectId
} = require('../validators/donationValidator');
const { getExpiryStatus } = require('../services/expiryService');


// @desc    Create a new food donation
// @route   POST /api/donations
// @access  Private (Donor only)
const createDonation = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCreateDonation(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(' ')
      });
    }

    const {
      foodName,
      foodType,
      quantity,
      quantityUnit,
      description,
      preparationTime,
      storageMethod,
      pickupLocation,
      pickupDeadline,
      image
    } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      foodName: foodName.trim(),
      foodType: foodType.trim(),
      quantity,
      quantityUnit: quantityUnit ? quantityUnit.trim() : 'servings',
      description: description ? description.trim() : '',
      preparationTime: new Date(preparationTime),
      storageMethod: storageMethod.trim(),
      pickupLocation: pickupLocation.trim(),
      pickupDeadline: new Date(pickupDeadline),
      image: image ? image.trim() : '',
      status: 'AVAILABLE'
    });

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: { donation }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Browse / filter donations
// @route   GET /api/donations
// @access  Public
const getDonations = async (req, res, next) => {
  try {
    const { status, foodType, city, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) {
      query.status = status.toUpperCase();
    }

    if (foodType) {
      query.foodType = { $regex: foodType, $options: 'i' };
    }

    if (city) {
      query.pickupLocation = { $regex: city, $options: 'i' };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;

    const total = await Donation.countDocuments(query);
    const donations = await Donation.find(query)
      .populate('donor', 'name email phone city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Attach dynamically-calculated expiryStatus without writing to DB
    const donationsWithExpiry = donations.map((d) => {
      const obj = d.toObject();
      obj.expiryStatus = getExpiryStatus(d);
      return obj;
    });

    res.status(200).json({
      success: true,
      message: 'Donations retrieved successfully',
      data: {
        donations: donationsWithExpiry,
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

// @desc    Get current user's donations (Donor's own donations or NGO's claimed donations)
// @route   GET /api/donations/my
// @access  Private
const getMyDonations = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'donor') {
      query.donor = req.user._id;
    } else if (req.user.role === 'ngo') {
      query.claimedBy = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admins see all donations
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone city')
      .populate('claimedBy', 'name email phone')
      .sort({ createdAt: -1 });

    const donationsWithExpiry = donations.map((d) => {
      const obj = d.toObject();
      obj.expiryStatus = getExpiryStatus(d);
      return obj;
    });

    res.status(200).json({
      success: true,
      message: 'Your donations retrieved successfully',
      data: { donations: donationsWithExpiry }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation details by ID
// @route   GET /api/donations/:id
// @access  Public / Authenticated
const getDonationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation ID format.'
      });
    }

    const donation = await Donation.findById(id)
      .populate('donor', 'name email phone city')
      .populate('claimedBy', 'name email phone');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation details retrieved successfully',
      data: {
        donation: {
          ...donation.toObject(),
          expiryStatus: getExpiryStatus(donation)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation (Donor owner only)
// @route   PUT /api/donations/:id
// @access  Private (Donor only)
const updateDonation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation ID format.'
      });
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found.'
      });
    }

    // Ownership check: must be the creator
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You do not have permission to update this donation.'
      });
    }

    // Status check: only AVAILABLE donations can be edited
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Cannot update donation. Only AVAILABLE donations can be edited, but status is '${donation.status}'.`
      });
    }

    const { isValid, errors } = validateUpdateDonation(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(' ')
      });
    }

    const updatableFields = [
      'foodName',
      'foodType',
      'quantity',
      'quantityUnit',
      'description',
      'preparationTime',
      'storageMethod',
      'pickupLocation',
      'pickupDeadline',
      'image'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'preparationTime' || field === 'pickupDeadline') {
          donation[field] = new Date(req.body[field]);
        } else if (typeof req.body[field] === 'string') {
          donation[field] = req.body[field].trim();
        } else {
          donation[field] = req.body[field];
        }
      }
    });

    const updatedDonation = await donation.save();

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: { donation: updatedDonation }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel donation (Donor owner only)
// @route   DELETE /api/donations/:id
// @access  Private (Donor only)
const cancelDonation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation ID format.'
      });
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found.'
      });
    }

    // Ownership check
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You do not have permission to cancel this donation.'
      });
    }

    // Status check: only active AVAILABLE can be cancelled
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel donation. Only AVAILABLE donations can be cancelled, but status is '${donation.status}'.`
      });
    }

    donation.status = 'CANCELLED';
    await donation.save();

    res.status(200).json({
      success: true,
      message: 'Donation cancelled successfully',
      data: { donation }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim an AVAILABLE donation (verified NGO only)
// @route   POST /api/donations/:id/claim
// @access  Private (NGO only, verificationStatus === VERIFIED)
const claimDonation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation ID format.'
      });
    }

    // Check NGO verification status — backend enforces, do not trust frontend
    if (req.user.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: `Access forbidden: Your NGO account is '${req.user.verificationStatus}'. Only VERIFIED NGOs can claim donations.`
      });
    }

    // Atomic operation: find ONLY if status is still AVAILABLE and update in one operation.
    // This prevents two NGOs from both reading AVAILABLE then both updating (race condition).
    const claimed = await Donation.findOneAndUpdate(
      { _id: id, status: 'AVAILABLE' },  // filter: must match both conditions atomically
      {
        $set: {
          status: 'CLAIMED',
          claimedBy: req.user._id,
          claimedAt: new Date()
        }
      },
      { new: true }  // return the updated document
    ).populate('donor', 'name email phone city')
     .populate('claimedBy', 'name email phone');

    // If no document was returned, donation either doesn't exist or is no longer AVAILABLE
    if (!claimed) {
      // Check if it actually exists to give a more precise error
      const exists = await Donation.findById(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found.'
        });
      }
      // Exists but status was not AVAILABLE — return 409 Conflict as per API spec
      return res.status(409).json({
        success: false,
        message: `Donation is no longer available. Current status is '${exists.status}'.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation claimed successfully',
      data: { donation: claimed }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete pickup of a CLAIMED donation (only the claiming NGO)
// @route   POST /api/donations/:id/complete
// @access  Private (NGO only)
const completeDonation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation ID format.'
      });
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found.'
      });
    }

    // Must be CLAIMED before it can be completed
    if (donation.status !== 'CLAIMED') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete donation. Status must be 'CLAIMED', but current status is '${donation.status}'.`
      });
    }

    // Only the NGO that claimed this donation can complete it
    if (!donation.claimedBy || donation.claimedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Only the NGO that claimed this donation can mark it as completed.'
      });
    }

    donation.status = 'COMPLETED';
    donation.completedAt = new Date();
    await donation.save();

    await donation.populate('donor', 'name email phone city');
    await donation.populate('claimedBy', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Pickup completed successfully',
      data: { donation }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
  claimDonation,
  completeDonation
};
