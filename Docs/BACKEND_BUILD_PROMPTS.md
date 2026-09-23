# ShareBite – Backend Build Prompts

Use these one at a time.

## Prompt 01 – Backend Setup

Read `/docs` completely.

Create the Express backend according to the documented architecture.

Set up:
- Express
- MongoDB/Mongoose
- environment variables
- basic app/server files
- CORS
- Helmet
- error middleware
- health endpoint

Do not create authentication or donation features yet.

Stop after setup and explain how to run it.

## Prompt 02 – User Model

Build the User model.

Requirements:
- name
- email
- password
- role
- phone
- address
- city
- NGO verification status
- timestamps

Use enums and validation.

Do not build routes yet.

## Prompt 03 – Authentication

Build:
- register
- login
- current user
- logout handling
- JWT middleware
- role middleware
- bcrypt hashing

Follow API specification exactly.

Do not modify unrelated modules.

## Prompt 04 – Donation Model

Build the Donation Mongoose model according to DATABASE_DESIGN.md.

Add:
- donor reference
- food information
- quantity
- preparation/storage
- pickup information
- image
- status
- claimedBy
- timestamps
- priorityScore

Add documented indexes.

## Prompt 05 – Donation CRUD

Build donor donation APIs.

Implement:
- create
- list
- details
- update
- cancel

Enforce ownership.

Validate input.

## Prompt 06 – NGO Verification

Build admin NGO verification.

Admin can:
- list users
- see pending NGOs
- verify
- reject

Follow BUSINESS_RULES.md.

## Prompt 07 – Claim

Build the claim endpoint.

Requirements:
- authenticated NGO
- NGO must be VERIFIED
- donation must be AVAILABLE
- atomic update
- save claimedBy
- save claimedAt
- return 409 if unavailable

Do not use a simple read-then-update approach that creates a race condition.

## Prompt 08 – Complete Pickup

Build completion endpoint.

Only the NGO that claimed the donation can complete it.

CLAIMED -> COMPLETED.

## Prompt 09 – Smart Expiry

Build a small expiry service.

Use:
- food type
- storage method
- preparation time
- pickup deadline

Return:
- Fresh
- Pickup Soon
- Expired

Never extend pickupDeadline.

## Prompt 10 – Priority Score

Build a simple rule-based priority service.

Use:
- time remaining
- quantity
- optional distance

Return 0–100.

Keep it understandable.

## Prompt 11 – Backend Tests

Test:
- registration
- login
- protected route
- donor ownership
- NGO verification
- donation creation
- claim protection
- completion authorization
- expiry
- invalid input

Fix only verified problems.
