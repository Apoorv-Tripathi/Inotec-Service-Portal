const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Customer Details
  customerName: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },

  // Product Details
  productType: {
    type: String,
    required: true,
    enum: ['Tyre Inflator', 'Nitrogen Inflator', 'Air Compressor', 'Other']
  },
  productModel: String,
  serialNumber: String,
  purchaseDate: Date,

  // Complaint Details
  category: {
    type: String,
    required: true,
    enum: ['Breakdown', 'Calibration', 'AMC', 'Installation', 'Paid Service', 'Other']
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],

  // Status Management
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
    default: 'Open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,

  // Resolution
  resolutionNotes: String,
  serviceReport: {
    filename: String,
    url: String,
    uploadedAt: Date
  },
  calibrationCertificate: {
    filename: String,
    url: String,
    uploadedAt: Date
  },

  // Timeline
  resolvedAt: Date,
  closedAt: Date,

  // Status History
  statusHistory: [{
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],

  // Feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,

  // Internal
  internalNotes: String,
  expectedResolutionDate: Date,
  actualResolutionTime: Number, // in hours
  isOverdue: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

complaintSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date()
    });
  }
});
module.exports = mongoose.model('Complaint', complaintSchema);