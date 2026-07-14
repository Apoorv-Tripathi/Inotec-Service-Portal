import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getAllComplaints } from '../../services/complaint';
import {
  LayoutDashboard,
  FileText,
  BarChart,
  LogOut,
  Eye,
  Award,
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import ComplaintDetailModal from './ComplaintDetailModal';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const response = await getAllComplaints({ limit: 5 });
      setComplaints(response.data.data.complaints);
      setStats(response.data.data.summary);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (complaintId) => {
    setSelectedComplaintId(complaintId);
  };

  const handleCloseModal = () => {
    setSelectedComplaintId(null);
  };

  const handleComplaintUpdate = () => {
    fetchData();
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const statCards = [
    { key: 'total', label: 'Total Complaints', value: stats.total, icon: ClipboardList, tone: 'neutral' },
    { key: 'open', label: 'Open', value: stats.open, icon: AlertCircle, tone: 'danger' },
    { key: 'inProgress', label: 'In Progress', value: stats.inProgress, icon: Clock, tone: 'info' },
    { key: 'resolved', label: 'Resolved', value: stats.resolved, icon: CheckCircle2, tone: 'success' }
  ];

  const statusBadgeClass = (status) => {
    if (status === 'Open') return 'iad-badge iad-badge-danger';
    if (status === 'In Progress') return 'iad-badge iad-badge-info';
    if (status === 'Resolved') return 'iad-badge iad-badge-success';
    return 'iad-badge iad-badge-neutral';
  };

  const priorityBadgeClass = (priority) => {
    if (priority === 'Critical') return 'iad-badge iad-badge-danger';
    if (priority === 'High') return 'iad-badge iad-badge-warning';
    return 'iad-badge iad-badge-info';
  };

  return (
    <div className="iad-shell">
      <style>{`
        .iad-shell {
          min-height: 100vh;
          background: #f4f5f7;
          font-feature-settings: "tnum";
        }

        /* ---------- Top navigation ---------- */
        .iad-navbar {
          background: #0d1526;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .iad-navbar-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .iad-brand { display: flex; align-items: center; gap: 12px; }
        .iad-brand-mark {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #3b5bfd;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        .iad-brand-text { display: flex; flex-direction: column; line-height: 1.2; }
        .iad-brand-title { color: #fff; font-weight: 700; font-size: 15px; }
        .iad-brand-sub { color: #8891a7; font-size: 12px; }
        .iad-nav-right { display: flex; align-items: center; gap: 18px; }
        .iad-welcome { color: #c3c8d6; font-size: 13.5px; }
        .iad-welcome strong { color: #fff; font-weight: 600; }
        .iad-logout {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.18);
          color: #e7e9ee;
          font-size: 13px;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 6px;
          transition: all .15s ease;
        }
        .iad-logout:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.3); color: #fff; }

        /* ---------- Sub bar (ties to landing page eyebrow style) ---------- */
        .iad-subbar {
          background: #131c30;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .iad-subbar-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 9px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .iad-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #9aa3ba;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .iad-eyebrow-bar { width: 3px; height: 13px; background: #3b5bfd; display: inline-block; border-radius: 1px; }
        .iad-subbar-date { color: #6b7488; font-size: 12px; }

        /* ---------- Page body ---------- */
        .iad-container { max-width: 1320px; margin: 0 auto; padding: 36px 28px 56px; }

        .iad-page-title {
          font-size: 26px;
          font-weight: 700;
          color: #101828;
          letter-spacing: -0.01em;
          margin-bottom: 4px;
        }
        .iad-page-subtitle { color: #667085; font-size: 14px; margin-bottom: 28px; }

        /* ---------- Stat cards ---------- */
        .iad-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 900px) { .iad-stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .iad-stat-grid { grid-template-columns: 1fr; } }

        .iad-stat-card {
          background: #fff;
          border: 1px solid #e6e8ee;
          border-radius: 10px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .iad-stat-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
        }
        .iad-stat-card.tone-neutral::before { background: #3b5bfd; }
        .iad-stat-card.tone-danger::before { background: #d92d20; }
        .iad-stat-card.tone-info::before { background: #0086c9; }
        .iad-stat-card.tone-success::before { background: #12925c; }

        .iad-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .iad-stat-icon {
          width: 34px; height: 34px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .tone-neutral .iad-stat-icon { background: #eef1ff; color: #3b5bfd; }
        .tone-danger .iad-stat-icon { background: #fef3f2; color: #d92d20; }
        .tone-info .iad-stat-icon { background: #eaf8ff; color: #0086c9; }
        .tone-success .iad-stat-icon { background: #ecfdf3; color: #12925c; }

        .iad-stat-value { font-size: 34px; font-weight: 700; color: #101828; line-height: 1; margin-bottom: 6px; }
        .iad-stat-label { color: #667085; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }

        /* ---------- Quick action cards ---------- */
        .iad-section-label {
          display: flex; align-items: center; gap: 10px;
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #667085; margin-bottom: 14px;
        }
        .iad-section-label .bar { width: 3px; height: 13px; background: #3b5bfd; border-radius: 1px; }

        .iad-quick-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        @media (max-width: 900px) { .iad-quick-grid { grid-template-columns: 1fr; } }

        .iad-quick-card {
          background: #fff;
          border: 1px solid #e6e8ee;
          border-radius: 10px;
          padding: 22px;
          display: flex;
          flex-direction: column;
        }
        .iad-quick-icon {
          width: 38px; height: 38px;
          border-radius: 8px;
          background: #eef1ff;
          color: #3b5bfd;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .iad-quick-title { font-size: 15.5px; font-weight: 700; color: #101828; margin-bottom: 6px; }
        .iad-quick-desc { font-size: 13.5px; color: #667085; margin-bottom: 18px; flex-grow: 1; }

        .iad-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #d0d5dd;
          background: #fff;
          color: #344054;
          font-size: 13.5px;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: 7px;
          transition: all .15s ease;
          align-self: flex-start;
        }
        .iad-btn:hover { border-color: #3b5bfd; color: #3b5bfd; }
        .iad-btn-primary { background: #3b5bfd; border-color: #3b5bfd; color: #fff; }
        .iad-btn-primary:hover { background: #2f49d1; border-color: #2f49d1; color: #fff; }

        /* Featured (certificate) card — accent via dark navy panel, not a loud gradient */
        .iad-quick-card.featured {
          background: #0d1526;
          border-color: #0d1526;
        }
        .iad-quick-card.featured .iad-quick-icon { background: rgba(255,255,255,0.1); color: #fff; }
        .iad-quick-card.featured .iad-quick-title { color: #fff; }
        .iad-quick-card.featured .iad-quick-desc { color: #aab0c2; }
        .iad-quick-card.featured .iad-btn { background: #fff; border-color: #fff; color: #0d1526; }
        .iad-quick-card.featured .iad-btn:hover { background: #e7e9ee; border-color: #e7e9ee; color: #0d1526; }
        .iad-featured-tag {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8fa2ff;
          border: 1px solid rgba(143,162,255,0.4);
          border-radius: 999px;
          padding: 2px 9px;
          margin-bottom: 12px;
          align-self: flex-start;
        }

        /* ---------- Table card ---------- */
        .iad-table-card { background: #fff; border: 1px solid #e6e8ee; border-radius: 10px; overflow: hidden; }
        .iad-table-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid #e6e8ee;
        }
        .iad-table-title { font-size: 15.5px; font-weight: 700; color: #101828; }
        .iad-link-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #3b5bfd;
          border: none; background: none; padding: 0;
        }
        .iad-link-btn:hover { color: #2f49d1; }

        .iad-table { width: 100%; border-collapse: collapse; }
        .iad-table thead th {
          background: #f9fafb;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #667085;
          padding: 12px 22px;
          border-bottom: 1px solid #e6e8ee;
        }
        .iad-table tbody td {
          padding: 15px 22px;
          border-bottom: 1px solid #f0f1f5;
          font-size: 13.5px;
          color: #344054;
          vertical-align: middle;
        }
        .iad-table tbody tr:last-child td { border-bottom: none; }
        .iad-table tbody tr:hover { background: #fafbfc; }
        .iad-cust-name { color: #101828; font-weight: 600; }
        .iad-cust-company { color: #98a2b3; font-size: 12px; }
        .iad-complaint-id { font-weight: 700; color: #101828; }

        .iad-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .iad-badge-danger { background: #fef3f2; color: #b42318; border-color: #fecdca; }
        .iad-badge-warning { background: #fffaeb; color: #b54708; border-color: #fedf89; }
        .iad-badge-info { background: #eaf8ff; color: #026aa2; border-color: #b9e6fe; }
        .iad-badge-success { background: #ecfdf3; color: #067647; border-color: #abefc6; }
        .iad-badge-neutral { background: #f2f4f7; color: #344054; border-color: #eaecf0; }

        .iad-view-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600;
          border: 1px solid #d0d5dd; background: #fff; color: #344054;
          padding: 6px 12px; border-radius: 6px;
        }
        .iad-view-btn:hover { border-color: #3b5bfd; color: #3b5bfd; }

        .iad-empty { text-align: center; padding: 56px 20px; color: #98a2b3; font-size: 14px; }
        .iad-spinner-wrap { display: flex; justify-content: center; padding: 56px 20px; }
        .iad-spinner {
          width: 28px; height: 28px;
          border: 3px solid #e6e8ee;
          border-top-color: #3b5bfd;
          border-radius: 50%;
          animation: iad-spin 0.7s linear infinite;
        }
        @keyframes iad-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Top navigation */}
      <nav className="iad-navbar">
        <div className="iad-navbar-inner">
          <div className="iad-brand">
            <div className="iad-brand-mark">IN</div>
            <div className="iad-brand-text">
              <span className="iad-brand-title">INOTEC Admin</span>
              <span className="iad-brand-sub">Complaint &amp; Calibration Management</span>
            </div>
          </div>
          <div className="iad-nav-right">
            <span className="iad-welcome">
              Welcome, <strong>{user?.name}</strong>
            </span>
            <button className="iad-logout" onClick={logout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="iad-subbar">
        <div className="iad-subbar-inner">
          <span className="iad-eyebrow">
            <span className="iad-eyebrow-bar" />
            Internal Operations Platform
          </span>
          <span className="iad-subbar-date">{today}</span>
        </div>
      </div>

      <div className="iad-container">
        <h1 className="iad-page-title">Dashboard Overview</h1>
        <p className="iad-page-subtitle">
          Monitor complaint volume and manage service operations across all INOTEC product lines.
        </p>

        {/* Stats */}
        <div className="iad-stat-grid">
          {statCards.map(({ key, label, value, icon: Icon, tone }) => (
            <div key={key} className={`iad-stat-card tone-${tone}`}>
              <div className="iad-stat-top">
                <div className="iad-stat-icon">
                  <Icon size={17} />
                </div>
              </div>
              <div className="iad-stat-value">{value}</div>
              <div className="iad-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="iad-section-label">
          <span className="bar" />
          Quick Actions
        </div>
        <div className="iad-quick-grid">
          <div className="iad-quick-card">
            <div className="iad-quick-icon">
              <FileText size={18} />
            </div>
            <div className="iad-quick-title">Manage Complaints</div>
            <div className="iad-quick-desc">View and update all customer complaints</div>
            <button className="iad-btn" onClick={() => navigate('/admin/complaints')}>
              View All Complaints
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="iad-quick-card featured">
            <span className="iad-featured-tag">Featured</span>
            <div className="iad-quick-icon">
              <Award size={18} />
            </div>
            <div className="iad-quick-title">Generate Certificate</div>
            <div className="iad-quick-desc">Create calibration certificates for resolved complaints</div>
            <button className="iad-btn iad-btn-primary" onClick={() => navigate('/admin/certificate-generator')}>
              <Award size={15} />
              Open Generator
            </button>
          </div>

          <div className="iad-quick-card">
            <div className="iad-quick-icon">
              <BarChart size={18} />
            </div>
            <div className="iad-quick-title">Analytics</div>
            <div className="iad-quick-desc">View detailed reports and analytics</div>
            <button className="iad-btn" onClick={() => navigate('/admin/analytics')}>
              View Analytics
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Recent complaints */}
        <div className="iad-section-label">
          <span className="bar" />
          Recent Activity
        </div>
        <div className="iad-table-card">
          <div className="iad-table-head">
            <span className="iad-table-title">Recent Complaints</span>
            <button className="iad-link-btn" onClick={() => navigate('/admin/complaints')}>
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="iad-spinner-wrap">
              <div className="iad-spinner" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="iad-empty">No complaints found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="iad-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id}>
                      <td className="iad-complaint-id">{c.complaintId}</td>
                      <td>
                        <div className="iad-cust-name">{c.customerName}</div>
                        <div className="iad-cust-company">{c.companyName}</div>
                      </td>
                      <td>{c.productType}</td>
                      <td>
                        <span className={priorityBadgeClass(c.priority)}>{c.priority}</span>
                      </td>
                      <td>
                        <span className={statusBadgeClass(c.status)}>{c.status}</span>
                      </td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="iad-view-btn"
                          onClick={() => handleViewDetails(c.complaintId)}
                          title="View Details"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={handleCloseModal}
          onUpdate={handleComplaintUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;