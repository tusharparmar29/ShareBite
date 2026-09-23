# Folder Structure

## Root
ShareBite/
- client/
- server/
- docs/
- README.md
- .gitignore

## Frontend
client/src/
- assets/
- components/
  - common/
  - donor/
  - ngo/
  - admin/
- context/
- hooks/
- layouts/
- pages/
  - auth/
  - donor/
  - ngo/
  - admin/
- services/
- utils/
- App.jsx
- main.jsx

## Backend
server/src/
- config/
- controllers/
- middlewares/
- models/
- routes/
- services/
- utils/
- validators/
- app.js
- server.js

Initial backend files:
models/User.js
models/Donation.js
controllers/authController.js
controllers/donationController.js
controllers/ngoController.js
controllers/adminController.js
routes/authRoutes.js
routes/donationRoutes.js
routes/ngoRoutes.js
routes/adminRoutes.js
middlewares/authMiddleware.js
middlewares/roleMiddleware.js
middlewares/errorMiddleware.js
middlewares/rateLimitMiddleware.js
services/expiryService.js
services/priorityService.js

Do not create unnecessary folders or files just to make the project look complex.
