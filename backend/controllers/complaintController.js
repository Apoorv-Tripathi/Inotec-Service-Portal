const Complaint = require('../models/Complaint');
const generateComplaintId = require('../utils/generateComplaintId');
const smsService = require('../services/smsService');

/* =========================
  SUPPORT CONTROLLERS
========================= */

// Create complaint
exports.createComplaint = async (req, res) => {
  try {
    console.log('Creating complaint...');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    // Parse location if it's a string
    let location = req.body.location;
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        location = { city: req.body.city || req.body.location || '' };
      }
    }

    // Generate unique complaint ID
    const complaintId = await generateComplaintId();

    const complaintData = {
      loggedBy: req.user._id,
      customerName: req.body.customerName,
      mobileNumber: req.body.mobileNumber,
      companyName: req.body.companyName,
      location: location,
      productType: req.body.productType,
      productModel: req.body.productModel || '',
      serialNumber: req.body.serialNumber || '',
      category: req.body.category,
      priority: req.body.priority,
      subject: req.body.subject,
      description: req.body.description,
      complaintId: complaintId,
      status: 'Open',
      attachments: []
    };

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      complaintData.attachments = req.files.map(file => ({
        filename: file.filename,
        url: `/uploads/complaints/${file.filename}`,
        uploadedAt: new Date()
      }));
    }

    // Set expected resolution date based on priority
    const hours = (complaintData.priority === 'High' || complaintData.priority === 'Critical') ? 48 : 72;
    complaintData.expectedResolutionDate = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Create complaint in database
    const complaint = await Complaint.create(complaintData);

    console.log('✅ Complaint created successfully:', complaint.complaintId);

    // ✅ SEND SMS NOTIFICATION (non-blocking)
    // This won't stop complaint creation if SMS fails
    smsService.sendComplaintRegistered(
      complaint.mobileNumber,
      {
        customerName: complaint.customerName,
        complaintId: complaint.complaintId,
        expectedResolutionDate: complaint.expectedResolutionDate
      }
    ).catch(err => {
      console.log('⚠️ SMS notification failed (non-critical):', err.message);
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      complaint: {
        complaintId: complaint.complaintId,
        status: complaint.status,
        createdAt: complaint.createdAt,
        expectedResolutionDate: complaint.expectedResolutionDate
      }
    });

  } catch (error) {
    console.error('❌ Create complaint error:', error);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create complaint. Please try again.'
    });
  }
};

// Get logged-in support user's complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { loggedBy: req.user._id };
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name mobileNumber');

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single complaint (support)
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
      loggedBy: req.user._id
    }).populate('assignedTo', 'name mobileNumber')
      .populate('statusHistory.updatedBy', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rate resolved complaint
exports.rateComplaint = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
      loggedBy: req.user._id,
      status: 'Resolved'
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or not resolved'
      });
    }

    complaint.rating = rating;
    complaint.feedback = feedback;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   ADMIN CONTROLLERS
========================= */

// Get all complaints (admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('loggedBy', 'name email')
      .populate('assignedTo', 'name mobileNumber email');

    const total = await Complaint.countDocuments(filter);

    // Calculate summary
    const summary = {
      total: await Complaint.countDocuments(),
      open: await Complaint.countDocuments({ status: 'Open' }),
      inProgress: await Complaint.countDocuments({ status: 'In Progress' }),
      resolved: await Complaint.countDocuments({ status: 'Resolved' })
    };

    res.status(200).json({
      success: true,
      data: {
        complaints,
        summary,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get complaint details (admin)
exports.getComplaintDetailsAdmin = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId
    })
      .populate('loggedBy', 'name email')
      .populate('assignedTo', 'name mobileNumber email')
      .populate('statusHistory.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update complaint status (admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks, assignedTo } = req.body;

    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId
    }).populate('assignedTo', 'name mobileNumber');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Store old status for comparison
    const oldStatus = complaint.status;
    const wasAssigned = complaint.assignedTo ? true : false;

    // Update status
    complaint.status = status;

    // Add to status history
    complaint.statusHistory.push({
      status,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      remarks
    });

    // Update assigned engineer
    if (assignedTo && assignedTo !== complaint.assignedTo?._id?.toString()) {
      // Get engineer details for notification
      const User = require('../models/User');
      const engineer = await User.findById(assignedTo);

      complaint.assignedTo = assignedTo;
      complaint.assignedAt = new Date();

      // ✅ SEND ENGINEER ASSIGNED SMS
      if (engineer) {
        smsService.sendEngineerAssigned(
          complaint.mobileNumber,
          {
            customerName: complaint.customerName,
            complaintId: complaint.complaintId
          },
          {
            name: engineer.name,
            mobileNumber: engineer.mobileNumber
          }
        ).catch(err => {
          console.log('⚠️ Engineer assignment SMS failed:', err.message);
        });
      }
    }

    // Update resolution time
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      const hours = (complaint.resolvedAt - complaint.createdAt) / (1000 * 60 * 60);
      complaint.actualResolutionTime = Math.round(hours);

      // ✅ SEND RESOLVED SMS
      smsService.sendComplaintResolved(
        complaint.mobileNumber,
        {
          customerName: complaint.customerName,
          complaintId: complaint.complaintId
        }
      ).catch(err => {
        console.log('⚠️ Resolution SMS failed:', err.message);
      });
    }

    if (status === 'Closed') {
      complaint.closedAt = new Date();
    }

    await complaint.save();

    console.log('✅ Complaint status updated:', complaint.complaintId, '→', status);

    // ✅ SEND STATUS UPDATE SMS (if status changed)
    if (oldStatus !== status && status !== 'Resolved') {
      smsService.sendStatusUpdate(
        complaint.mobileNumber,
        {
          customerName: complaint.customerName,
          complaintId: complaint.complaintId
        },
        status,
        remarks
      ).catch(err => {
        console.log('⚠️ Status update SMS failed:', err.message);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add internal notes (admin)
exports.addInternalNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.internalNotes = notes;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Notes added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};