/**
 * Smart Expiry Service
 *
 * Calculates a freshness label for a donation based on:
 *   - pickupDeadline  (when the donor requires pickup by)
 *   - foodType        (cooked meal, bakery, packaged, etc.)
 *   - preparationTime (when the food was prepared)
 *   - storageMethod   (hot box, refrigerated, sealed, etc.)
 *
 * Returns one of three display labels:
 *   'Fresh'       – plenty of time remaining
 *   'Pickup Soon' – time is running short
 *   'Expired'     – past the pickup deadline
 *
 * This service NEVER modifies donation.status in the database.
 * The lifecycle status (AVAILABLE, CLAIMED, etc.) is managed separately.
 * This is purely a display/informational calculation.
 */

/**
 * Freshness thresholds (in minutes) per food category.
 *
 * "Pickup Soon" is triggered when remaining time falls below the threshold.
 * Each category reflects how quickly that type of food degrades:
 *
 *   cooked_meal  – spoils fast, short window
 *   bakery       – medium window (day-old is still safe)
 *   packaged     – long shelf life, generous window
 *   default      – fallback for unlisted food types
 */
const PICKUP_SOON_THRESHOLDS_MINUTES = {
  cooked_meal: 120,   // < 2 hours remaining → Pickup Soon
  bakery: 240,        // < 4 hours remaining → Pickup Soon
  packaged: 480,      // < 8 hours remaining → Pickup Soon
  default: 180        // < 3 hours remaining → Pickup Soon (fallback)
};

/**
 * Normalize a raw foodType string to a known category key.
 * Case-insensitive pattern matching on the documented suggestion categories.
 *
 * @param {string} foodType
 * @returns {string} category key
 */
const getFoodCategory = (foodType) => {
  if (!foodType || typeof foodType !== 'string') return 'default';

  const lower = foodType.toLowerCase();

  if (
    lower.includes('cooked') ||
    lower.includes('meal') ||
    lower.includes('rice') ||
    lower.includes('curry') ||
    lower.includes('dal') ||
    lower.includes('prepared')
  ) {
    return 'cooked_meal';
  }

  if (
    lower.includes('bakery') ||
    lower.includes('bread') ||
    lower.includes('biscuit') ||
    lower.includes('cake') ||
    lower.includes('pastry')
  ) {
    return 'bakery';
  }

  if (
    lower.includes('packaged') ||
    lower.includes('sealed') ||
    lower.includes('canned') ||
    lower.includes('dry') ||
    lower.includes('raw produce') ||
    lower.includes('vegetables') ||
    lower.includes('fruits')
  ) {
    return 'packaged';
  }

  return 'default';
};

/**
 * Apply a storage method modifier to the threshold.
 * Refrigerated or sealed storage extends the "fresh" window slightly.
 *
 * @param {number} thresholdMinutes  Base threshold for the food category
 * @param {string} storageMethod
 * @returns {number} Adjusted threshold in minutes
 */
const applyStorageModifier = (thresholdMinutes, storageMethod) => {
  if (!storageMethod || typeof storageMethod !== 'string') return thresholdMinutes;

  const lower = storageMethod.toLowerCase();

  if (lower.includes('refrigerat') || lower.includes('chilled') || lower.includes('cold')) {
    // Cold storage buys more time — raise the threshold so Pickup Soon triggers later
    return Math.round(thresholdMinutes * 0.75);
  }

  if (lower.includes('sealed') || lower.includes('vacuum')) {
    return Math.round(thresholdMinutes * 0.8);
  }

  return thresholdMinutes;
};

/**
 * Calculate the smart expiry label for a donation.
 *
 * @param {Object} donation  Plain donation object (or Mongoose doc)
 * @returns {'Fresh' | 'Pickup Soon' | 'Expired'}
 */
const getExpiryStatus = (donation) => {
  const { pickupDeadline, foodType, storageMethod } = donation;

  if (!pickupDeadline) return 'Expired';

  const now = Date.now();
  const deadlineMs = new Date(pickupDeadline).getTime();
  const remainingMs = deadlineMs - now;

  // Past the pickup deadline — display Expired
  if (remainingMs <= 0) {
    return 'Expired';
  }

  const remainingMinutes = remainingMs / 60000;

  const category = getFoodCategory(foodType);
  const baseThreshold = PICKUP_SOON_THRESHOLDS_MINUTES[category];
  const threshold = applyStorageModifier(baseThreshold, storageMethod);

  return remainingMinutes <= threshold ? 'Pickup Soon' : 'Fresh';
};

module.exports = {
  getExpiryStatus
};
