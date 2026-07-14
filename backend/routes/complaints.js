const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const {
  createComplaint,
  getMyComplaints,
  getComplaint,
  rateComplaint,
  getAllComplaints,
  getComplaintDetailsAdmin,
  updateComplaintStatus,
  addInternalNotes
} = require('../controllers/complaintController');

// ===== SUPPORT ROUTES =====
router.post('/',
  protect,
  authorize('support'),
  upload.array('attachments', 5),
  [
    body('customerName').trim().notEmpty(),
    body('mobileNumber').matches(/^\+91[0-9]{10}$/),
    body('companyName').trim().notEmpty(),
    body('productType').isIn(['Tyre Inflator', 'Nitrogen Inflator', 'Air Compressor', 'Other']),
    body('category').isIn(['Breakdown', 'Calibration', 'AMC', 'Installation', 'Paid Service', 'Other']),
    body('priority').isIn(['Low', 'Medium', 'High', 'Critical']),
    body('subject').trim().notEmpty(),
    body('description').isLength({ min: 10 })
  ],
  validate,
  createComplaint
);

router.get('/', protect, authorize('support'), getMyComplaints);
router.get('/:complaintId', protect, authorize('support'), getComplaint);
router.post('/:complaintId/rate', protect, authorize('support'), rateComplaint);

// ===== ADMIN ROUTES =====
router.get('/admin/all', protect, authorize('admin'), getAllComplaints);
router.get('/admin/:complaintId', protect, authorize('admin'), getComplaintDetailsAdmin);
router.put('/admin/:complaintId/status', protect, authorize('admin'), updateComplaintStatus);
router.put('/admin/:complaintId/notes', protect, authorize('admin'), addInternalNotes);

module.exports = router;