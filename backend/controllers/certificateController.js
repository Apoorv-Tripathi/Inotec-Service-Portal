const Certificate = require('../models/Certificate');
const { generateCertificatePDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

// Create new certificate
exports.createCertificate = async (req, res) => {
  try {
    const certificate = new Certificate(req.body);
    await certificate.save();

    // Generate PDF
    const pdfResult = await generateCertificatePDF(certificate);
    
    // Update certificate with PDF path and QR data
    certificate.pdfPath = pdfResult.filePath;
    certificate.qrCodeData = pdfResult.qrData;
    await certificate.save();

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: certificate,
      pdfFileName: pdfResult.fileName
    });

  } catch (error) {
    console.error('Create Certificate Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create certificate',
      error: error.message
    });
  }
};

// Get all certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { petrolPumpName: { $regex: search, $options: 'i' } },
        { certificateNo: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    const certificates = await Certificate.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Certificate.countDocuments(query);

    res.json({
      success: true,
      data: certificates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
};

// Get certificate by ID
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: certificate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: error.message
    });
  }
};

// Download PDF
exports.downloadPDF = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate || !certificate.pdfPath) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    if (!fs.existsSync(certificate.pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file does not exist'
      });
    }

    res.download(certificate.pdfPath, `${certificate.certificateNo.replace(/\//g, '_')}.pdf`);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
};

// Regenerate PDF
exports.regeneratePDF = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Delete old PDF if exists
    if (certificate.pdfPath && fs.existsSync(certificate.pdfPath)) {
      fs.unlinkSync(certificate.pdfPath);
    }

    // Generate new PDF
    const pdfResult = await generateCertificatePDF(certificate);
    
    certificate.pdfPath = pdfResult.filePath;
    certificate.qrCodeData = pdfResult.qrData;
    await certificate.save();

    res.json({
      success: true,
      message: 'PDF regenerated successfully',
      data: certificate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate PDF',
      error: error.message
    });
  }
};

// Update certificate status
exports.updateCertificateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      message: 'Certificate status updated',
      data: certificate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Get expiring certificates
exports.getExpiringCertificates = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const certificates = await Certificate.find({
      calibrationValidTill: {
        $gte: new Date(),
        $lte: futureDate
      },
      status: 'Active'
    }).sort({ calibrationValidTill: 1 });

    res.json({
      success: true,
      data: certificates,
      count: certificates.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring certificates',
      error: error.message
    });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Delete PDF file
    if (certificate.pdfPath && fs.existsSync(certificate.pdfPath)) {
      fs.unlinkSync(certificate.pdfPath);
    }

    await certificate.deleteOne();

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate',
      error: error.message
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCertificates = await Certificate.countDocuments();
    const activeCertificates = await Certificate.countDocuments({ status: 'Active' });
    const expiredCertificates = await Certificate.countDocuments({ status: 'Expired' });
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringCertificates = await Certificate.countDocuments({
      calibrationValidTill: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      },
      status: 'Active'
    });

    res.json({
      success: true,
      data: {
        total: totalCertificates,
        active: activeCertificates,
        expired: expiredCertificates,
        expiringSoon: expiringCertificates
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = exports;