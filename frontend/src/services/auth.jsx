import api from './api';

export const sendOTP = (mobileNumber) => api.post('/auth/send-otp', { mobileNumber });
export const verifyOTP = (mobileNumber, otp) => api.post('/auth/verify-otp', { mobileNumber, otp });
export const register = (data) => api.post('/auth/customer-register', data);
export const adminLogin = (email, password) => api.post('/auth/admin-login', { email, password });