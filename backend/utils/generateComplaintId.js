const Complaint = require('../models/Complaint');

module.exports = async () => {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const id = String(count + 1).padStart(5, '0');
  return `INTC-${year}-${id}`;
};