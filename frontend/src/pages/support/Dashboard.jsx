import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyComplaints } from '../../services/complaint';
import { AuthContext } from '../../context/AuthContext';
import {
  Building2, LogOut, Plus, Eye, ClipboardList,
  AlertCircle, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await getMyComplaints(params);
      setComplaints(response.data.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  const statCards = [
    { key: 'total', label: 'Total Logged', value: stats.total, icon: ClipboardList, tone: 'neutral' },
    { key: 'open', label: 'Open', value: stats.open, icon: AlertCircle, tone: 'danger' },
    { key: 'inProgress', label: 'In Progress', value: stats.inProgress, icon: Clock, tone: 'info' },
    { key: 'resolved', label: 'Resolved', value: stats.resolved, icon: CheckCircle2, tone: 'success' }
  ];

  const statusBadgeClass = (status) => {
    if (status === 'Open') return 'sd-badge sd-badge-danger';
    if (status === 'In Progress') return 'sd-badge sd-badge-info';
    if (status === 'Resolved') return 'sd-badge sd-badge-success';
    return 'sd-badge sd-badge-neutral';
  };

  const priorityBadgeClass = (priority) => {
    if (priority === 'Critical') return 'sd-badge sd-badge-danger';
    if (priority === 'High') return 'sd-badge sd-badge-warning';
    return 'sd-badge sd-badge-info';
  };

  const filters = [
    { label: 'All', value: '' },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' }
  ];

  return (
    <div className="sd-shell">
      <style>{`
        .sd-shell { min-height: 100vh; background: #f4f5f7; font-feature-settings: "tnum"; }

        .sd-navbar { background: #0d1526; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sd-navbar-inner {
          max-width: 1320px; margin: 0 auto; padding: 14px 28px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sd-brand { display: flex; align-items: center; gap: 12px; }
        .sd-brand-mark {
          width: 36px; height: 36px; border-radius: 8px; background: #3b5bfd;
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .sd-brand-text { display: flex; flex-direction: column; line-height: 1.2; }
        .sd-brand-title { color: #fff; font-weight: 700; font-size: 15px; }
        .sd-brand-sub { color: #8891a7; font-size: 12px; }
        .sd-nav-right { display: flex; align-items: center; gap: 18px; }
        .sd-welcome { color: #c3c8d6; font-size: 13.5px; }
        .sd-welcome strong { color: #fff; font-weight: 600; }
        .sd-logout {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; border: 1px solid rgba(255,255,255,0.18);
          color: #e7e9ee; font-size: 13px; font-weight: 500;
          padding: 7px 14px; border-radius: 6px; transition: all .15s ease;
        }
        .sd-logout:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.3); color: #fff; }

        .sd-subbar { background: #131c30; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sd-subbar-inner {
          max-width: 1320px; margin: 0 auto; padding: 9px 28px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sd-eyebrow {
          display: flex; align-items: center; gap: 10px;
          color: #9aa3ba; font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
        }
        .sd-eyebrow-bar { width: 3px; height: 13px; background: #3b5bfd; display: inline-block; border-radius: 1px; }
        .sd-subbar-date { color: #6b7488; font-size: 12px; }

        .sd-container { max-width: 1320px; margin: 0 auto; padding: 36px 28px 56px; }
        .sd-page-title { font-size: 26px; font-weight: 700; color: #101828; letter-spacing: -0.01em; margin-bottom: 4px; }
        .sd-page-subtitle { color: #667085; font-size: 14px; margin-bottom: 28px; }

        .sd-header-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
        }
        .sd-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #3b5bfd; border: 1px solid #3b5bfd; color: #fff;
          font-size: 13.5px; font-weight: 600; padding: 10px 18px;
          border-radius: 7px; transition: all .15s ease;
        }
        .sd-btn-primary:hover { background: #2f49d1; border-color: #2f49d1; }

        .sd-stat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px;
        }
        @media (max-width: 900px) { .sd-stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .sd-stat-grid { grid-template-columns: 1fr; } }

        .sd-stat-card {
          background: #fff; border: 1px solid #e6e8ee; border-radius: 10px;
          padding: 20px; position: relative; overflow: hidden;
        }
        .sd-stat-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
        .sd-stat-card.tone-neutral::before { background: #3b5bfd; }
        .sd-stat-card.tone-danger::before { background: #d92d20; }
        .sd-stat-card.tone-info::before { background: #0086c9; }
        .sd-stat-card.tone-success::before { background: #12925c; }

        .sd-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .sd-stat-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .tone-neutral .sd-stat-icon { background: #eef1ff; color: #3b5bfd; }
        .tone-danger .sd-stat-icon { background: #fef3f2; color: #d92d20; }
        .tone-info .sd-stat-icon { background: #eaf8ff; color: #0086c9; }
        .tone-success .sd-stat-icon { background: #ecfdf3; color: #12925c; }

        .sd-stat-value { font-size: 34px; font-weight: 700; color: #101828; line-height: 1; margin-bottom: 6px; }
        .sd-stat-label { color: #667085; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }

        .sd-section-label {
          display: flex; align-items: center; gap: 10px;
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #667085; margin-bottom: 14px;
        }
        .sd-section-label .bar { width: 3px; height: 13px; background: #3b5bfd; border-radius: 1px; }

        .sd-filter-card {
          background: #fff; border: 1px solid #e6e8ee; border-radius: 10px;
          padding: 14px 18px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .sd-filter-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #98a2b3; margin-right: 6px;
        }
        .sd-chip {
          font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 999px;
          border: 1px solid #d0d5dd; background: #fff; color: #344054; transition: all .15s ease;
        }
        .sd-chip:hover { border-color: #3b5bfd; color: #3b5bfd; }
        .sd-chip.active { background: #3b5bfd; border-color: #3b5bfd; color: #fff; }

        .sd-table-card { background: #fff; border: 1px solid #e6e8ee; border-radius: 10px; overflow: hidden; }
        .sd-table { width: 100%; border-collapse: collapse; }
        .sd-table thead th {
          background: #f9fafb; text-align: left;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #667085; padding: 12px 22px; border-bottom: 1px solid #e6e8ee;
        }
        .sd-table tbody td {
          padding: 15px 22px; border-bottom: 1px solid #f0f1f5;
          font-size: 13.5px; color: #344054; vertical-align: middle;
        }
        .sd-table tbody tr:last-child td { border-bottom: none; }
        .sd-table tbody tr:hover { background: #fafbfc; }
        .sd-cust-name { color: #101828; font-weight: 600; }
        .sd-cust-company { color: #98a2b3; font-size: 12px; }
        .sd-complaint-id { font-weight: 700; color: #101828; }

        .sd-badge {
          display: inline-block; font-size: 11.5px; font-weight: 600;
          padding: 3px 10px; border-radius: 999px; border: 1px solid transparent;
        }
        .sd-badge-danger { background: #fef3f2; color: #b42318; border-color: #fecdca; }
        .sd-badge-warning { background: #fffaeb; color: #b54708; border-color: #fedf89; }
        .sd-badge-info { background: #eaf8ff; color: #026aa2; border-color: #b9e6fe; }
        .sd-badge-success { background: #ecfdf3; color: #067647; border-color: #abefc6; }
        .sd-badge-neutral { background: #f2f4f7; color: #344054; border-color: #eaecf0; }

        .sd-view-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600;
          border: 1px solid #d0d5dd; background: #fff; color: #344054;
          padding: 6px 12px; border-radius: 6px;
        }
        .sd-view-btn:hover { border-color: #3b5bfd; color: #3b5bfd; }

        .sd-empty { text-align: center; padding: 56px 20px; color: #98a2b3; font-size: 14px; }
        .sd-empty-btn {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 14px;
          background: #3b5bfd; border: 1px solid #3b5bfd; color: #fff;
          font-size: 13.5px; font-weight: 600; padding: 9px 16px; border-radius: 7px;
        }
        .sd-spinner-wrap { display: flex; justify-content: center; padding: 56px 20px; }
        .sd-spinner {
          width: 28px; height: 28px; border: 3px solid #e6e8ee; border-top-color: #3b5bfd;
          border-radius: 50%; animation: sd-spin 0.7s linear infinite;
        }
        @keyframes sd-spin { to { transform: rotate(360deg); } }
      `}</style>

      <nav className="sd-navbar">
        <div className="sd-navbar-inner">
          <div className="sd-brand">
            <div className="sd-brand-mark"><Building2 size={17} /></div>
            <div className="sd-brand-text">
              <span className="sd-brand-title">INOTEC Support</span>
              <span className="sd-brand-sub">Complaint Logging Console</span>
            </div>
          </div>
          <div className="sd-nav-right">
            <span className="sd-welcome">Welcome, <strong>{user?.name}</strong></span>
            <button className="sd-logout" onClick={logout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="sd-subbar">
        <div className="sd-subbar-inner">
          <span className="sd-eyebrow">
            <span className="sd-eyebrow-bar" />
            Internal Operations Platform
          </span>
          <span className="sd-subbar-date">{today}</span>
        </div>
      </div>

      <div className="sd-container">
        <div className="sd-header-row">
          <div>
            <h1 className="sd-page-title">Support Dashboard</h1>
            <p className="sd-page-subtitle" style={{ marginBottom: 0 }}>
              Log new complaints and track everything you've registered.
            </p>
          </div>
          <button className="sd-btn-primary" onClick={() => navigate('/support/log-complaint')}>
            <Plus size={16} />
            Log New Complaint
          </button>
        </div>

        <div className="sd-stat-grid">
          {statCards.map(({ key, label, value, icon: Icon, tone }) => (
            <div key={key} className={`sd-stat-card tone-${tone}`}>
              <div className="sd-stat-top">
                <div className="sd-stat-icon"><Icon size={17} /></div>
              </div>
              <div className="sd-stat-value">{value}</div>
              <div className="sd-stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="sd-section-label">
          <span className="bar" />
          Your Logged Complaints
        </div>

        <div className="sd-filter-card">
          <span className="sd-filter-label">Filter</span>
          {filters.map((f) => (
            <button
              key={f.label}
              className={`sd-chip ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="sd-table-card">
          {loading ? (
            <div className="sd-spinner-wrap"><div className="sd-spinner" /></div>
          ) : complaints.length === 0 ? (
            <div className="sd-empty">
              <div>No complaints found</div>
              <button className="sd-empty-btn" onClick={() => navigate('/support/log-complaint')}>
                <Plus size={16} />
                Log Your First Complaint
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="sd-table">
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
                      <td className="sd-complaint-id">{c.complaintId}</td>
                      <td>
                        <div className="sd-cust-name">{c.customerName}</div>
                        <div className="sd-cust-company">{c.companyName}</div>
                      </td>
                      <td>{c.productType}</td>
                      <td><span className={priorityBadgeClass(c.priority)}>{c.priority}</span></td>
                      <td><span className={statusBadgeClass(c.status)}>{c.status}</span></td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="sd-view-btn"
                          onClick={() => navigate(`/support/complaint/${c.complaintId}`)}
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
    </div>
  );
};

export default Dashboard;