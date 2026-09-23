const express = require('express');
const { getUsers, verifyNgo } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Apply admin protection to all admin routes
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.patch('/ngos/:id/verify', verifyNgo);

module.exports = router;
