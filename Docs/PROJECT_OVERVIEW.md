# ShareBite – Smart Food Redistribution Platform

## Project Goal
ShareBite is a simple MERN web application connecting food donors with verified NGOs so surplus edible food can be offered for pickup instead of being wasted.

Core flow:
Donor posts food -> NGO views donation -> NGO claims -> pickup completed -> impact recorded.

Keep the project simple, reliable, and easy to explain in a college viva.

## User Roles

### Donor
- Register/login
- Create food donation
- View own donations
- Edit/cancel active donations
- See donation status

### NGO
- Register/login
- Browse available donations
- View details
- Claim donation
- Complete pickup

### Admin
- Login
- View users
- Verify NGOs
- View donations
- View basic statistics

## Core Features
- JWT authentication
- Role-based authorization
- Password hashing
- Food donation CRUD
- NGO verification
- Single-claim protection
- Donation status tracking
- Basic dashboards
- Basic impact statistics

## Donation Status
AVAILABLE -> CLAIMED -> COMPLETED

Other possible states:
EXPIRED, CANCELLED

## Unique Features

### Smart Expiry Status
Use simple rules based on food type, preparation time, storage method, and pickup deadline.

Display:
- Fresh
- Pickup Soon
- Expired

### Donation Priority Score
Simple 0–100 rule-based score using:
- Time remaining
- Quantity
- Distance when available

Do not build machine learning.

## Out of Scope for Version 1
- Payments
- Complex AI
- Image recognition
- Live GPS tracking
- Real-time chat
- Microservices
- Kubernetes
- Complex notification infrastructure

## Success Flow
1. Donor registers.
2. Donor logs in.
3. Donor creates donation.
4. NGO registers.
5. Admin verifies NGO.
6. NGO logs in.
7. NGO sees available donation.
8. NGO claims it.
9. Donation becomes CLAIMED.
10. NGO completes pickup.
11. Donation becomes COMPLETED.
12. Dashboard statistics update.
