// Using MSG91 or Twilio
const axios = require('axios');

exports.sendOTP = async (mobileNumber, otp) => {
  try {
    // MSG91 Implementation
    const response = await axios.get('https://api.msg91.com/api/v5/otp', {
      params: {
        authkey: process.env.MSG91_API_KEY,
        mobile: mobileNumber,
        otp: otp,
        sender: process.env.MSG91_SENDER_ID,
        message: `Your INOTEC verification code is ${otp}. Valid for 5 minutes.`
      }
    });
    
    console.log('OTP sent successfully');
    return response.data;
  } catch (error) {
    console.error('OTP send error:', error);
    throw new Error('Failed to send OTP');
  }
};