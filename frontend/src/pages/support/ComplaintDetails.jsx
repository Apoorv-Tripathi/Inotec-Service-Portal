import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaint } from '../../services/complaint';
import StatusBadge from '../../components/support/StatusBadge';
import { ArrowLeft, Calendar, MapPin, Package, User, FileText } from 'lucide-react';

const ComplaintDetails = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const fetchComplaint = async () => {
    try {
      const response = await getComplaint(complaintId);
      setComplaint(response.data.complaint);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityBadgeClass = (priority) => {
    if (priority === 'Critical') return 'cd-badge cd-badge-danger';
    if (priority === 'High') return 'cd-badge cd-badge-danger';
    if (priority === 'Medium') return 'cd-badge cd-badge-warning';
    return 'cd-badge cd-badge-info';
  };

  const sharedStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      * { box-sizing: border-box; }
      .cd-shell { min-height: 100vh; background: #F4F6FA; font-family: 'Inter', sans-serif; }

      .cd-topstrip {
        background: #071529; height: 36px; display: flex; align-items: center;
        justify-content: space-between; padding: 0 40px; border-bottom: 1px solid #ffffff0f;
      }
      .cd-topstrip span { color: rgba(255,255,255,0.4); font-size: 11px; }
      .cd-status-dot {
        display: inline-block; width: 7px; height: 7px; border-radius: 50%;
        background: #22C55E; box-shadow: 0 0 0 2px #22c55e30; margin-right: 6px;
      }

      .cd-navbar { background: #0B1D3A; border-bottom: 1px solid rgba(255,255,255,0.07); }
      .cd-navbar-inner {
        max-width: 1080px; margin: 0 auto; padding: 14px 40px;
        display: flex; align-items: center; justify-content: space-between;
      }
      .cd-back {
        display: inline-flex; align-items: center; gap: 8px;
        background: transparent; border: none; color: rgba(255,255,255,0.6);
        font-size: 13.5px; font-weight: 500; padding: 0; cursor: pointer; font-family: inherit;
      }
      .cd-back:hover { color: #fff; }
      .cd-brand { display: flex; align-items: center; gap: 12px; }
      .cd-brand-mark {
        width: 34px; height: 34px; border-radius: 8px; background: #1A56DB;
        display: flex; align-items: center; justify-content: center;
        color: #fff; flex-shrink: 0;
      }
      .cd-brand-title { color: #fff; font-weight: 700; font-size: 15px; }
      .cd-brand-sub { color: rgba(255,255,255,0.38); font-size: 10px; letter-spacing: 0.3px; }

      .cd-subbar { background: #0D2952; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .cd-subbar-inner { max-width: 1080px; margin: 0 auto; padding: 9px 40px; }
      .cd-eyebrow {
        display: flex; align-items: center; gap: 10px;
        color: rgba(255,255,255,0.5); font-size: 11.5px; font-weight: 600;
        letter-spacing: 0.12em; text-transform: uppercase;
      }
      .cd-eyebrow-bar { width: 3px; height: 13px; background: #1A56DB; border-radius: 1px; }

      .cd-container { max-width: 1080px; margin: 0 auto; padding: 36px 40px 60px; }

      .cd-loading, .cd-notfound {
        min-height: 60vh; display: flex; align-items: center; justify-content: center;
        flex-direction: column; gap: 14px;
      }
      .cd-spinner {
        width: 30px; height: 30px; border: 3px solid #E5EAF2; border-top-color: #1A56DB;
        border-radius: 50%; animation: cd-spin 0.7s linear infinite;
      }
      @keyframes cd-spin { to { transform: rotate(360deg); } }
      .cd-notfound p { color: #6B7280; font-size: 14px; }

      .cd-card {
        background: #FFFFFF; border: 1.5px solid #D1D9E6; border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden;
      }
      .cd-card-body { padding: 30px 32px; }

      .cd-header-row {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5EAF2;
      }
      .cd-title { font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.4px; margin-bottom: 4px; }
      .cd-created { color: #6B7280; font-size: 12.5px; }

      .cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px; }
      .cd-subcard {
        background: #F4F6FA; border: 1px solid #E8EDF5; border-radius: 8px; padding: 18px 20px;
      }
      .cd-subcard-title {
        font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
        color: #6B7280; margin-bottom: 14px;
      }
      .cd-info-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: #374151; font-size: 13.5px; }
      .cd-info-row:last-child { margin-bottom: 0; }
      .cd-info-row svg { color: #1A56DB; flex-shrink: 0; }
      .cd-info-line { margin-bottom: 6px; font-size: 13.5px; color: #374151; }
      .cd-info-line strong { color: #0F172A; font-weight: 600; }

      .cd-badge {
        display: inline-block; font-size: 11.5px; font-weight: 600;
        padding: 3px 10px; border-radius: 999px; border: 1px solid transparent;
      }
      .cd-badge-danger { background: #FEF3F2; color: #B42318; border-color: #FECDCA; }
      .cd-badge-warning { background: #FFFAEB; color: #B54708; border-color: #FEDF89; }
      .cd-badge-info { background: #EAF8FF; color: #026AA2; border-color: #B9E6FE; }

      .cd-desc-text { color: #374151; font-size: 13.5px; line-height: 1.7; white-space: pre-wrap; }

      .cd-timeline-item { display: flex; gap: 14px; margin-bottom: 20px; }
      .cd-timeline-item:last-child { margin-bottom: 0; }
      .cd-timeline-dot-wrap { display: flex; flex-direction: column; align-items: center; padding-top: 4px; }
      .cd-timeline-dot { width: 11px; height: 11px; border-radius: 50%; background: #1A56DB; box-shadow: 0 0 0 3px #1A56DB22; flex-shrink: 0; }
      .cd-timeline-status { font-weight: 700; color: #0F172A; font-size: 13.5px; margin-bottom: 3px; }
      .cd-timeline-date { color: #6B7280; font-size: 12px; margin-bottom: 4px; }
      .cd-timeline-remarks { color: #374151; font-size: 13px; }
    `}</style>
  );

  if (loading) {
    return (
      <div className="cd-shell">
        {sharedStyles}
        <div className="cd-loading">
          <div className="cd-spinner" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="cd-shell">
        {sharedStyles}
        <div className="cd-notfound">
          <p>Complaint not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-shell">
      {sharedStyles}

      {/* Top strip */}
      <div className="cd-topstrip">
        <div style={{ display: 'flex', gap: 24 }}>
          <span>support@inotec.co.in</span>
          <span>+91-9453245747</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span className="cd-status-dot" />All Systems Operational
          </span>
        </div>
      </div>

      {/* Top navigation */}
      <nav className="cd-navbar">
        <div className="cd-navbar-inner">
          <button className="cd-back" onClick={() => navigate('/support/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="cd-brand">
            <div className="cd-brand-mark">
              <FileText size={17} />
            </div>
            <div>
              <div className="cd-brand-title">Complaint Details</div>
              <div className="cd-brand-sub">INOTEC · Service Management Portal</div>
            </div>
          </div>
          <div style={{ width: 150 }} />
        </div>
      </nav>

      <div className="cd-subbar">
        <div className="cd-subbar-inner">
          <span className="cd-eyebrow">
            <span className="cd-eyebrow-bar" />
            Internal Operations Platform
          </span>
        </div>
      </div>

      <div className="cd-container">
        <div className="cd-card">
          <div className="cd-card-body">
            <div className="cd-header-row">
              <div>
                <h2 className="cd-title">Complaint #{complaint.complaintId}</h2>
                <p className="cd-created">
                  Created on {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="cd-grid">
              <div className="cd-subcard">
                <div className="cd-subcard-title">Customer Details</div>
                <div className="cd-info-row">
                  <User size={16} />
                  {complaint.customerName}
                </div>
                <div className="cd-info-row">
                  <Package size={16} />
                  {complaint.companyName}
                </div>
                <div className="cd-info-row">
                  <MapPin size={16} />
                  {complaint.location?.city}
                </div>
              </div>

              <div className="cd-subcard">
                <div className="cd-subcard-title">Product Details</div>
                <div className="cd-info-line"><strong>Type:</strong> {complaint.productType}</div>
                <div className="cd-info-line"><strong>Model:</strong> {complaint.productModel || 'N/A'}</div>
                <div className="cd-info-line" style={{ marginBottom: 0 }}>
                  <strong>Priority:</strong>{' '}
                  <span className={priorityBadgeClass(complaint.priority)}>{complaint.priority}</span>
                </div>
              </div>
            </div>

            <div className="cd-subcard" style={{ marginBottom: 20 }}>
              <div className="cd-subcard-title">Issue Description</div>
              <p className="cd-desc-text">{complaint.description}</p>
            </div>

            {complaint.statusHistory && complaint.statusHistory.length > 0 && (
              <div className="cd-subcard">
                <div className="cd-subcard-title">Status Timeline</div>
                <div>
                  {complaint.statusHistory.map((history, index) => (
                    <div key={index} className="cd-timeline-item">
                      <div className="cd-timeline-dot-wrap">
                        <div className="cd-timeline-dot" />
                      </div>
                      <div>
                        <div className="cd-timeline-status">{history.status}</div>
                        <div className="cd-timeline-date">
                          {new Date(history.updatedAt).toLocaleString()}
                        </div>
                        {history.remarks && (
                          <div className="cd-timeline-remarks">{history.remarks}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;