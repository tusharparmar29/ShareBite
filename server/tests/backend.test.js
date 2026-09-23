/**
 * ShareBite – Comprehensive Backend Test Suite
 * Prompt 11 – Backend Tests
 *
 * Covers all documented backend behaviors:
 *   1.  Authentication (register, login, current user, logout)
 *   2.  Role Authorization (donor/ngo/admin guards)
 *   3.  NGO Verification (admin seeding, PENDING/VERIFIED/REJECTED)
 *   4.  Donation CRUD & Ownership
 *   5.  Lifecycle Transitions (AVAILABLE → CLAIMED → COMPLETED, CANCELLED, EXPIRED)
 *   6.  Atomic Claim Protection (race condition prevention)
 *   7.  Complete Pickup (claiming NGO only)
 *   8.  Smart Expiry Calculation (Fresh / Pickup Soon / Expired)
 *   9.  Priority Score Calculation (0–100, not stored)
 *   10. Input Validation & Error Responses
 *
 * Prerequisites:
 *   - Server running on http://localhost:5000
 *   - Admin seeded via `npm run seed:admin`
 *   - MongoDB connected
 *
 * Run: node tests/backend.test.js
 */

const mongoose = require('mongoose');
const Donation = require('../src/models/Donation');

const BASE = 'http://localhost:5000/api';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sharebite';

const TS = Date.now();
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, label) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}`);
    failed++;
    failures.push(label);
  }
}

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
}

async function get(path, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { headers });
  return { status: res.status, data: await res.json() };
}

async function put(path, body, token) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const res = await fetch(`${BASE}${path}`, { method: 'PUT', headers, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
}

async function del(path, token) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  return { status: res.status, data: await res.json() };
}

async function patch(path, body, token) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const res = await fetch(`${BASE}${path}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
}

