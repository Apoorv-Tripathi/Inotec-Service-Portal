const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const {
  getAllComplaints,
  assignComplaint,
  updateStatus,
  uploadCertificate,
  getDashboardAnalytics
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin', 'engineer'));

router.get('/complaints', getAllComplaints);
router.put('/complaints/:complaintId/assign', assignComplaint);
router.put('/complaints/:complaintId/status',
  upload.fields([{ name: 'serviceReport', maxCount: 1 }]),
  updateStatus
);
router.post('/complaints/:complaintId/upload-certificate',
  upload.single('certificateFile'),
  uploadCertificate
);
router.get('/analytics/dashboard', getDashboardAnalytics);

module.exports = router;