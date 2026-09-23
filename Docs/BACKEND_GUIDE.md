# ShareBite – Backend Guide

## Stack
Node.js + Express + Mongoose.

## Structure
Use controllers, routes, middleware, models, services, validators and utils.

## Authentication
- bcrypt
- JWT
- auth middleware
- role middleware
- req.user contains authenticated user

## Validation
Validate email, password, role, quantity, deadline and all required donation fields.

## Claim Logic
Atomically find donation by ID where status = AVAILABLE and update it to CLAIMED with claimedBy and claimedAt.
If nothing updates, return HTTP 409.

## Error Handling
Use centralized error middleware.
Do not expose stack traces, database internals, passwords or tokens.

## Security
Use Helmet, configured CORS, rate limiting, input validation and environment variables.

## Environment
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Only use Cloudinary variables if image upload is enabled.

## Rules
Keep controllers focused.
Put reusable business logic in services.
Do not create unnecessary abstractions.
Keep schemas and APIs understandable.
