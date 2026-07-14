const mongoose = require('mongoose');

const calibrationDataSchema = new mongoose.Schema({
  standardPressure: { type: Number, required: true },
  measuredPressure: { type: Number, required: true },
  error: { type: Number, required: true }
});

const conditionCheckSchema = new mongoose.Schema({
  inflatorCondition: {
    type: String,
    enum: ['Good', 'Fair', 'Poor', 'OK', 'NOT OK', 'NA'],
    required: true
  },
  airCompressorCondition: {
    type: String,
    enum: ['Good', 'Fair', 'Poor', 'OK', 'NOT OK', 'NA'],
    required: true
  },
  moistureFilterCondition: {
    type: String,
    enum: ['Good', 'Fair', 'Poor', 'OK', 'NOT OK', 'NA'],
    required: true
  },
  airNozzleCondition: {
    type: String,
    enum: ['Good', 'Fair', 'Poor', 'OK', 'NOT OK', 'NA'],
    required: true
  },
  airHoseCondition: {
    type: String,
    enum: ['Good', 'Fair', 'Poor', 'OK', 'NOT OK', 'NA'],
    required: true
  },
  inputPowerSupply: {
    type: String,
    required: true
  }
});

/* ==========================================================
   MONTHLY CERTIFICATE NUMBER COUNTER
   Tracks the last-used sequence number per "YYYY-MM" bucket
   in its own tiny collection, and increments it atomically
   via findOneAndUpdate + $inc so two simultaneous certificate
   creations can never receive the same number.
   ========================================================== */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "2026-07"
  seq: { type: Number, default: 0 }
});

const Counter =
  mongoose.models.CertCounter ||
  mongoose.model('CertCounter', counterSchema, 'cert_counters');

async function getNextCertificateNo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const bucketId = `${year}-${month}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: bucketId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(3, '0');
  return `INOTEC/${year}/${month}/${seq}`;
}

const certificateSchema = new mongoose.Schema({
  certificateNo: {
    type: String,
    unique: true,
    default: function () {
      const year = new Date().getFullYear();
      return `TEMP/${year}/${Date.now()}`;
    }
  },
  calibrationValidTill: {
    type: Date,
    default: function () {
      const d = new Date(this.dateOfCalibration || Date.now());
      d.setFullYear(d.getFullYear() + 1);
      return d;
    }
  },
  petrolPumpName: { type: String, required: true, trim: true },
  petrolPumpAddress: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  contactNo: { type: String, required: true, trim: true },
  machineDetails: {
    makeModel: { type: String, required: true },
    serialNo: { type: String, required: true },
    range: { type: Number, required: true },
    leastCount: { type: Number, default: 1 },
    temperature: { type: Number, default: 36 }
  },
  dateOfCalibration: {
    type: Date,
    required: true,
    default: Date.now
  },
  conditionCheck: {
    type: conditionCheckSchema,
    required: true
  },
  calibrationData: {
    type: [calibrationDataSchema],
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 7 entries']
  },
  paymentStatus: {
    type: String,
    enum: ['AMC', 'PAID'],
    required: true
  },
  calibratedBy: { type: String, required: true, trim: true },
  calibrationResult: { type: String, default: 'Pass' },
  pdfPath: { type: String },
  qrCodeData: { type: String },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Revoked'],
    default: 'Active'
  }
}, {
  timestamps: true,
  collection: 'cert_certificates'
});

function arrayLimit(val) {
  return val.length === 7;
}

certificateSchema.pre('save', async function () {
  // Only auto-generate if no real certificate number has been set yet.
  // (Covers: not set at all, empty string, or still the schema's TEMP/ placeholder.)
  if (!this.certificateNo || this.certificateNo.startsWith('TEMP/')) {
    this.certificateNo = await getNextCertificateNo();
  }
  if (!this.calibrationValidTill) {
    const validTill = new Date(this.dateOfCalibration || Date.now());
    validTill.setFullYear(validTill.getFullYear() + 1);
    this.calibrationValidTill = validTill;
  }
});

certificateSchema.index({ certificateNo: 1 });
certificateSchema.index({ petrolPumpName: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ calibrationValidTill: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);