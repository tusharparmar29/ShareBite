# Database Design

## Collections
Version 1 uses:
1. users
2. donations

Keep the database simple.

## Users
Fields:
- _id
- name
- email
- password
- role
- phone
- address
- city
- profileImage
- isVerified
- createdAt
- updatedAt

Roles:
- donor
- ngo
- admin

NGO verification:
PENDING / VERIFIED / REJECTED

## Donations
Fields:
- _id
- donor
- foodName
- foodType
- quantity
- quantityUnit
- description
- preparationTime
- storageMethod
- pickupLocation
- pickupDeadline
- image
- status
- claimedBy
- claimedAt
- completedAt
- priorityScore
- createdAt
- updatedAt

References:
donor -> users._id
claimedBy -> users._id

## Donation Status
AVAILABLE
CLAIMED
COMPLETED
EXPIRED
CANCELLED

Allowed transitions:
AVAILABLE -> CLAIMED
AVAILABLE -> EXPIRED
AVAILABLE -> CANCELLED
CLAIMED -> COMPLETED

Do not allow completed/cancelled/expired donations to become claimed.

## Indexes
- users.email unique
- donations.status
- donations.pickupDeadline
- donations.donor
- donations.claimedBy

## Claim Safety
The claim operation must atomically find a donation where _id matches and status is AVAILABLE, then set CLAIMED and claimedBy.

If no document is returned, the donation is unavailable or already claimed.

This prevents two NGOs from successfully claiming the same donation.
