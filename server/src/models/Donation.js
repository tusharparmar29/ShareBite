const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required'],
      index: true
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [120, 'Food name cannot exceed 120 characters']
    },
    foodType: {
      type: String,
      required: [true, 'Food type is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    quantityUnit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      trim: true,
      default: 'servings'
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    preparationTime: {
      type: Date,
      required: [true, 'Preparation time is required']
    },
    storageMethod: {
      type: String,
      required: [true, 'Storage method is required'],
      trim: true
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true
    },
    pickupDeadline: {
      type: Date,
      required: [true, 'Pickup deadline is required'],
      index: true
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['AVAILABLE', 'CLAIMED', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
        message: '{VALUE} is not a valid donation status'
      },
      default: 'AVAILABLE',
      index: true
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    claimedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    priorityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

// Explicit compound index for fast active discovery queries (status + pickupDeadline)
donationSchema.index({ status: 1, pickupDeadline: 1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
