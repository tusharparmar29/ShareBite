const express = require('express');
const {
  createDonation,
  getDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
  claimDonation,
  completeDonation
} = require('../controllers/donationController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Public / General browsing
router.get('/', getDonations);

// Authenticated user's donations (placed before :id route)
router.get('/my', protect, getMyDonations);

// Specific donation details
router.get('/:id', getDonationById);

// Donor actions: Create, update, cancel
router.post('/', protect, authorize('donor'), createDonation);
router.put('/:id', protect, authorize('donor'), updateDonation);
router.delete('/:id', protect, authorize('donor'), cancelDonation);

// NGO actions: claim and complete pickup
// authorize('ngo') enforces role; verificationStatus checked in controller
router.post('/:id/claim', protect, authorize('ngo'), claimDonation);
router.post('/:id/complete', protect, authorize('ngo'), completeDonation);

module.exports = router;

