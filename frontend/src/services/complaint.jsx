import api from './api';

export const createComplaint = (formData) =>
  api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getMyComplaints = (params) => api.get('/complaints', { params });
export const getComplaint = (complaintId) => api.get(`/complaints/${complaintId}`);
export const rateComplaint = (complaintId, data) => api.post(`/complaints/${complaintId}/rate`, data);

export const getAllComplaints = (params) => api.get('/complaints/admin/all', { params });
export const getComplaintDetailsAdmin = (complaintId) => api.get(`/complaints/admin/${complaintId}`);
export const updateComplaintStatus = (complaintId, data) => api.put(`/complaints/admin/${complaintId}/status`, data);
export const addInternalNotes = (complaintId, data) => api.put(`/complaints/admin/${complaintId}/notes`, data);
export const updateStatus = (complaintId, formData) => api.put(`/complaints/admin/${complaintId}/status`, formData);