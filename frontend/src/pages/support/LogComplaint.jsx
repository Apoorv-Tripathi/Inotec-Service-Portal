import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../../services/complaint';
import { AuthContext } from '../../context/AuthContext';
import { PRODUCT_TYPES, COMPLAINT_CATEGORIES, PRIORITIES } from '../../utils/constants';
import { ArrowLeft, ClipboardList } from 'lucide-react';

const LogComplaint = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    companyName: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    productType: '',
    productModel: '',
    serialNumber: '',
    category: '',
    priority: 'Medium',
    subject: '',
    description: ''
  });
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'object') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    files.forEach(file => {
      formDataToSend.append('attachments', file);
    });

    try {
      await createComplaint(formDataToSend);
      alert('Complaint registered successfully!');
      navigate('/support/dashboard');
    } catch (error) {
      alert('Failed to register complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lc-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .lc-shell { min-height: 100vh; background: #F4F6FA; font-family: 'Inter', sans-serif; }
        input, select, textarea { font-family: 'Inter', sans-serif; }

        /* ---------- Top strip ---------- */
        .lc-topstrip {
          background: #071529; height: 36px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 40px; border-bottom: 1px solid #ffffff0f;
        }
        .lc-topstrip span { color: rgba(255,255,255,0.4); font-size: 11px; }
        .lc-status-dot {
          display: inline-block; width: 7px; height: 7px; border-radius: 50%;
          background: #22C55E; box-shadow: 0 0 0 2px #22c55e30; margin-right: 6px;
        }

        /* ---------- Top navigation ---------- */
        .lc-navbar { background: #0B1D3A; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .lc-navbar-inner {
          max-width: 1000px; margin: 0 auto; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .lc-back {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; border: none; color: rgba(255,255,255,0.6);
          font-size: 13.5px; font-weight: 500; padding: 0; cursor: pointer; font-family: inherit;
        }
        .lc-back:hover { color: #fff; }
        .lc-brand { display: flex; align-items: center; gap: 12px; }
        .lc-brand-mark {
          width: 34px; height: 34px; border-radius: 8px; background: #1A56DB;
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .lc-brand-title { color: #fff; font-weight: 700; font-size: 15px; }
        .lc-brand-sub { color: rgba(255,255,255,0.38); font-size: 10px; letter-spacing: 0.3px; }

        .lc-subbar { background: #0D2952; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .lc-subbar-inner { max-width: 1000px; margin: 0 auto; padding: 9px 40px; }
        .lc-eyebrow {
          display: flex; align-items: center; gap: 10px;
          color: rgba(255,255,255,0.5); font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
        }
        .lc-eyebrow-bar { width: 3px; height: 13px; background: #1A56DB; border-radius: 1px; }

        /* ---------- Page body ---------- */
        .lc-container { max-width: 1000px; margin: 0 auto; padding: 36px 40px 60px; }
        .lc-page-title { font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; margin-bottom: 4px; }
        .lc-page-subtitle { color: #6B7280; font-size: 13.5px; margin-bottom: 26px; }

        .lc-card {
          background: #FFFFFF; border: 1.5px solid #D1D9E6; border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden;
        }
        .lc-card-body { padding: 32px 32px 36px; }

        .lc-section {
          display: flex; align-items: center; gap: 10px; margin: 28px 0 16px;
        }
        .lc-section:first-child { margin-top: 0; }
        .lc-section-bar { width: 3px; height: 15px; background: #1A56DB; border-radius: 2px; }
        .lc-section-title {
          font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280;
        }

        .lc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        .lc-field-full { grid-column: 1 / -1; }

        .lc-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 7px; letter-spacing: 0.1px; }
        .lc-label .req { color: #B42318; margin-left: 2px; }

        .lc-input, .lc-select, .lc-textarea {
          width: 100%; padding: 11px 14px; border: 1.5px solid #D1D9E6; border-radius: 7px;
          font-size: 13.5px; color: #0F172A; background: #F4F6FA; transition: all .15s ease;
        }
        .lc-input::placeholder, .lc-textarea::placeholder { color: #9AA3BA; }
        .lc-input:focus, .lc-select:focus, .lc-textarea:focus {
          outline: none; border-color: #1A56DB; box-shadow: 0 0 0 3px rgba(26,86,219,0.12); background: #fff;
        }
        .lc-textarea { resize: vertical; min-height: 96px; font-family: 'Inter', sans-serif; }

        .lc-file-wrap {
          border: 1.5px dashed #D1D9E6; border-radius: 7px; padding: 16px; background: #F4F6FA;
        }
        .lc-file-wrap input[type="file"] { font-size: 13px; color: #374151; width: 100%; }
        .lc-file-hint { font-size: 11.5px; color: #6B7280; margin-top: 8px; display: block; }

        .lc-submit-row { margin-top: 30px; padding-top: 22px; border-top: 1px solid #E5EAF2; }
        .lc-submit-btn {
          width: 100%; padding: 13px; background: #1A56DB; color: #fff; border: none;
          border-radius: 8px; font-weight: 700; font-size: 14.5px; letter-spacing: 0.2px;
          cursor: pointer; transition: opacity .15s ease;
        }
        .lc-submit-btn:hover { opacity: 0.92; }
        .lc-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        @media (max-width: 700px) {
          .lc-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Top strip */}
      <div className="lc-topstrip">
        <div style={{ display: 'flex', gap: 24 }}>
          <span>support@inotec.co.in</span>
          <span>+91-9453245747</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span className="lc-status-dot" />All Systems Operational
          </span>
        </div>
      </div>

      {/* Top navigation */}
      <nav className="lc-navbar">
        <div className="lc-navbar-inner">
          <button className="lc-back" onClick={() => navigate('/support/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="lc-brand">
            <div className="lc-brand-mark">
              <ClipboardList size={17} />
            </div>
            <div>
              <div className="lc-brand-title">Log a Complaint</div>
              <div className="lc-brand-sub">INOTEC · Service Management Portal</div>
            </div>
          </div>
          <div style={{ width: 150 }} />
        </div>
      </nav>

      <div className="lc-subbar">
        <div className="lc-subbar-inner">
          <span className="lc-eyebrow">
            <span className="lc-eyebrow-bar" />
            Internal Operations Platform
          </span>
        </div>
      </div>

      <div className="lc-container">
        <h1 className="lc-page-title">Log a Complaint</h1>
        <p className="lc-page-subtitle">Register a new customer service complaint on behalf of a client.</p>

        <div className="lc-card">
          <div className="lc-card-body">
            <form onSubmit={handleSubmit}>
              {/* Customer Details */}
              <div className="lc-section">
                <span className="lc-section-bar" />
                <span className="lc-section-title">Customer Details</span>
              </div>
              <div className="lc-row">
                <div>
                  <label className="lc-label">Name<span className="req">*</span></label>
                  <input
                    type="text"
                    className="lc-input"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="lc-label">Mobile<span className="req">*</span></label>
                  <input
                    type="tel"
                    className="lc-input"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="lc-label">Company Name<span className="req">*</span></label>
                  <input
                    type="text"
                    className="lc-input"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="lc-label">City<span className="req">*</span></label>
                  <input
                    type="text"
                    className="lc-input"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Product Information */}
              <div className="lc-section">
                <span className="lc-section-bar" />
                <span className="lc-section-title">Product Information</span>
              </div>
              <div className="lc-row">
                <div>
                  <label className="lc-label">Product Type<span className="req">*</span></label>
                  <select
                    className="lc-select"
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Product</option>
                    {PRODUCT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lc-label">Model</label>
                  <input
                    type="text"
                    className="lc-input"
                    name="productModel"
                    value={formData.productModel}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Complaint Details */}
              <div className="lc-section">
                <span className="lc-section-bar" />
                <span className="lc-section-title">Complaint Details</span>
              </div>
              <div className="lc-row">
                <div>
                  <label className="lc-label">Category<span className="req">*</span></label>
                  <select
                    className="lc-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {COMPLAINT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lc-label">Priority<span className="req">*</span></label>
                  <select
                    className="lc-select"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="lc-field-full">
                  <label className="lc-label">Subject<span className="req">*</span></label>
                  <input
                    type="text"
                    className="lc-input"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="lc-field-full">
                  <label className="lc-label">Description<span className="req">*</span></label>
                  <textarea
                    className="lc-textarea"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="lc-field-full">
                  <label className="lc-label">Attachments</label>
                  <div className="lc-file-wrap">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFiles(Array.from(e.target.files))}
                    />
                    <span className="lc-file-hint">Max 5 images, 5MB each</span>
                  </div>
                </div>
              </div>

              <div className="lc-submit-row">
                <button
                  type="submit"
                  className="lc-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogComplaint;