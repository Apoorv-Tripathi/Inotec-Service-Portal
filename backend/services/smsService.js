const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send complaint registered SMS
exports.sendComplaintRegistered = async (mobileNumber, complaintData) => {
  try {
    console.log('📱 Sending complaint registration SMS to:', mobileNumber);

    const message = await client.messages.create({
      body: `Hi ${complaintData.customerName},

Your complaint has been registered successfully!

Complaint ID: ${complaintData.complaintId}
Status: Open
Expected Resolution: ${new Date(complaintData.expectedResolutionDate).toLocaleDateString('en-IN')}

We will contact you shortly.

Thank you,
INOTEC Support Team`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber
    });

    console.log('✅ SMS sent successfully! SID:', message.sid);
    return message;

  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    // Don't throw error - let complaint creation succeed even if SMS fails
    return null;
  }
};

// Send status update SMS
exports.sendStatusUpdate = async (mobileNumber, complaintData, newStatus, remarks) => {
  try {
    console.log('📱 Sending status update SMS to:', mobileNumber);

    const statusEmoji = {
      'Open': '🆕',
      'Assigned': '👨‍🔧',
      'In Progress': '⚙️',
      'Resolved': '✅',
      'Closed': '🔒',
      'Rejected': '❌'
    };

    const message = await client.messages.create({
      body: `Hi ${complaintData.customerName},

${statusEmoji[newStatus] || '📋'} Complaint Status Updated

Complaint ID: ${complaintData.complaintId}
New Status: ${newStatus}
${remarks ? `Remarks: ${remarks}` : ''}

Track your complaint at:
${process.env.FRONTEND_URL}/support/complaints

Thank you,
INOTEC Support Team`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber
    });

    console.log('✅ Status update SMS sent! SID:', message.sid);
    return message;

  } catch (error) {
    console.error('❌ Status update SMS failed:', error.message);
    return null;
  }
};

// Send engineer assigned notification
exports.sendEngineerAssigned = async (mobileNumber, complaintData, engineerData) => {
  try {
    console.log('📱 Sending engineer assignment SMS to:', mobileNumber);

    const message = await client.messages.create({
      body: `Hi ${complaintData.customerName},

👨‍🔧 Engineer Assigned to Your Complaint

Complaint ID: ${complaintData.complaintId}
Engineer: ${engineerData.name}
Contact: ${engineerData.mobileNumber}

The engineer will contact you soon.

Thank you,
INOTEC Support Team`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber
    });

    console.log('✅ Engineer assignment SMS sent! SID:', message.sid);
    return message;

  } catch (error) {
    console.error('❌ Engineer assignment SMS failed:', error.message);
    return null;
  }
};

// Send complaint resolved notification
exports.sendComplaintResolved = async (mobileNumber, complaintData) => {
  try {
    console.log('📱 Sending resolution SMS to:', mobileNumber);

    const message = await client.messages.create({
      body: `Hi ${complaintData.customerName},

✅ Your Complaint Has Been Resolved!

Complaint ID: ${complaintData.complaintId}
Resolved On: ${new Date().toLocaleDateString('en-IN')}

Please rate your experience:
${process.env.FRONTEND_URL}/support/complaints

Thank you for choosing INOTEC!

INOTEC Support Team`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber
    });

    console.log('✅ Resolution SMS sent! SID:', message.sid);
    return message;

  } catch (error) {
    console.error('❌ Resolution SMS failed:', error.message);
    return null;
  }
};

// Send custom SMS (for manual notifications)
exports.sendCustomSMS = async (mobileNumber, messageText) => {
  try {
    console.log('📱 Sending custom SMS to:', mobileNumber);

    const message = await client.messages.create({
      body: messageText,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber
    });

    console.log('✅ Custom SMS sent! SID:', message.sid);
    return message;

  } catch (error) {
    console.error('❌ Custom SMS failed:', error.message);
    return null;
  }
};