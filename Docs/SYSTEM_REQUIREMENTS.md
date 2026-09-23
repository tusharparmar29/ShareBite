# System Requirements

## Functional Requirements
- Register and login users.
- Support donor, NGO, and admin roles.
- Hash passwords with bcrypt.
- Protect APIs with JWT.
- Verify NGO accounts before claiming.
- Allow donors to create, edit, and cancel their own donations.
- Allow verified NGOs to browse available donations.
- Allow only one NGO to claim a donation.
- Allow claiming NGO to complete pickup.
- Expire donations after pickup deadline.
- Provide role-specific dashboards.
- Allow admin to verify NGOs and view basic statistics.

## Security
- Never store plain-text passwords.
- Validate request data.
- Perform authorization on the backend.
- Check resource ownership.
- Rate-limit authentication and upload endpoints.
- Never trust frontend role/status values.

## Performance
- Use pagination when donation lists grow.
- Add useful MongoDB indexes.
- Avoid unnecessary API calls.
- Keep responses reasonably small.

## UI
- Responsive design.
- Clear loading states.
- Clear error/success messages.
- Simple role-based navigation.

## Technical Stack
Frontend: React, Vite, React Router, Tailwind CSS, Axios, Recharts
Backend: Node.js, Express, Mongoose, JWT, bcrypt, validation library
Database: MongoDB
Optional storage: Cloudinary