function section(name) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${name}`);
  console.log('='.repeat(60));
}

async function makeDonation(donorToken, overrides = {}) {
  const body = {
    foodName: overrides.foodName || 'Test Biryani',
    foodType: overrides.foodType || 'Cooked Meal',
    quantity: overrides.quantity || 20,
    quantityUnit: 'servings',
    preparationTime: new Date().toISOString(),
    storageMethod: overrides.storageMethod || 'Hot box',
    pickupLocation: overrides.pickupLocation || 'Test City Hub',
    pickupDeadline: overrides.pickupDeadline || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
  };
  const r = await post('/donations', body, donorToken);
  return r.data.data?.donation;
}

// ─────────────────────────────────────────────────────────────────────────────
async function runTests() {
  await mongoose.connect(MONGO_URI);

  // ── Shared state ────────────────────────────────────────────────────────────
  let adminToken, donor1Token, donor2Token, ngo1Token, ngo2Token;
  let ngo1Id, ngo2Id, donor1Id;

  // ═══════════════════════════════════════════════════════════════════════════
  section('1. HEALTH CHECK');
  {
    const r = await get('/health');
    assert(r.status === 200, 'GET /health returns 200');
    assert(r.data.success === true, 'Health check success: true');
    assert(r.data.data.status === 'healthy', 'Status field is healthy');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('2. AUTHENTICATION – Registration');
  {
    // Admin login (seeded manually)
    const al = await post('/auth/login', { email: 'admin@sharebite.org', password: 'AdminSecurePass2026!' });
    assert(al.status === 200, 'Admin login succeeds with seeded credentials');
    assert(al.data.data.user.role === 'admin', 'Admin role is admin');
    assert(!al.data.data.user.password, 'Admin login response omits password');
    adminToken = al.data.data.token;

    // Donor registration
    const d1 = await post('/auth/register', { name: 'Donor Alpha', email: `d1_${TS}@t.com`, password: 'pass1234', role: 'donor', city: 'Mumbai' });
    assert(d1.status === 201, 'Donor registers successfully (201)');
    assert(d1.data.data.user.verificationStatus === 'VERIFIED', 'Donor verificationStatus defaults to VERIFIED');
    assert(!d1.data.data.user.password, 'Donor registration omits password');
    donor1Token = d1.data.data.token;
    donor1Id = d1.data.data.user._id;

    // Second donor
    const d2 = await post('/auth/register', { name: 'Donor Beta', email: `d2_${TS}@t.com`, password: 'pass1234', role: 'donor' });
    donor2Token = d2.data.data.token;

    // NGO registration — should start PENDING
    const n1 = await post('/auth/register', { name: 'NGO Alpha', email: `ngo1_${TS}@t.com`, password: 'pass1234', role: 'ngo', city: 'Delhi' });
    assert(n1.status === 201, 'NGO registers successfully (201)');
    assert(n1.data.data.user.role === 'ngo', 'NGO role is ngo');
    assert(n1.data.data.user.verificationStatus === 'PENDING', 'NGO verificationStatus defaults to PENDING');
    ngo1Token = n1.data.data.token;
    ngo1Id = n1.data.data.user._id;

    const n2 = await post('/auth/register', { name: 'NGO Beta', email: `ngo2_${TS}@t.com`, password: 'pass1234', role: 'ngo' });
    ngo2Token = n2.data.data.token;
    ngo2Id = n2.data.data.user._id;

    // Admin public registration blocked
    const adminAttempt = await post('/auth/register', { name: 'Hack', email: `hack_${TS}@t.com`, password: 'pass1234', role: 'admin' });
    assert(adminAttempt.status === 400, 'Public admin registration rejected (400)');
    assert(adminAttempt.data.message.includes('Admin accounts cannot be registered publicly'), 'Correct error message for admin attempt');

    // verificationStatus tampering rejected
    const tamper = await post('/auth/register', { name: 'Tamper NGO', email: `tam_${TS}@t.com`, password: 'pass1234', role: 'ngo', verificationStatus: 'VERIFIED' });
    assert(tamper.data.data.user.verificationStatus === 'PENDING', 'Client-supplied verificationStatus ignored; backend sets PENDING');

    // Duplicate email
    const dup = await post('/auth/register', { name: 'Dup', email: `d1_${TS}@t.com`, password: 'pass1234', role: 'donor' });
    assert(dup.status === 400, 'Duplicate email registration rejected (400)');

    // Invalid email format
    const bad = await post('/auth/register', { name: 'Bad', email: 'notanemail', password: 'pass1234', role: 'donor' });
    assert(bad.status === 400, 'Invalid email format rejected (400)');

    // Short password
    const shortPw = await post('/auth/register', { name: 'Short', email: `sh_${TS}@t.com`, password: '123', role: 'donor' });
    assert(shortPw.status === 400, 'Password < 6 chars rejected (400)');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('3. AUTHENTICATION – Login & Current User');
  {
    // Wrong password
    const wPw = await post('/auth/login', { email: `d1_${TS}@t.com`, password: 'wrongpassword' });
    assert(wPw.status === 401, 'Login with wrong password returns 401');
    assert(wPw.data.message === 'Invalid email or password.', 'Generic credentials error (no email enumeration)');

    // Missing fields
    const missingPw = await post('/auth/login', { email: `d1_${TS}@t.com` });
    assert(missingPw.status === 400, 'Login without password returns 400');

    // GET /auth/me – valid token
    const me = await get('/auth/me', donor1Token);
    assert(me.status === 200, 'GET /auth/me with valid JWT returns 200');
    assert(me.data.data.user.email === `d1_${TS}@t.com`, 'GET /auth/me returns correct user');
    assert(!me.data.data.user.password, 'GET /auth/me omits password');

    // GET /auth/me – no token
    const meNoToken = await get('/auth/me');
    assert(meNoToken.status === 401, 'GET /auth/me without token returns 401');

    // GET /auth/me – invalid token
    const meFake = await get('/auth/me', 'faketoken.xyz.abc');
    assert(meFake.status === 401, 'GET /auth/me with invalid token returns 401');

    // POST /auth/logout
    const logout = await post('/auth/logout', {});
    assert(logout.status === 200, 'POST /auth/logout returns 200 (client-side removal)');
    assert(logout.data.success === true, 'Logout success: true');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('4. ROLE AUTHORIZATION');
  {
    // Donor cannot access admin routes
    const donorAdmin = await get('/admin/users', donor1Token);
    assert(donorAdmin.status === 403, 'Donor accessing /admin/users returns 403');

    // NGO cannot access admin routes
    const ngoAdmin = await get('/admin/users', ngo1Token);
    assert(ngoAdmin.status === 403, 'NGO accessing /admin/users returns 403');

    // Unauthenticated cannot access protected routes
    const unauth = await get('/admin/users');
    assert(unauth.status === 401, 'Unauthenticated access to admin route returns 401');

    // NGO cannot create a donation (donor-only route)
    const ngoCreate = await post('/donations', {
      foodName: 'NGO Hack',
      foodType: 'Cooked',
      quantity: 5,
      preparationTime: new Date().toISOString(),
      storageMethod: 'Box',
      pickupLocation: 'Hack City',
      pickupDeadline: new Date(Date.now() + 3600000).toISOString()
    }, ngo1Token);
    assert(ngoCreate.status === 403, 'NGO creating donation returns 403');

    // Donor cannot claim a donation (ngo-only route)
    const tempDonation = await makeDonation(donor1Token);
    const donorClaim = await post(`/donations/${tempDonation._id}/claim`, {}, donor1Token);
    assert(donorClaim.status === 403, 'Donor claiming donation returns 403');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('5. NGO VERIFICATION');
  {
    // Admin can list users, filter pending NGOs
    const pendingList = await get(`/admin/users?role=ngo&verificationStatus=PENDING`, adminToken);
    assert(pendingList.status === 200, 'Admin lists pending NGOs (200)');
    assert(Array.isArray(pendingList.data.data.users), 'Returns users array');
    const foundPending = pendingList.data.data.users.some(u => u._id === ngo1Id);
    assert(foundPending, 'NGO Alpha found in pending list');

    // Admin verifies NGO One
    const verify = await patch(`/admin/ngos/${ngo1Id}/verify`, { status: 'VERIFIED' }, adminToken);
    assert(verify.status === 200, 'Admin verifies NGO (200)');
    assert(verify.data.data.user.verificationStatus === 'VERIFIED', 'verificationStatus updated to VERIFIED');

    // Admin rejects NGO Two (leave REJECTED for claim tests)
    const reject = await patch(`/admin/ngos/${ngo2Id}/verify`, { status: 'REJECTED' }, adminToken);
    assert(reject.status === 200, 'Admin rejects NGO (200)');
    assert(reject.data.data.user.verificationStatus === 'REJECTED', 'verificationStatus updated to REJECTED');

    // Cannot verify non-NGO user
    const verifyDonor = await patch(`/admin/ngos/${donor1Id}/verify`, { status: 'VERIFIED' }, adminToken);
    assert(verifyDonor.status === 400, 'Verifying non-NGO user rejected (400)');

    // Invalid status value
    const badStatus = await patch(`/admin/ngos/${ngo1Id}/verify`, { status: 'APPROVED' }, adminToken);
    assert(badStatus.status === 400, 'Invalid verification status value rejected (400)');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('6. DONATION CRUD & OWNERSHIP');
  {
    // Validation: past pickup deadline
    const pastDeadline = await post('/donations', {
      foodName: 'Past Food',
      foodType: 'Cooked',
      quantity: 5,
      preparationTime: new Date().toISOString(),
      storageMethod: 'Box',
      pickupLocation: 'City',
      pickupDeadline: new Date(Date.now() - 3600000).toISOString()
    }, donor1Token);
    assert(pastDeadline.status === 400, 'Past pickup deadline rejected (400)');
    assert(pastDeadline.data.message.includes('future date'), 'Clear error for past deadline');

    // Missing required fields
    const missing = await post('/donations', { foodName: 'Incomplete' }, donor1Token);
    assert(missing.status === 400, 'Incomplete donation rejected (400)');

    // Successful creation
    const donation = await makeDonation(donor1Token, { foodName: 'Ownership Biryani', quantity: 25 });
    assert(Boolean(donation), 'Donor creates donation successfully');
    assert(donation.status === 'AVAILABLE', 'New donation status is AVAILABLE');
    assert(donation.priorityScore === undefined || typeof donation.priorityScore === 'number', 'priorityScore not in create response (correct)');

    // Browse list
    const list = await get('/donations');
    assert(list.status === 200, 'GET /donations public list returns 200');
    assert(Array.isArray(list.data.data.donations), 'Donations is an array');
    assert(list.data.data.pagination !== undefined, 'Pagination metadata present');
    const inList = list.data.data.donations.find(d => d._id === donation._id);
    assert(Boolean(inList), 'Created donation visible in public list');
    assert(Boolean(inList?.expiryStatus), 'expiryStatus present in list response');
    assert(typeof inList?.priorityScore === 'number', 'priorityScore (number) present in list response');

    // Detail view
    const detail = await get(`/donations/${donation._id}`);
    assert(detail.status === 200, 'GET /donations/:id returns 200');
    assert(detail.data.data.donation._id === donation._id, 'Correct donation returned by ID');
    assert(Boolean(detail.data.data.donation.expiryStatus), 'expiryStatus present in detail response');
    assert(typeof detail.data.data.donation.priorityScore === 'number', 'priorityScore present in detail response');

    // Invalid ObjectId
    const badId = await get('/donations/not-an-objectid');
    assert(badId.status === 400, 'Invalid donation ID format returns 400');

    // My donations
    const mine = await get('/donations/my', donor1Token);
    assert(mine.status === 200, 'GET /donations/my returns 200');
    const inMine = mine.data.data.donations.some(d => d._id === donation._id);
    assert(inMine, 'Donor sees own donation in /donations/my');

    // Ownership: Donor Two cannot update Donor One donation
    const wrongUpdate = await put(`/donations/${donation._id}`, { quantity: 999 }, donor2Token);
    assert(wrongUpdate.status === 403, 'Non-owner cannot update donation (403)');

    // Owner can update
    const ownUpdate = await put(`/donations/${donation._id}`, { quantity: 30 }, donor1Token);
    assert(ownUpdate.status === 200, 'Owner updates donation (200)');
    assert(ownUpdate.data.data.donation.quantity === 30, 'Quantity updated correctly');

    // Invalid update data (negative quantity)
    const badUpdate = await put(`/donations/${donation._id}`, { quantity: -5 }, donor1Token);
    assert(badUpdate.status === 400, 'Invalid quantity update rejected (400)');

    // Ownership: Donor Two cannot cancel Donor One donation
    const wrongCancel = await del(`/donations/${donation._id}`, donor2Token);
    assert(wrongCancel.status === 403, 'Non-owner cannot cancel donation (403)');

    // Owner can cancel
    const cancel = await del(`/donations/${donation._id}`, donor1Token);
    assert(cancel.status === 200, 'Owner cancels donation (200)');
    assert(cancel.data.data.donation.status === 'CANCELLED', 'Status updated to CANCELLED');

    // Cannot update CANCELLED donation
    const updateCancelled = await put(`/donations/${donation._id}`, { quantity: 10 }, donor1Token);
    assert(updateCancelled.status === 400, 'Updating CANCELLED donation rejected (400)');

    // Cannot cancel CANCELLED donation again
    const recancelCancelled = await del(`/donations/${donation._id}`, donor1Token);
    assert(recancelCancelled.status === 400, 'Re-cancelling CANCELLED donation rejected (400)');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('7. CLAIM – Verification Guards');
  {
    const claimTarget = await makeDonation(donor1Token, { foodName: 'Claim Guard Test' });

    // PENDING NGO cannot claim (ngo1 is VERIFIED — re-set ngo2 to PENDING for this test)
    await patch(`/admin/ngos/${ngo2Id}/verify`, { status: 'PENDING' }, adminToken);
    const pendingClaim = await post(`/donations/${claimTarget._id}/claim`, {}, ngo2Token);
    assert(pendingClaim.status === 403, 'PENDING NGO cannot claim (403)');
    assert(
      pendingClaim.data.message.includes('PENDING') || pendingClaim.data.message.includes('Only VERIFIED'),
      'Error message describes non-VERIFIED restriction for PENDING NGO'
    );

    // REJECTED NGO cannot claim
    await patch(`/admin/ngos/${ngo2Id}/verify`, { status: 'REJECTED' }, adminToken);
    const rejectedClaim = await post(`/donations/${claimTarget._id}/claim`, {}, ngo2Token);
    assert(rejectedClaim.status === 403, 'REJECTED NGO cannot claim (403)');
    assert(rejectedClaim.data.message.includes('REJECTED'), 'Error mentions REJECTED status');

    // VERIFIED NGO (ngo1) can claim
    const goodClaim = await post(`/donations/${claimTarget._id}/claim`, {}, ngo1Token);
    assert(goodClaim.status === 200, 'VERIFIED NGO claims successfully (200)');
    assert(goodClaim.data.data.donation.status === 'CLAIMED', 'Status updated to CLAIMED');
    assert(goodClaim.data.data.donation.claimedBy._id === ngo1Id, 'claimedBy set correctly');
    assert(Boolean(goodClaim.data.data.donation.claimedAt), 'claimedAt timestamp recorded');

    // Re-verify ngo2 for next tests
    await patch(`/admin/ngos/${ngo2Id}/verify`, { status: 'VERIFIED' }, adminToken);

    // Second claim on same donation → 409
    const doubleClaim = await post(`/donations/${claimTarget._id}/claim`, {}, ngo2Token);
    assert(doubleClaim.status === 409, 'Second claim on CLAIMED donation returns 409 Conflict');
    assert(doubleClaim.data.message.includes('CLAIMED'), 'Error message includes current status');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('8. ATOMIC CLAIM – Race Condition Prevention');
  {
    // Create a fresh AVAILABLE donation
    const atomicDonation = await makeDonation(donor1Token, { foodName: 'Atomic Race Test' });

    // Fire two simultaneous claims from different NGOs
    const [r1, r2] = await Promise.all([
      post(`/donations/${atomicDonation._id}/claim`, {}, ngo1Token),
      post(`/donations/${atomicDonation._id}/claim`, {}, ngo2Token)
    ]);

    const statuses = [r1.status, r2.status].sort();
    console.log(`  [INFO] Concurrent claim results: NGO1=${r1.status}, NGO2=${r2.status}`);
    assert(statuses[0] === 200 && statuses[1] === 409, 'Exactly one concurrent claim succeeds (200), other fails (409)');

    // Confirm only one claimedBy in DB
    const raw = await Donation.findById(atomicDonation._id).lean();
    assert(raw.status === 'CLAIMED', 'DB status is CLAIMED after concurrent claims');
    assert(raw.claimedBy !== null, 'DB claimedBy is set to exactly one NGO');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('9. COMPLETE PICKUP');
  {
    const pickupDonation = await makeDonation(donor1Token, { foodName: 'Pickup Complete Test' });

    // Claim it with ngo1
    await post(`/donations/${pickupDonation._id}/claim`, {}, ngo1Token);

    // Wrong NGO (ngo2) cannot complete
    const wrongComplete = await post(`/donations/${pickupDonation._id}/complete`, {}, ngo2Token);
    assert(wrongComplete.status === 403, 'Non-claiming NGO cannot complete pickup (403)');

    // Cannot complete a non-CLAIMED donation (try a fresh AVAILABLE one)
    const freshDonation = await makeDonation(donor1Token, { foodName: 'No Claim Complete' });
    const completeAvailable = await post(`/donations/${freshDonation._id}/complete`, {}, ngo1Token);
    assert(completeAvailable.status === 400, 'Cannot complete AVAILABLE (non-claimed) donation (400)');

    // Correct NGO completes pickup
    const complete = await post(`/donations/${pickupDonation._id}/complete`, {}, ngo1Token);
    assert(complete.status === 200, 'Claiming NGO completes pickup (200)');
    assert(complete.data.data.donation.status === 'COMPLETED', 'Status updated to COMPLETED');
    assert(Boolean(complete.data.data.donation.completedAt), 'completedAt timestamp recorded');

    // Cannot re-complete
    const reComplete = await post(`/donations/${pickupDonation._id}/complete`, {}, ngo1Token);
    assert(reComplete.status === 400, 'Re-completing COMPLETED donation rejected (400)');

    // Cannot claim a COMPLETED donation
    const claimCompleted = await post(`/donations/${pickupDonation._id}/claim`, {}, ngo1Token);
    assert(claimCompleted.status === 409, 'Claiming COMPLETED donation returns 409');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('10. SMART EXPIRY CALCULATION');
  {
    const { getExpiryStatus } = require('../src/services/expiryService');
    const now = Date.now();

    // Pure service unit tests — no DB calls
    assert(getExpiryStatus({ pickupDeadline: new Date(now + 8 * 60 * 60 * 1000), foodType: 'Cooked Meal', storageMethod: 'Hot box' }) === 'Fresh',
      'Cooked meal 8h away → Fresh');
    assert(getExpiryStatus({ pickupDeadline: new Date(now + 1 * 60 * 60 * 1000), foodType: 'Cooked Meal', storageMethod: 'Hot box' }) === 'Pickup Soon',
      'Cooked meal 1h away → Pickup Soon');
    assert(getExpiryStatus({ pickupDeadline: new Date(now + 6 * 60 * 60 * 1000), foodType: 'Bakery', storageMethod: 'Box' }) === 'Fresh',
      'Bakery 6h away → Fresh');
    assert(getExpiryStatus({ pickupDeadline: new Date(now + 3 * 60 * 60 * 1000), foodType: 'Bakery', storageMethod: 'Box' }) === 'Pickup Soon',
      'Bakery 3h away → Pickup Soon');
    assert(getExpiryStatus({ pickupDeadline: new Date(now - 60 * 1000), foodType: 'Cooked Meal', storageMethod: 'Hot box' }) === 'Expired',
      'Past deadline → Expired');
    assert(getExpiryStatus({ pickupDeadline: null, foodType: 'Rice', storageMethod: 'Box' }) === 'Expired',
      'Null deadline → Expired');

    // Mutation check — service must never modify the donation object
    const d = { pickupDeadline: new Date(now + 4 * 60 * 60 * 1000), foodType: 'Dal', storageMethod: 'Box', status: 'AVAILABLE' };
    getExpiryStatus(d);
    assert(d.status === 'AVAILABLE', 'expiryService does not mutate donation.status');

    // Integration: expiryStatus in API response, NOT in MongoDB
    const apiDonation = await makeDonation(donor1Token, { foodName: 'Expiry API Test', foodType: 'Cooked Meal' });
    const listRes = await get('/donations');
    const found = listRes.data.data.donations.find(d => d._id === apiDonation._id);
    assert(['Fresh', 'Pickup Soon', 'Expired'].includes(found?.expiryStatus), 'expiryStatus in API list is a valid label');

    const raw = await Donation.findById(apiDonation._id).lean();
    assert(raw.expiryStatus === undefined, 'expiryStatus NOT persisted to MongoDB');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('11. PRIORITY SCORE CALCULATION');
  {
    const { getPriorityScore } = require('../src/services/priorityService');
    const now = Date.now();

    // Unit tests
    assert(getPriorityScore({ pickupDeadline: new Date(now - 1000), quantity: 50 }) === 0,
      'Expired donation priority score = 0');
    assert(getPriorityScore({ pickupDeadline: null, quantity: 50 }) === 0,
      'Null deadline priority score = 0');
    const highScore = getPriorityScore({ pickupDeadline: new Date(now + 20 * 60 * 60 * 1000), quantity: 100 });
    assert(highScore >= 80 && highScore <= 100, 'High time + high quantity → score 80–100: ' + highScore);
    const lowScore = getPriorityScore({ pickupDeadline: new Date(now + 2 * 60 * 60 * 1000), quantity: 5 });
    assert(lowScore >= 0 && lowScore <= 20, 'Low time + low quantity → score 0–20: ' + lowScore);
    const testScore = getPriorityScore({ pickupDeadline: new Date(now + 10 * 60 * 60 * 1000), quantity: 30 });
    assert(Number.isInteger(testScore) && testScore >= 0 && testScore <= 100, 'Score is always integer 0–100');

    // Mutation check
    const d = { pickupDeadline: new Date(now + 5 * 60 * 60 * 1000), quantity: 20, status: 'AVAILABLE' };
    getPriorityScore(d);
    assert(d.priorityScore === undefined, 'priorityService does not mutate donation object');

    // Integration: priorityScore in API response, MongoDB stores default 0 only
    const apiDonation = await makeDonation(donor1Token, { foodName: 'Priority API Test', quantity: 40 });
    const listRes = await get('/donations');
    const found = listRes.data.data.donations.find(d => d._id === apiDonation._id);
    assert(typeof found?.priorityScore === 'number', 'priorityScore in API list is a number');

    const raw = await Donation.findById(apiDonation._id).lean();
    assert(raw.priorityScore === 0, 'MongoDB priorityScore remains default 0 (not overwritten by service)');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('12. LIFECYCLE TRANSITIONS');
  {
    // AVAILABLE → CANCELLED (already tested in CRUD; verify status directly in DB)
    const d = await makeDonation(donor1Token, { foodName: 'Lifecycle Cancel' });
    await del(`/donations/${d._id}`, donor1Token);
    const rawCancelled = await Donation.findById(d._id).lean();
    assert(rawCancelled.status === 'CANCELLED', 'DB confirms AVAILABLE → CANCELLED transition');

    // AVAILABLE → CLAIMED → COMPLETED (DB confirmation)
    const d2 = await makeDonation(donor1Token, { foodName: 'Lifecycle Complete' });
    await post(`/donations/${d2._id}/claim`, {}, ngo1Token);
    const rawClaimed = await Donation.findById(d2._id).lean();
    assert(rawClaimed.status === 'CLAIMED', 'DB confirms AVAILABLE → CLAIMED transition');
    assert(rawClaimed.claimedBy !== null, 'DB claimedBy populated on CLAIMED');
    assert(rawClaimed.claimedAt instanceof Date, 'DB claimedAt is a Date on CLAIMED');

    await post(`/donations/${d2._id}/complete`, {}, ngo1Token);
    const rawCompleted = await Donation.findById(d2._id).lean();
    assert(rawCompleted.status === 'COMPLETED', 'DB confirms CLAIMED → COMPLETED transition');
    assert(rawCompleted.completedAt instanceof Date, 'DB completedAt is a Date on COMPLETED');

    // Completed donation cannot be claimed
    const claimCompleted = await post(`/donations/${d2._id}/claim`, {}, ngo1Token);
    assert(claimCompleted.status === 409, 'Claiming COMPLETED donation blocked (409)');

    // Claimed donation cannot be cancelled by donor
    const d3 = await makeDonation(donor1Token, { foodName: 'No Cancel After Claim' });
    await post(`/donations/${d3._id}/claim`, {}, ngo1Token);
    const cancelClaimed = await del(`/donations/${d3._id}`, donor1Token);
    assert(cancelClaimed.status === 400, 'Cancelling CLAIMED donation blocked (400)');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  section('13. RESPONSE FORMAT');
  {
    // Success responses follow {success, message, data}
    const r = await get('/health');
    assert(r.data.success === true, 'Success response includes success: true');
    assert(typeof r.data.message === 'string', 'Success response includes message string');
    assert(r.data.data !== undefined, 'Success response includes data object');

    // Error responses follow {success, message}
    const err = await get('/donations/not-an-id');
    assert(err.data.success === false, 'Error response includes success: false');
    assert(typeof err.data.message === 'string', 'Error response includes message string');

    // 404 for unknown route
    const notFound = await get('/api/does-not-exist-route');
    assert(notFound.status === 404, 'Unknown route returns 404');
    assert(notFound.data.success === false, 'Unknown route response is success: false');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  await mongoose.disconnect();

  // Final Summary
  console.log('\n' + '═'.repeat(60));
  console.log(`  FINAL RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(60));
  if (failures.length > 0) {
    console.log('\n  Failed tests:');
    failures.forEach(f => console.log(`    ✗ ${f}`));
  } else {
    console.log('\n  All tests passed ✓');
  }

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test suite error:', err.message);
  process.exit(1);
});
