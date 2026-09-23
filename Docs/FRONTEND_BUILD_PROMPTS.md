# ShareBite – Frontend Build Prompts

Run these after the backend APIs are stable.

## Prompt 01 – Frontend Setup

Read `/docs` completely.

Create the React/Vite frontend.

Set up:
- React Router
- Tailwind
- Axios service layer
- basic layout
- environment configuration

Do not build dashboards yet.

## Prompt 02 – Auth State

Build authentication state.

Requirements:
- login
- register
- logout
- current user
- protected routes
- role-based navigation

Keep the implementation simple.

## Prompt 03 – Shared UI

Create reusable:
- Button
- Input
- Select
- Modal
- LoadingSpinner
- EmptyState
- ErrorState
- StatusBadge
- DonationCard
- ConfirmDialog

Keep components reusable but not over-engineered.

## Prompt 04 – Donor Dashboard

Build:
- dashboard summary
- my donations
- create donation
- edit donation
- cancel donation
- donation status

Use documented API endpoints.

## Prompt 05 – NGO Dashboard

Build:
- available donations
- donation details
- claim
- claimed donations
- complete pickup
- completed history

Only show claim controls to verified NGOs.

## Prompt 06 – Admin Dashboard

Build:
- user list
- pending NGO verification
- verify/reject actions
- donation list
- basic statistics

## Prompt 07 – Expiry and Priority UI

Display:
- Fresh / Pickup Soon / Expired
- Normal / High / Urgent

Do not make the UI responsible for security decisions.

## Prompt 08 – UX Improvement

Review the application for:
- unnecessary full-page loaders
- duplicate API requests
- missing empty states
- unclear errors
- disabled states
- mobile layout

Make only practical improvements.

Do not add new features.

## Prompt 09 – Frontend Testing

Test:
- registration
- login
- role navigation
- donor CRUD
- NGO claim
- completion
- admin verification
- logout
- unauthorized access
