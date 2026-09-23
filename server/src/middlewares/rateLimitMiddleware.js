const rateLimit = require('express-rate-limit');

// General API rate limiter
// In test environment the limit is raised so the test suite does not hit 429.
// In production this enforces 100 requests per 15 minutes per IP.
const isTest = process.env.NODE_ENV === 'test';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 5000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    });
  }
});

module.exports = {
  apiLimiter
};
