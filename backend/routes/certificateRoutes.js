const express = require('express');
const router = express.Router();
const {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  downloadPDF,
  regeneratePDF,
  updateCertificateStatus,
  getExpiringCertificates,
  deleteCertificate,
  getDashboardStats
} = require('../controllers/certificateController');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Validation rules for certificate creation
const certificateValidation = [
  body('petrolPumpName').trim().notEmpty().withMessage('Petrol pump name is required'),
  body('petrolPumpAddress').trim().notEmpty().withMessage('Address is required'),
  body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
  body('contactNo').trim().notEmpty().withMessage('Contact number is required'),
  body('machineDetails.makeModel').trim().notEmpty().withMessage('Make/Model is required'),
  body('machineDetails.serialNo').trim().notEmpty().withMessage('Serial number is required'),
  body('machineDetails.range').isNumeric().withMessage('Range must be a number'),
  body('calibrationData').isArray({ min: 7, max: 7 }).withMessage('Must have exactly 7 calibration data points'),
  body('paymentStatus').isIn(['AMC', 'PAID']).withMessage('Payment status must be AMC or PAID'),
  body('calibratedBy').trim().notEmpty().withMessage('Calibrated by is required')
];

// Routes
router.get('/stats', getDashboardStats);
router.get('/expiring', getExpiringCertificates);
router.get('/', getAllCertificates);
router.get('/:id', getCertificateById);
router.post('/', certificateValidation, validate, createCertificate);
router.get('/:id/download', downloadPDF);
router.post('/:id/regenerate', regeneratePDF);
router.patch('/:id/status', updateCertificateStatus);
router.delete('/:id', deleteCertificate);

module.exports = router;