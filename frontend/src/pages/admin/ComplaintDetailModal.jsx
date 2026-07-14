import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, User, Phone, Building2, MapPin, Package,
  AlertCircle, Calendar, Clock, FileText,
  CheckCircle, UserCog, MessageSquare, Star, Award
} from 'lucide-react';
import { getComplaintDetailsAdmin, updateComplaintStatus } from '../../services/complaint';

const ComplaintDetailModal = ({ complaintId, onClose, onUpdate }) => {
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [statusForm, setStatusForm] = useState({
    status: '',
    remarks: ''
  });

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetails();
    }
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching complaint details for:', complaintId);
      const response = await getComplaintDetailsAdmin(complaintId);
      console.log('Complaint data received:', response.data.data);
      setComplaint(response.data.data);
      setStatusForm({ status: response.data.data.status, remarks: '' });
    } catch (error) {
      console.error('Error fetching complaint:', error);
      alert('Failed to load complaint details: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    if (!statusForm.status) {
      alert('Please select a status');
      return;
    }

    setUpdating(true);
    updateComplaintStatus(complaintId, statusForm)
      .then(() => {
        alert('Status updated successfully!');
        fetchComplaintDetails();
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error('Error updating status:', error);
        alert('Failed to update status: ' + (error.response?.data?.message || error.message));
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  const handleGenerateCertificate = () => {
    // Navigate to certificate generator with pre-filled data
    const url = `/admin/certificate-generator?complaintId=${encodeURIComponent(complaint.complaintId)}&customerName=${encodeURIComponent(complaint.customerName)}&companyName=${encodeURIComponent(complaint.companyName)}`;
    window.location.href = url;
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'Open': 'dm-badge dm-badge-warning',
      'Assigned': 'dm-badge dm-badge-info',
      'In Progress': 'dm-badge dm-badge-primary',
      'Resolved': 'dm-badge dm-badge-success',
      'Closed': 'dm-badge dm-badge-neutral',
      'Rejected': 'dm-badge dm-badge-danger'
    };
    return classes[status] || 'dm-badge dm-badge-neutral';
  };

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      'Critical': 'dm-badge dm-badge-danger',
      'High': 'dm-badge dm-badge-warning',
      'Medium': 'dm-badge dm-badge-info',
      'Low': 'dm-badge dm-badge-neutral'
    };
    return classes[priority] || 'dm-badge dm-badge-neutral';
  };

  const sharedStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      * { box-sizing: border-box; }
      .dm-overlay {
        position: fixed; inset: 0; background: rgba(7,21,41,0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000; padding: 24px; font-family: 'Inter', sans-serif;
      }
      .dm-dialog {
        background: #FFFFFF; width: 100%; max-width: 920px; max-height: 88vh;
        border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;
        box-shadow: 0 20px 60px rgba(7,21,41,0.35);
      }
      .dm-loading-body, .dm-error-body { padding: 64px 24px; text-align: center; }
      .dm-spinner {
        width: 30px; height: 30px; border: 3px solid #E5EAF2; border-top-color: #1A56DB;
        border-radius: 50%; animation: dm-spin 0.7s linear infinite; margin: 0 auto;
      }
      @keyframes dm-spin { to { transform: rotate(360deg); } }
      .dm-loading-text { margin-top: 14px; color: #6B7280; font-size: 13.5px; }
      .dm-error-text { color: #B42318; font-size: 14px; margin-bottom: 16px; }

      .dm-header {
        background: linear-gradient(135deg, #0B1D3A 0%, #0D2952 60%, #0F3070 100%);
        padding: 22px 28px; display: flex; align-items: flex-start; justify-content: space-between;
        flex-shrink: 0;
      }
      .dm-header-title {
        color: #fff; font-size: 17px; font-weight: 700; display: flex; align-items: center;
        gap: 9px; margin-bottom: 10px;
      }
      .dm-header-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .dm-id-badge {
        background: rgba(255,255,255,0.95); color: #1A56DB; font-weight: 700; font-size: 12.5px;
        padding: 4px 12px; border-radius: 999px;
      }
      .dm-close-btn {
        background: rgba(255,255,255,0.12); border: none; color: #fff; width: 30px; height: 30px;
        border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: background .15s ease;
      }
      .dm-close-btn:hover { background: rgba(255,255,255,0.22); }

      .dm-tabs {
        display: flex; gap: 4px; padding: 0 24px; background: #F4F6FA;
        border-bottom: 1px solid #E5EAF2; flex-shrink: 0;
      }
      .dm-tab {
        background: none; border: none; padding: 13px 16px; font-size: 13px; font-weight: 600;
        color: #6B7280; cursor: pointer; font-family: inherit; position: relative; top: 1px;
        border-bottom: 2.5px solid transparent; transition: color .15s ease;
      }
      .dm-tab:hover { color: #1A56DB; }
      .dm-tab.active { color: #1A56DB; border-bottom-color: #1A56DB; }

      .dm-body { padding: 26px 28px; overflow-y: auto; flex: 1; background: #FFFFFF; }

      .dm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
      .dm-card {
        background: #F4F6FA; border: 1px solid #E8EDF5; border-radius: 9px; overflow: hidden;
      }
      .dm-card-header {
        display: flex; align-items: center; gap: 8px; padding: 12px 16px;
        border-bottom: 1px solid #E5EAF2; font-size: 12px; font-weight: 700;
        color: #374151; letter-spacing: 0.02em;
      }
      .dm-card-header svg { color: #1A56DB; }
      .dm-card-body-inner { padding: 16px; }
      .dm-field { margin-bottom: 13px; }
      .dm-field:last-child { margin-bottom: 0; }
      .dm-field-label {
        display: flex; align-items: center; gap: 5px; font-size: 11px; color: #6B7280;
        margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
      }
      .dm-field-value { font-size: 13.5px; color: #0F172A; font-weight: 600; }

      .dm-full-card { grid-column: 1 / -1; }

      .dm-badge {
        display: inline-block; font-size: 11.5px; font-weight: 600;
        padding: 3px 11px; border-radius: 999px; border: 1px solid transparent;
      }
      .dm-badge-danger { background: #FEF3F2; color: #B42318; border-color: #FECDCA; }
      .dm-badge-warning { background: #FFFAEB; color: #B54708; border-color: #FEDF89; }
      .dm-badge-info { background: #EAF8FF; color: #026AA2; border-color: #B9E6FE; }
      .dm-badge-primary { background: #EBF0FD; color: #1A56DB; border-color: #c7d7fb; }
      .dm-badge-success { background: #F0FDF4; color: #15803D; border-color: #bbf0cc; }
      .dm-badge-neutral { background: #F1F2F5; color: #4B5563; border-color: #E5E7EB; }

      .dm-subject { font-size: 14.5px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
      .dm-description { font-size: 13.5px; color: #374151; line-height: 1.7; white-space: pre-wrap; }
      .dm-attachments { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
      .dm-attachment-btn {
        background: #FFFFFF; border: 1.5px solid #D1D9E6; border-radius: 7px;
        padding: 6px 12px; font-size: 12.5px; color: #1A56DB; font-weight: 600;
        cursor: pointer; transition: all .15s ease;
      }
      .dm-attachment-btn:hover { border-color: #1A56DB; background: #EBF0FD; }

      .dm-notes-text { color: #6B7280; font-size: 13px; }

      /* Timeline tab */
      .dm-timeline-item { display: flex; gap: 14px; margin-bottom: 18px; }
      .dm-timeline-item:last-child { margin-bottom: 0; }
      .dm-timeline-marker {
        width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
        justify-content: center; flex-shrink: 0; color: #fff;
      }
      .dm-timeline-marker.dm-badge-danger { background: #B42318; }
      .dm-timeline-marker.dm-badge-warning { background: #B54708; }
      .dm-timeline-marker.dm-badge-info { background: #026AA2; }
      .dm-timeline-marker.dm-badge-primary { background: #1A56DB; }
      .dm-timeline-marker.dm-badge-success { background: #15803D; }
      .dm-timeline-marker.dm-badge-neutral { background: #6B7280; }
      .dm-timeline-card {
        flex: 1; background: #F4F6FA; border: 1px solid #E8EDF5; border-radius: 9px; padding: 14px 16px;
      }
      .dm-timeline-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
      .dm-timeline-status { font-size: 13.5px; font-weight: 700; color: #0F172A; margin-bottom: 3px; }
      .dm-timeline-date { display: flex; align-items: center; gap: 5px; color: #6B7280; font-size: 12px; }
      .dm-timeline-remarks-label { font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; font-weight: 600; }
      .dm-timeline-remarks-text { font-size: 13px; color: #374151; }
      .dm-timeline-updatedby { margin-top: 8px; font-size: 12px; color: #6B7280; }
      .dm-timeline-empty { text-align: center; color: #98a2b3; padding: 40px 0; font-size: 13.5px; }

      /* Actions tab */
      .dm-form-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 7px; }
      .dm-select, .dm-textarea {
        width: 100%; padding: 10px 13px; border: 1.5px solid #D1D9E6; border-radius: 7px;
        font-size: 13.5px; color: #0F172A; background: #FFFFFF; font-family: 'Inter', sans-serif;
      }
      .dm-select:focus, .dm-textarea:focus {
        outline: none; border-color: #1A56DB; box-shadow: 0 0 0 3px rgba(26,86,219,0.12);
      }
      .dm-textarea { resize: vertical; min-height: 84px; }
      .dm-update-btn {
        background: #1A56DB; color: #fff; border: none; padding: 10px 26px; border-radius: 7px;
        font-weight: 700; font-size: 13.5px; cursor: pointer; margin-top: 6px; transition: opacity .15s ease;
      }
      .dm-update-btn:hover { opacity: 0.92; }
      .dm-update-btn:disabled { opacity: 0.65; cursor: not-allowed; }

      .dm-cert-card {
        background: linear-gradient(135deg, #1A56DB 0%, #0B1D3A 100%);
        border-radius: 9px; overflow: hidden; margin-top: 18px;
      }
      .dm-cert-header {
        display: flex; align-items: center; gap: 8px; padding: 12px 16px;
        color: #fff; font-weight: 700; font-size: 13px; background: rgba(255,255,255,0.1);
      }
      .dm-cert-body { padding: 18px 16px; color: rgba(255,255,255,0.92); }
      .dm-cert-text { font-size: 13px; margin-bottom: 14px; line-height: 1.6; }
      .dm-cert-btn {
        background: #FFFFFF; color: #1A56DB; border: none; padding: 9px 20px; border-radius: 7px;
        font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center;
        gap: 8px; transition: opacity .15s ease;
      }
      .dm-cert-btn:hover { opacity: 0.9; }
      .dm-cert-hint { font-size: 11.5px; color: rgba(255,255,255,0.75); margin-left: 12px; }
      .dm-cert-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

      .dm-footer {
        padding: 16px 28px; background: #F4F6FA; border-top: 1px solid #E5EAF2;
        display: flex; justify-content: flex-end; flex-shrink: 0;
      }
      .dm-close-footer-btn {
        background: #FFFFFF; border: 1.5px solid #D1D9E6; color: #374151; padding: 9px 22px;
        border-radius: 7px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all .15s ease;
      }
      .dm-close-footer-btn:hover { border-color: #1A56DB; color: #1A56DB; }

      @media (max-width: 700px) {
        .dm-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div className="dm-overlay">
        {sharedStyles}
        <div className="dm-dialog">
          <div className="dm-loading-body">
            <div className="dm-spinner" />
            <p className="dm-loading-text">Loading complaint details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="dm-overlay" onClick={onClose}>
        {sharedStyles}
        <div className="dm-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="dm-error-body">
            <p className="dm-error-text">Failed to load complaint details</p>
            <button className="dm-close-footer-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dm-overlay" onClick={onClose}>
      {sharedStyles}
      <div className="dm-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dm-header">
          <div>
            <div className="dm-header-title">
              <FileText size={20} />
              Complaint Details
            </div>
            <div className="dm-header-badges">
              <span className="dm-id-badge">{complaint.complaintId}</span>
              <span className={getStatusBadgeClass(complaint.status)}>
                {complaint.status}
              </span>
              <span className={getPriorityBadgeClass(complaint.priority)}>
                {complaint.priority} Priority
              </span>
            </div>
          </div>
          <button type="button" className="dm-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="dm-tabs">
          <button
            className={`dm-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`dm-tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button
            className={`dm-tab ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            Actions
          </button>
        </div>

        {/* Body */}
        <div className="dm-body">
          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <>
              <div className="dm-grid">
                {/* Customer Information */}
                <div className="dm-card">
                  <div className="dm-card-header">
                    <User size={16} />
                    Customer Information
                  </div>
                  <div className="dm-card-body-inner">
                    <div className="dm-field">
                      <div className="dm-field-label">Name</div>
                      <div className="dm-field-value">{complaint.customerName}</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label"><Phone size={12} /> Mobile</div>
                      <div className="dm-field-value">{complaint.mobileNumber}</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label"><Building2 size={12} /> Company</div>
                      <div className="dm-field-value">{complaint.companyName}</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label"><MapPin size={12} /> Location</div>
                      <div className="dm-field-value">{complaint.location?.city || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="dm-card">
                  <div className="dm-card-header">
                    <Package size={16} />
                    Product Information
                  </div>
                  <div className="dm-card-body-inner">
                    <div className="dm-field">
                      <div className="dm-field-label">Product Type</div>
                      <div className="dm-field-value">{complaint.productType}</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label">Model</div>
                      <div className="dm-field-value">{complaint.productModel || 'N/A'}</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label">Serial Number</div>
                      <div className="dm-field-value">{complaint.serialNumber || 'N/A'}</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label">Category</div>
                      <span className="dm-badge dm-badge-primary">{complaint.category}</span>
                    </div>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="dm-card dm-full-card">
                  <div className="dm-card-header">
                    <AlertCircle size={16} />
                    Complaint Details
                  </div>
                  <div className="dm-card-body-inner">
                    <div className="dm-field">
                      <div className="dm-field-label">Subject</div>
                      <div className="dm-subject">{complaint.subject}</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label">Description</div>
                      <p className="dm-description">{complaint.description}</p>
                    </div>
                    {complaint.attachments && complaint.attachments.length > 0 && (
                      <div className="dm-attachments">
                        {complaint.attachments.map((file, idx) => (
                          <button
                            key={idx}
                            className="dm-attachment-btn"
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5001'}${file.url}`, '_blank')}
                          >
                            📎 {file.filename}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Engineer */}
                {complaint.assignedTo && (
                  <div className="dm-card">
                    <div className="dm-card-header">
                      <UserCog size={16} />
                      Assigned Engineer
                    </div>
                    <div className="dm-card-body-inner">
                      <div className="dm-field">
                        <div className="dm-field-value">{complaint.assignedTo.name}</div>
                      </div>
                      <div className="dm-field">
                        <div className="dm-field-label"><Phone size={12} /> Mobile</div>
                        <div className="dm-field-value">{complaint.assignedTo.mobileNumber}</div>
                      </div>
                      <div className="dm-field">
                        <div className="dm-field-label">Assigned On</div>
                        <div className="dm-field-value">{new Date(complaint.assignedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates & Timeline */}
                <div className="dm-card">
                  <div className="dm-card-header">
                    <Calendar size={16} />
                    Timeline
                  </div>
                  <div className="dm-card-body-inner">
                    <div className="dm-field">
                      <div className="dm-field-label">Created</div>
                      <div className="dm-field-value">{new Date(complaint.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label">Expected Resolution</div>
                      <div className="dm-field-value" style={{ color: '#B54708' }}>
                        {new Date(complaint.expectedResolutionDate).toLocaleString()}
                      </div>
                    </div>
                    {complaint.resolvedAt && (
                      <div className="dm-field">
                        <div className="dm-field-label">Resolved</div>
                        <div className="dm-field-value" style={{ color: '#15803D' }}>
                          {new Date(complaint.resolvedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {complaint.actualResolutionTime && (
                      <div className="dm-field">
                        <div className="dm-field-label">Resolution Time</div>
                        <div className="dm-field-value">{complaint.actualResolutionTime} hours</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="dm-card dm-full-card">
                  <div className="dm-card-header">
                    <MessageSquare size={16} />
                    Internal Notes
                  </div>
                  <div className="dm-card-body-inner">
                    <p className="dm-notes-text">
                      {complaint.internalNotes || 'No internal notes added yet.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div>
              {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                complaint.statusHistory.map((history, idx) => (
                  <div key={idx} className="dm-timeline-item">
                    <div className={`dm-timeline-marker ${getStatusBadgeClass(history.status).replace('dm-badge ', '')}`}>
                      <CheckCircle size={16} />
                    </div>
                    <div className="dm-timeline-card">
                      <div className="dm-timeline-top">
                        <div>
                          <div className="dm-timeline-status">Status changed to: {history.status}</div>
                          <div className="dm-timeline-date">
                            <Clock size={12} />
                            {new Date(history.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <span className={getStatusBadgeClass(history.status)}>
                          {history.status}
                        </span>
                      </div>
                      {history.remarks && (
                        <div style={{ marginTop: 8 }}>
                          <div className="dm-timeline-remarks-label">Remarks</div>
                          <div className="dm-timeline-remarks-text">{history.remarks}</div>
                        </div>
                      )}
                      {history.updatedBy && (
                        <div className="dm-timeline-updatedby">
                          Updated by: {history.updatedBy.name} ({history.updatedBy.role})
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="dm-timeline-empty">
                  No status history available
                </div>
              )}
            </div>
          )}

          {/* ACTIONS TAB */}
          {activeTab === 'actions' && (
            <div>
              <div className="dm-card">
                <div className="dm-card-header">Update Status</div>
                <div className="dm-card-body-inner">
                  <div className="dm-field">
                    <label className="dm-form-label">New Status</label>
                    <select
                      className="dm-select"
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    >
                      <option value="Open">Open</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="dm-field">
                    <label className="dm-form-label">Remarks</label>
                    <textarea
                      className="dm-textarea"
                      placeholder="Add any remarks..."
                      value={statusForm.remarks}
                      onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                    ></textarea>
                  </div>
                  <button
                    className="dm-update-btn"
                    disabled={updating}
                    onClick={handleStatusUpdate}
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>

              {/* CERTIFICATE GENERATION CARD */}
              {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
                <div className="dm-cert-card">
                  <div className="dm-cert-header">
                    <Award size={16} />
                    Certificate Generation
                  </div>
                  <div className="dm-cert-body">
                    <p className="dm-cert-text">
                      This complaint has been resolved. Generate a calibration certificate for the customer.
                    </p>
                    <div className="dm-cert-actions">
                      <button
                        className="dm-cert-btn"
                        onClick={handleGenerateCertificate}
                      >
                        <Award size={16} />
                        Generate Certificate
                      </button>
                      <span className="dm-cert-hint">
                        Form will be pre-filled with customer data
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dm-footer">
          <button type="button" className="dm-close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;