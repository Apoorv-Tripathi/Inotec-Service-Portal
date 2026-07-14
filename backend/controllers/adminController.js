const Complaint = require('../models/Complaint');
const User = require('../models/User');
const whatsappService = require('../services/whatsappService');

// Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      priority,
      productType,
      city,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (productType) filter.productType = productType;
    if (city) filter['location.city'] = city;
    
    const complaints = await Complaint.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name mobileNumber')
      .populate('assignedTo', 'name mobileNumber');
    
    const total = await Complaint.countDocuments(filter);
    
    // Summary counts
    const summary = {
      total,
      open: await Complaint.countDocuments({ status: 'Open' }),
      inProgress: await Complaint.countDocuments({ status: 'In Progress' }),
      resolved: await Complaint.countDocuments({ status: 'Resolved' }),
      closed: await Complaint.countDocuments({ status: 'Closed' })
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

// Assign Complaint
exports.assignComplaint = async (req, res) => {
  try {
    const { engineerId, remarks } = req.body;
    
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId
    });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== 'engineer') {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }
    
    complaint.assignedTo = engineerId;
    complaint.assignedAt = new Date();
    complaint.status = 'Assigned';
    complaint.statusHistory.push({
      status: 'Assigned',
      updatedBy: req.user._id,
      remarks
    });
    
    await complaint.save();
    
    // Add to engineer's assignments
    engineer.assignedComplaints.push(complaint._id);
    await engineer.save();
    
    // Notify customer
    await whatsappService.sendStatusUpdate(
      complaint.mobileNumber,
      complaint.complaintId,
      'Assigned',
      `Engineer ${engineer.name} has been assigned to your complaint`
    );
    
    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      assignedTo: {
        name: engineer.name,
        mobileNumber: engineer.mobileNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Status
exports.updateStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId
    });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    complaint.status = status;
    complaint.statusHistory.push({
      status,
      updatedBy: req.user._id,
      remarks: resolutionNotes
    });
    
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      complaint.resolutionNotes = resolutionNotes;
      
      // Calculate resolution time
      const createdTime = new Date(complaint.createdAt).getTime();
      const resolvedTime = new Date().getTime();
      complaint.actualResolutionTime = Math.round((resolvedTime - createdTime) / (1000 * 60 * 60));
    }
    
    if (req.files?.serviceReport) {
      const file = req.files.serviceReport[0];
      complaint.serviceReport = {
        filename: file.filename,
        url: `/uploads/reports/${file.filename}`,
        uploadedAt: new Date()
      };
    }
    
    await complaint.save();
    
    // Notify customer
    await whatsappService.sendStatusUpdate(
      complaint.mobileNumber,
      complaint.complaintId,
      status,
      resolutionNotes
    );
    
    res.status(200).json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload Certificate
exports.uploadCertificate = async (req, res) => {
  try {
    const { certificateNumber, validUpto } = req.body;
    
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId
    });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    if (req.file) {
      complaint.calibrationCertificate = {
        filename: req.file.filename,
        url: `/uploads/certificates/${req.file.filename}`,
        uploadedAt: new Date()
      };
      await complaint.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Certificate uploaded successfully',
      certificateUrl: complaint.calibrationCertificate.url
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Analytics Dashboard
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const totalComplaints = await Complaint.countDocuments(dateFilter);
    const resolved = await Complaint.countDocuments({ ...dateFilter, status: 'Resolved' });
    const pending = totalComplaints - resolved;
    
    // Average resolution time
    const resolvedComplaints = await Complaint.find({
      ...dateFilter,
      status: 'Resolved',
      actualResolutionTime: { $exists: true }
    });
    
    const avgResolutionTime = resolvedComplaints.length > 0
      ? Math.round(resolvedComplaints.reduce((sum, c) => sum + c.actualResolutionTime, 0) / resolvedComplaints.length)
      : 0;
    
    // By Status
    const byStatus = await Complaint.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // By Priority
    const byPriority = await Complaint.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // By Product
    const byProduct = await Complaint.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$productType', count: { $sum: 1 } } }
    ]);
    
    // By Location
    const byLocation = await Complaint.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalComplaints,
          resolved,
          pending,
          avgResolutionTime
        },
        byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
        byPriority: Object.fromEntries(byPriority.map(p => [p._id, p.count])),
        byProduct: Object.fromEntries(byProduct.map(p => [p._id, p.count])),
        byLocation: byLocation.map(l => ({ city: l._id, count: l.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};