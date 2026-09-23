# ShareBite – Frontend Guide

## Stack
React + Vite + React Router + Tailwind CSS + Axios + Recharts.

## Pages

Public:
- Landing
- Login
- Register

Donor:
- Dashboard
- Create Donation
- My Donations
- Donation Details
- Profile

NGO:
- Dashboard
- Available Donations
- Donation Details
- My Claims
- Profile

Admin:
- Dashboard
- NGO Verification
- Users
- Donations
- Statistics

## Reusable Components
Navbar, Sidebar, Button, Input, Select, Modal, LoadingSpinner, EmptyState, ErrorState, StatusBadge, DonationCard, ConfirmDialog.

## Dashboard
Donor: active, claimed, completed donations and create button.
NGO: available, claimed, completed and high-priority donations.
Admin: users, pending NGOs, donations, completed donations.

## Donation Card
Show food name, type, quantity, location/city, deadline, expiry status, priority and status.

## UX
- Disable buttons during requests.
- Use local loading indicators/skeletons.
- Do not hide the whole page for small requests.
- Show empty states.
- Confirm destructive actions.
- Use toast feedback.
- Responsive design.

## Data Fetching
Use an API service layer.
Avoid unnecessary repeated requests.
Refresh data after the current user creates, updates, claims or completes an operation.
Do not add polling or WebSockets in Version 1.

## Auth
Use AuthContext or equivalent.
Protected routes improve UX, but backend authorization is the real security boundary.

## Styling
Use Tailwind consistently. Keep animation minimal.
