# ShareBite – Business Rules

## Authentication
- Email is unique.
- Password is hashed with bcrypt.
- Public registration supports donor and NGO.
- Admin is seeded manually.
- Backend enforces roles.

## NGO Verification
New NGO = PENDING.
Only VERIFIED NGO can claim.
REJECTED NGO cannot claim.

## Donation
Only donors create donations.
Required: food name, type, quantity, preparation time, storage method, pickup location, pickup deadline.
Pickup deadline must be future at creation.

## Ownership
Donor can edit/cancel only their own donation.

## Claim
Only VERIFIED NGO can claim.
Only AVAILABLE donation can be claimed.
One donation can have one NGO.
AVAILABLE -> CLAIMED.

The backend claim operation must be atomic.

## Completion
Only claiming NGO can complete.
CLAIMED -> COMPLETED.

## Expiry
If current time passes pickupDeadline while status is AVAILABLE:
AVAILABLE -> EXPIRED.
Expired donations cannot be claimed.

## Cancellation
Donor can cancel AVAILABLE donation.
AVAILABLE -> CANCELLED.

## Smart Expiry
Use simple rule-based logic, not machine learning.
Suggested categories can include prepared meals, bakery items, and packaged food.
Never extend the donor's pickup deadline automatically.

## Priority Score
Simple 0–100 informational score.
Suggested weighting:
- time remaining: 60%
- quantity: 20%
- distance: 20%

If distance is unavailable, omit that factor and document it.

## Impact
For completed donations, show counts and donated quantity.
Do not claim exact meals or carbon savings unless a documented conversion rule exists.
