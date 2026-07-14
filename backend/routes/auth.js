const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  customerLogin,
  customerRegister,
  adminLogin
} = require('../controllers/authController');

// Customer Registration
router.post('/customer-register',
  [
    body('mobileNumber').matches(/^\+91[0-9]{10}$/).withMessage('Invalid mobile number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('city').trim().notEmpty().withMessage('City is required')
  ],
  validate,
  customerRegister
);

// Customer Login
router.post('/customer-login',
  [
    body('mobileNumber').matches(/^\+91[0-9]{10}$/).withMessage('Invalid mobile number'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  customerLogin
);

// Admin Login
router.post('/admin-login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  validate,
  adminLogin
);

module.exports = router;