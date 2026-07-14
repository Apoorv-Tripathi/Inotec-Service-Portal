import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllComplaints, updateStatus } from '../../services/complaint';
import StatusBadge from '../../components/support/StatusBadge';
import { ArrowLeft, ClipboardList } from 'lucide-react';

const FILTERS = ['', 'Open', 'Assigned', 'In Progress', 'Resolved'];

const ManageComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await getAllComplaints(params);
      setComplaints(response.data.data.complaints);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('resolutionNotes', 'Status updated by admin');

      await updateStatus(complaintId, formData);
      fetchComplaints();
      alert('Status updated successfully');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const priorityBadgeClass = (priority) => {
    if (priority === 'Critical') return 'mc-badge mc-badge-danger';
    if (priority === 'High') return 'mc-badge mc-badge-warning';
    return 'mc-badge mc-badge-info';
  };

  return (
    <div className="mc-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .mc-shell { min-height: 100vh; background: #F4F6FA; font-family: 'Inter', sans-serif; }

        /* ---------- Top strip ---------- */
        .mc-topstrip {
          background: #071529; height: 36px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 40px; border-bottom: 1px solid #ffffff0f;
        }
        .mc-topstrip span { color: rgba(255,255,255,0.4); font-size: 11px; }
        .mc-status-dot {
          display: inline-block; width: 7px; height: 7px; border-radius: 50%;
          background: #22C55E; box-shadow: 0 0 0 2px #22c55e30; margin-right: 6px;
        }

        /* ---------- Top navigation ---------- */
        .mc-navbar { background: #0B1D3A; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .mc-navbar-inner {
          max-width: 1320px; margin: 0 auto; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .mc-back {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; border: none; color: rgba(255,255,255,0.6);
          font-size: 13.5px; font-weight: 500; padding: 0; cursor: pointer; font-family: inherit;
        }
        .mc-back:hover { color: #fff; }
        .mc-brand { display: flex; align-items: center; gap: 12px; }
        .mc-brand-mark {
          width: 34px; height: 34px; border-radius: 8px; background: #1A56DB;
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .mc-brand-title { color: #fff; font-weight: 700; font-size: 15px; }
        .mc-brand-sub { color: rgba(255,255,255,0.38); font-size: 10px; letter-spacing: 0.3px; }

        .mc-subbar { background: #0D2952; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .mc-subbar-inner { max-width: 1320px; margin: 0 auto; padding: 9px 40px; }
        .mc-eyebrow {
          display: flex; align-items: center; gap: 10px;
          color: rgba(255,255,255,0.5); font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
        }
        .mc-eyebrow-bar { width: 3px; height: 13px; background: #1A56DB; border-radius: 1px; }

        /* ---------- Page body ---------- */
        .mc-container { max-width: 1320px; margin: 0 auto; padding: 36px 40px 56px; }
        .mc-page-title { font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; margin-bottom: 4px; }
        .mc-page-subtitle { color: #6B7280; font-size: 13.5px; margin-bottom: 28px; }

        /* ---------- Filter bar ---------- */
        .mc-filter-card {
          background: #FFFFFF; border: 1.5px solid #D1D9E6; border-radius: 10px;
          padding: 14px 18px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .mc-filter-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #6B7280; margin-right: 6px;
        }
        .mc-chip {
          font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 999px;
          border: 1.5px solid #D1D9E6; background: #fff; color: #374151;
          transition: all .15s ease; cursor: pointer; font-family: inherit;
        }
        .mc-chip:hover { border-color: #1A56DB; color: #1A56DB; }
        .mc-chip.active { background: #1A56DB; border-color: #1A56DB; color: #fff; }

        /* ---------- Table card ---------- */
        .mc-table-card { background: #FFFFFF; border: 1.5px solid #D1D9E6; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .mc-table { width: 100%; border-collapse: collapse; }
        .mc-table thead th {
          background: #F4F6FA; text-align: left;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #6B7280; padding: 12px 22px; border-bottom: 1px solid #E5EAF2;
        }
        .mc-table tbody td {
          padding: 15px 22px; border-bottom: 1px solid #E8EDF5;
          font-size: 13.5px; color: #374151; vertical-align: middle;
        }
        .mc-table tbody tr:last-child td { border-bottom: none; }
        .mc-table tbody tr:hover { background: #F4F6FA; }
        .mc-complaint-id { font-weight: 700; color: #0F172A; }
        .mc-cust-name { color: #0F172A; font-weight: 600; }
        .mc-cust-mobile { color: #98a2b3; font-size: 12px; }

        .mc-badge {
          display: inline-block; font-size: 11.5px; font-weight: 600;
          padding: 3px 10px; border-radius: 999px; border: 1px solid transparent;
        }
        .mc-badge-danger { background: #FEF3F2; color: #B42318; border-color: #FECDCA; }
        .mc-badge-warning { background: #FFFAEB; color: #B54708; border-color: #FEDF89; }
        .mc-badge-info { background: #EAF8FF; color: #026AA2; border-color: #B9E6FE; }

        .mc-select {
          font-size: 13px; font-weight: 500; color: #374151;
          border: 1.5px solid #D1D9E6; border-radius: 6px;
          padding: 6px 10px; background: #fff; font-family: inherit; cursor: pointer;
        }
        .mc-select:focus { outline: none; border-color: #1A56DB; box-shadow: 0 0 0 3px rgba(26,86,219,0.12); }

        .mc-empty { text-align: center; padding: 56px 20px; color: #98a2b3; font-size: 14px; }
        .mc-spinner-wrap { display: flex; justify-content: center; padding: 56px 20px; }
        .mc-spinner {
          width: 28px; height: 28px; border: 3px solid #E5EAF2; border-top-color: #1A56DB;
          border-radius: 50%; animation: mc-spin 0.7s linear infinite;
        }
        @keyframes mc-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Top strip */}
      <div className="mc-topstrip">
        <div style={{ display: 'flex', gap: 24 }}>
          <span>support@inotec.co.in</span>
          <span>+91-9453245747</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span className="mc-status-dot" />All Systems Operational
          </span>
        </div>
      </div>

      {/* Top navigation */}
      <nav className="mc-navbar">
        <div className="mc-navbar-inner">
          <button className="mc-back" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="mc-brand">
            <div className="mc-brand-mark">
              <ClipboardList size={17} />
            </div>
            <div>
              <div className="mc-brand-title">Manage Complaints</div>
              <div className="mc-brand-sub">INOTEC · Service Management Portal</div>
            </div>
          </div>
          <div style={{ width: 150 }} />
        </div>
      </nav>

      <div className="mc-subbar">
        <div className="mc-subbar-inner">
          <span className="mc-eyebrow">
            <span className="mc-eyebrow-bar" />
            Internal Operations Platform
          </span>
        </div>
      </div>

      <div className="mc-container">
        <h1 className="mc-page-title">Manage Complaints</h1>
        <p className="mc-page-subtitle">Review, filter, and update the status of customer complaints.</p>

        {/* Filters */}
        <div className="mc-filter-card">
          <span className="mc-filter-label">Filter</span>
          {FILTERS.map((f) => (
            <button
              key={f || 'all'}
              className={`mc-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f || 'All'}
            </button>
          ))}
        </div>

        {/* Complaints table */}
        <div className="mc-table-card">
          {loading ? (
            <div className="mc-spinner-wrap">
              <div className="mc-spinner" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="mc-empty">No complaints found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td className="mc-complaint-id">{complaint.complaintId}</td>
                      <td>
                        <div className="mc-cust-name">{complaint.customerName}</div>
                        <div className="mc-cust-mobile">{complaint.mobileNumber}</div>
                      </td>
                      <td>{complaint.productType}</td>
                      <td>
                        <span className={priorityBadgeClass(complaint.priority)}>{complaint.priority}</span>
                      </td>
                      <td>
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="mc-select"
                          value={complaint.status}
                          onChange={(e) => handleStatusUpdate(complaint.complaintId, e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageComplaints;