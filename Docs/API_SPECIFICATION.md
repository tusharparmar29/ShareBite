# ShareBite – API Specification
Base URL: /api
Protected endpoints use Authorization: Bearer <token>.

## Auth
POST /auth/register — create donor or NGO account.
POST /auth/login — login.
GET /auth/me — current user.
POST /auth/logout — client-side token removal.

## Donations
POST /donations — donor creates donation.
GET /donations — browse/filter donations.
GET /donations/:id — donation details.
PUT /donations/:id — donor owner updates donation.
DELETE /donations/:id — donor owner cancels active donation.
POST /donations/:id/claim — verified NGO claims AVAILABLE donation.
POST /donations/:id/complete — claiming NGO completes pickup.
GET /donations/my — donor own donations or NGO claims.

Useful query parameters:
status, foodType, city, page, limit.

## Admin
GET /admin/users
PATCH /admin/ngos/:id/verify
GET /admin/donations
GET /admin/stats

NGO verification body:
{ "status": "VERIFIED" }

## Response format
Success:
{ "success": true, "message": "...", "data": {} }

Error:
{ "success": false, "message": "..." }

Use 200, 201, 400, 401, 403, 404, 409 and 500 appropriately.

Do not create undocumented endpoints without a real requirement.
