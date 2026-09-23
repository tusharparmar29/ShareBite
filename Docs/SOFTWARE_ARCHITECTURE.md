# Software Architecture

## Architecture
React Frontend
    |
    | REST API / HTTP
    v
Node.js + Express Backend
    |
    v
MongoDB

Optional: Cloudinary for food images.

## Frontend
Responsible for pages, forms, navigation, auth state, API calls, dashboards, tables/cards, charts, and UI states.

The frontend must not be treated as the security boundary.

## Backend
Responsible for authentication, authorization, validation, business rules, donation status changes, claim logic, database operations, and centralized errors.

The backend is the source of truth.

## Claim Request Flow
React
-> POST /api/donations/:id/claim
-> JWT middleware
-> NGO role/verification check
-> Donation controller/service
-> Check AVAILABLE status
-> Set CLAIMED + claimedBy
-> MongoDB
-> Response
-> React updates UI

## Authentication Flow
Register:
Frontend -> validate -> backend -> hash password -> save user

Login:
Frontend -> backend -> verify password -> create JWT -> return token/user

Protected request:
Frontend -> Authorization header -> JWT middleware -> request user -> controller

## Backend Responsibilities
Controllers: HTTP operations
Models: MongoDB schemas
Middleware: authentication/authorization/errors
Services: reusable business logic
Utils: small reusable calculations
Validators: input validation

Do not put all logic in routes.

## Response Format
Success:
{
  "success": true,
  "message": "Donation claimed successfully",
  "data": {}
}

Error:
{
  "success": false,
  "message": "Donation is no longer available"
}
