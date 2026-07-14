const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendComplaintRegistered = async (mobileNumber, complaintId) => {
  try {
    const message = `Dear Customer,\n\nYour complaint #${complaintId} has been registered successfully.\n\nWe will assign an engineer shortly.\n\nThank you,\nINOTEC Team`;
    
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${mobileNumber}`,
      body: message
    });
    
    console.log('WhatsApp sent');
  } catch (error) {
    console.error('WhatsApp error:', error);
  }
};

exports.sendStatusUpdate = async (mobileNumber, complaintId, status, remarks) => {
  try {
    const message = `Complaint #${complaintId} Update:\n\nStatus: ${status}\nRemarks: ${remarks}\n\nINOTEC Team`;
    
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${mobileNumber}`,
      body: message
    });
  } catch (error) {
    console.error('WhatsApp error:', error);
  }
};