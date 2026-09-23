const mongoose = require('mongoose');

const validateCreateDonation = (data) => {
  const errors = [];
  const {
    foodName,
    foodType,
    quantity,
    preparationTime,
    storageMethod,
    pickupLocation,
    pickupDeadline
  } = data;

  if (!foodName || typeof foodName !== 'string' || !foodName.trim()) {
    errors.push('Food name is required.');
  }

  if (!foodType || typeof foodType !== 'string' || !foodType.trim()) {
    errors.push('Food type is required.');
  }

  if (quantity === undefined || quantity === null || typeof quantity !== 'number' || quantity < 1) {
    errors.push('Quantity must be a valid number and at least 1.');
  }

  if (!preparationTime || isNaN(Date.parse(preparationTime))) {
    errors.push('A valid preparation time is required.');
  }

  if (!storageMethod || typeof storageMethod !== 'string' || !storageMethod.trim()) {
    errors.push('Storage method is required.');
  }

  if (!pickupLocation || typeof pickupLocation !== 'string' || !pickupLocation.trim()) {
    errors.push('Pickup location is required.');
  }

  if (!pickupDeadline || isNaN(Date.parse(pickupDeadline))) {
    errors.push('A valid pickup deadline is required.');
  } else if (new Date(pickupDeadline) <= new Date()) {
    errors.push('Pickup deadline must be a future date and time.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUpdateDonation = (data) => {
  const errors = [];
  const { quantity, preparationTime, pickupDeadline } = data;

  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity < 1) {
      errors.push('Quantity must be a valid number and at least 1.');
    }
  }

  if (preparationTime !== undefined) {
    if (isNaN(Date.parse(preparationTime))) {
      errors.push('Preparation time must be a valid date.');
    }
  }

  if (pickupDeadline !== undefined) {
    if (isNaN(Date.parse(pickupDeadline))) {
      errors.push('Pickup deadline must be a valid date.');
    } else if (new Date(pickupDeadline) <= new Date()) {
      errors.push('Pickup deadline must be a future date and time.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = {
  validateCreateDonation,
  validateUpdateDonation,
  isValidObjectId
};
