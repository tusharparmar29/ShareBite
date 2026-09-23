/**
 * Priority Score Service
 *
 * Calculates an informational 0–100 priority score for a donation.
 *
 * Documented weighting from BUSINESS_RULES.md:
 *   - Time remaining until pickupDeadline:  60%
 *   - Quantity of food:                     20%
 *   - Distance (NGO ↔ pickup location):     20%
 *
 * Distance is omitted in V1 because the current data model does not store
 * structured coordinates for donors or NGOs. When distance is unavailable,
 * the 20% weight is redistributed proportionally to the remaining factors
 * so the score still covers 0–100.
 *
 * Without distance:
 *   - Time remaining: 60 / 80 × 100 = 75%
 *   - Quantity:       20 / 80 × 100 = 25%
 *
 * This service NEVER writes to the database.
 * priorityScore in the Donation schema is the field to receive this value
 * when attached to API responses; it is not persisted by this service.
 */

/**
 * Maximum pickup window used to normalize the time-remaining component.
 * Donations created with a deadline beyond this window are treated as
 * full time-score. Adjust if your typical donation window changes.
 * 24 hours is a reasonable upper bound for perishable food.
 */
const MAX_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Maximum quantity used to normalize the quantity component.
 * Donations at or above this quantity receive full quantity-score.
 * Based on a reasonable upper bound for a single food donation event.
 */
const MAX_QUANTITY = 100; // servings / kg / units

/**
 * Calculate the time-remaining score (0–1).
 * Higher remaining time → higher score (more urgent to show to NGOs before it expires).
 *
 * @param {Date|string} pickupDeadline
 * @returns {number} 0.0 – 1.0
 */
const timeScore = (pickupDeadline) => {
  if (!pickupDeadline) return 0;
  const remaining = new Date(pickupDeadline).getTime() - Date.now();
  if (remaining <= 0) return 0;
  // Clamp: deadline within MAX_WINDOW gets proportional score
  return Math.min(remaining / MAX_WINDOW_MS, 1);
};

/**
 * Calculate the quantity score (0–1).
 * More food → higher score (larger impact).
 *
 * @param {number} quantity
 * @returns {number} 0.0 – 1.0
 */
const quantityScore = (quantity) => {
  if (!quantity || quantity <= 0) return 0;
  return Math.min(quantity / MAX_QUANTITY, 1);
};

/**
 * Calculate the overall priority score for a donation.
 *
 * Distance is omitted in V1 (no coordinate data available).
 * Weights are redistributed proportionally:
 *   time:     75%  (60% ÷ 80% × 100)
 *   quantity: 25%  (20% ÷ 80% × 100)
 *
 * @param {Object} donation  Plain donation object or Mongoose doc
 * @returns {number} Integer 0–100
 */
const getPriorityScore = (donation) => {
  const { pickupDeadline, quantity } = donation;

  // Expired or missing deadline — no value in surfacing this donation
  if (!pickupDeadline) return 0;
  if (new Date(pickupDeadline).getTime() <= Date.now()) return 0;

  const tScore = timeScore(pickupDeadline);
  const qScore = quantityScore(quantity);

  // Weighted sum — distance omitted, weights redistributed as documented
  const raw = tScore * 0.75 + qScore * 0.25;

  // Return as integer 0–100
  return Math.round(raw * 100);
};

module.exports = {
  getPriorityScore
};
