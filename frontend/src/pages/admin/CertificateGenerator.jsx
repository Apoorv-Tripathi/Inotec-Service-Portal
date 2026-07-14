import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, List,
  CheckCircle, Settings, BarChart2, User, Cpu
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

/* ─── tiny helpers ─── */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3 shadow-sm p-4 mb-4 ${className}`}>{children}</div>
);

const SectionHeading = ({ icon: Icon, title, color = '#1a1a2e' }) => (
  <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${color}20` }}>
    <div className="rounded-2 p-1" style={{ background: `${color}15` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <h6 className="mb-0 fw-bold" style={{ color }}>{title}</h6>
  </div>
);

const Field = ({ label, children, col = 'col-md-6' }) => (
  <div className={col}>
    <label className="form-label fw-semibold text-secondary" style={{ fontSize: 13 }}>
      {label}
    </label>
    {children}
  </div>
);

/* ─── main component ─── */
const CertificateGenerator = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, expiringSoon: 0 });

  const blankForm = {
    // certificateNo is intentionally omitted — it is auto-generated
    // server-side (format: INOTEC/YYYY/MM/001, resets monthly).
    petrolPumpName: '',
    petrolPumpAddress: '',
    contactPerson: '',
    contactNo: '',
    dateOfCalibration: new Date().toISOString().split('T')[0],
    calibrationValidTill: new Date(Date.now() + 365 * 864e5).toISOString().split('T')[0],
    paymentStatus: 'PAID',
    calibratedBy: '',
    calibrationResult: 'Pass',
    machineDetails: { makeModel: '', serialNo: '', range: '150', temperature: '25' },
    conditionCheck: {
      inflatorCondition: 'OK',
      airCompressorCondition: 'OK',
      moistureFilterCondition: 'OK',
      airNozzleCondition: 'OK',
      airHoseCondition: 'OK',
      inputPowerSupply: '230V'
    },
    calibrationData: [
      { standardPressure: 20, measuredPressure: 20, error: 0 },
      { standardPressure: 30, measuredPressure: 30, error: 0 },
      { standardPressure: 40, measuredPressure: 40, error: 0 },
      { standardPressure: 50, measuredPressure: 50, error: 0 },
      { standardPressure: 60, measuredPressure: 60, error: 0 },
      { standardPressure: 70, measuredPressure: 70, error: 0 },
      { standardPressure: 80, measuredPressure: 80, error: 0 },
    ]
  };

  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (tab === 'list') { fetchList(); fetchStats(); }
  }, [tab]);

  const fetchList = async () => {
    try { const r = await api.get('/certificates'); setCertificates(r.data.data); }
    catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try { const r = await api.get('/certificates/stats'); setStats(r.data.data); }
    catch (e) { console.error(e); }
  };

  /* field handlers */
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setMachine = (k, v) => setForm(p => ({ ...p, machineDetails: { ...p.machineDetails, [k]: v } }));
  const setCond = (k, v) => setForm(p => ({ ...p, conditionCheck: { ...p.conditionCheck, [k]: v } }));

  const setCalib = (i, field, val) => {
    const updated = form.calibrationData.map((r, idx) => {
      if (idx !== i) return r;
      const row = { ...r, [field]: parseFloat(val) || 0 };
      row.error = parseFloat((row.measuredPressure - row.standardPressure).toFixed(2));
      return row;
    });
    setForm(p => ({ ...p, calibrationData: updated }));
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const payload = {
        ...form,
        machineDetails: {
          ...form.machineDetails,
          range: parseFloat(form.machineDetails.range) || 100,
          temperature: parseFloat(form.machineDetails.temperature) || 25,
        }
      };

      const createRes = await api.post('/certificates', payload);
      if (!createRes.data.success) throw new Error(createRes.data.message);

      const certId = createRes.data.data._id;
      const certNo = createRes.data.data.certificateNo; // returned by the backend after auto-generation

      const pdfRes = await api.get(`/certificates/${certId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([pdfRes.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certNo.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click(); a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(`✅ Certificate ${certNo} generated & downloaded!`);
      setForm(blankForm);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate certificate.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCert = async (cert) => {
    try {
      const r = await api.get(`/certificates/${cert._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${cert.certificateNo.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch { alert('Download failed'); }
  };

  /* styles */
  const NAVY = '#1a1a2e';
  const BLUE = '#2563eb';

  const tabBtn = (id, label, Icon) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`btn d-flex align-items-center gap-2 px-4 py-2 ${tab === id ? 'text-white' : 'text-secondary bg-white border'}`}
      style={{
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 14,
        background: tab === id ? NAVY : undefined,
        border: tab === id ? 'none' : undefined,
        boxShadow: tab === id ? '0 2px 8px rgba(26,26,46,.3)' : undefined
      }}
    >
      <Icon size={16} />{label}
    </button>
  );

  const conditionOpts = ['OK', 'NOT OK', 'NA', 'Good', 'Fair', 'Poor'];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: NAVY,
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,.3)'
      }}>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
          style={{ borderRadius: 8 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="d-flex align-items-center gap-2">
          <div style={{ background: BLUE, borderRadius: 8, padding: '6px 8px', display: 'flex' }}>
            <FileText size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>
              Certificate Generator
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              INOTEC Calibration Management
            </div>
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          {user?.name}
        </div>
      </nav>

      {/* ── Hero Strip ── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #16213e 100%)`, padding: '28px 0 20px' }}>
        <div className="container text-center">
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>
            Calibration Certificate Generator
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>
            Generate ISO-compliant calibration certificates for tyre inflators
          </p>

          {/* Tab Switcher */}
          <div className="d-flex justify-content-center gap-3">
            {tabBtn('create', 'Generate New', FileText)}
            {tabBtn('list', 'All Certificates', List)}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container py-4" style={{ maxWidth: tab === 'list' ? 1100 : 860 }}>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible d-flex align-items-center gap-2">
            <span>⚠️</span> {error}
            <button className="btn-close ms-auto" onClick={() => setError('')}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible d-flex align-items-center gap-2">
            <span>✅</span> {success}
            <button className="btn-close ms-auto" onClick={() => setSuccess('')}></button>
          </div>
        )}

        {/* ══════ CREATE TAB ══════ */}
        {tab === 'create' && (
          <form onSubmit={handleSubmit}>

            {/* ── Certificate Info ── */}
            <Card>
              <SectionHeading icon={FileText} title="Certificate Information" color={BLUE} />
              <div className="row g-3">
                <Field label="Certificate No.">
                  <input
                    className="form-control"
                    value="Auto-generated on save"
                    disabled
                    readOnly
                    style={{ background: '#f1f5f9', color: '#6b7280', fontStyle: 'italic' }}
                  />
                </Field>
                <Field label="Payment Status *">
                  <select className="form-select" value={form.paymentStatus}
                    onChange={e => set('paymentStatus', e.target.value)}>
                    <option value="PAID">PAID</option>
                    <option value="AMC">AMC</option>
                  </select>
                </Field>
                <Field label="Date of Calibration *" col="col-md-4">
                  <input className="form-control" type="date" value={form.dateOfCalibration}
                    onChange={e => set('dateOfCalibration', e.target.value)} required />
                </Field>
                <Field label="Valid Till *" col="col-md-4">
                  <input className="form-control" type="date" value={form.calibrationValidTill}
                    onChange={e => set('calibrationValidTill', e.target.value)} required />
                </Field>
                <Field label="Calibration Result" col="col-md-4">
                  <select className="form-select" value={form.calibrationResult}
                    onChange={e => set('calibrationResult', e.target.value)}>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </Field>
                <Field label="Calibrated By *">
                  <input className="form-control" value={form.calibratedBy}
                    onChange={e => set('calibratedBy', e.target.value)}
                    placeholder="Technician name" required />
                </Field>
              </div>
            </Card>

            {/* ── Customer Info ── */}
            <Card>
              <SectionHeading icon={User} title="Customer / Petrol Pump Details" color="#7c3aed" />
              <div className="row g-3">
                <Field label="Petrol Pump Name *">
                  <input className="form-control" value={form.petrolPumpName}
                    onChange={e => set('petrolPumpName', e.target.value)}
                    placeholder="Sharma Petrol Pump" required />
                </Field>
                <Field label="Contact Person *">
                  <input className="form-control" value={form.contactPerson}
                    onChange={e => set('contactPerson', e.target.value)}
                    placeholder="Contact person name" required />
                </Field>
                <Field label="Full Address *" col="col-12">
                  <textarea className="form-control" rows={2} value={form.petrolPumpAddress}
                    onChange={e => set('petrolPumpAddress', e.target.value)}
                    placeholder="Full address of the petrol pump" required />
                </Field>
                <Field label="Contact No. *">
                  <input className="form-control" value={form.contactNo}
                    onChange={e => set('contactNo', e.target.value)}
                    placeholder="+91XXXXXXXXXX" required />
                </Field>
              </div>
            </Card>

            {/* ── Machine Details ── */}
            <Card>
              <SectionHeading icon={Cpu} title="Machine / Equipment Details" color="#059669" />
              <div className="row g-3">
                <Field label="Make / Model *">
                  <input className="form-control" value={form.machineDetails.makeModel}
                    onChange={e => setMachine('makeModel', e.target.value)}
                    placeholder="INOTEC / NT-5000" required />
                </Field>
                <Field label="Serial No. *">
                  <input className="form-control" value={form.machineDetails.serialNo}
                    onChange={e => setMachine('serialNo', e.target.value)}
                    placeholder="NT5000-2024-001" required />
                </Field>
                <Field label="Range (PSI)" col="col-md-4">
                  <input className="form-control" type="number" value={form.machineDetails.range}
                    onChange={e => setMachine('range', e.target.value)} placeholder="100" />
                </Field>
                <Field label="Temperature (°C)" col="col-md-4">
                  <input className="form-control" type="number" value={form.machineDetails.temperature}
                    onChange={e => setMachine('temperature', e.target.value)} placeholder="25" />
                </Field>
              </div>
            </Card>

            {/* ── Condition Check ── */}
            <Card>
              <SectionHeading icon={CheckCircle} title="Condition Check" color="#d97706" />
              <div className="row g-3">
                {[
                  ['inflatorCondition', 'Inflator Condition'],
                  ['airCompressorCondition', 'Air Compressor'],
                  ['moistureFilterCondition', 'Moisture Filter'],
                  ['airNozzleCondition', 'Air Nozzle'],
                  ['airHoseCondition', 'Air Hose'],
                ].map(([key, label]) => (
                  <Field key={key} label={label} col="col-md-4">
                    <select className="form-select" value={form.conditionCheck[key]}
                      onChange={e => setCond(key, e.target.value)}>
                      {conditionOpts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                ))}
                <Field label="Input Power Supply" col="col-md-4">
                  <input className="form-control" value={form.conditionCheck.inputPowerSupply}
                    onChange={e => setCond('inputPowerSupply', e.target.value)}
                    placeholder="230V" />
                </Field>
              </div>
            </Card>

            {/* ── Calibration Data ── */}
            <Card>
              <SectionHeading icon={BarChart2} title="Calibration Chart — 7 Readings Required" color={NAVY} />
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-2" style={{ fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: NAVY, color: 'white' }}>
                      <th className="text-center" style={{ width: 60 }}>S.No.</th>
                      <th>Standard Pressure (PSI)</th>
                      <th>Measured Pressure (PSI)</th>
                      <th style={{ width: 120 }}>Error (Auto)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.calibrationData.map((row, i) => (
                      <tr key={i}>
                        <td className="text-center fw-bold text-muted">{i + 1}</td>
                        <td>
                          <input className="form-control form-control-sm" type="number" step="0.1"
                            value={row.standardPressure}
                            onChange={e => setCalib(i, 'standardPressure', e.target.value)} />
                        </td>
                        <td>
                          <input className="form-control form-control-sm" type="number" step="0.1"
                            value={row.measuredPressure}
                            onChange={e => setCalib(i, 'measuredPressure', e.target.value)} />
                        </td>
                        <td>
                          <input className="form-control form-control-sm text-center fw-bold"
                            value={row.error} readOnly
                            style={{
                              background: row.error === 0 ? '#d1fae5' :
                                Math.abs(row.error) <= 2 ? '#fef3c7' : '#fee2e2',
                              color: row.error === 0 ? '#065f46' :
                                Math.abs(row.error) <= 2 ? '#92400e' : '#991b1b',
                              border: 'none'
                            }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <small className="text-muted d-block mt-1">
                🟢 Error = 0 &nbsp;|&nbsp; 🟡 Error ≤ ±2 PSI &nbsp;|&nbsp; 🔴 Error &gt; ±2 PSI
              </small>
            </Card>

            {/* ── Submit ── */}
            <div className="text-center pb-5">
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#94a3b8' : NAVY,
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 48px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(26,26,46,.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm"></span> Generating PDF...</>
                  : <><Download size={20} /> Generate & Download PDF</>
                }
              </button>
            </div>

          </form>
        )}

        {/* ══════ LIST TAB ══════ */}
        {tab === 'list' && (
          <div>
            {/* Stats */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Total', value: stats.total, bg: NAVY, icon: '📋' },
                { label: 'Active', value: stats.active, bg: '#16a34a', icon: '✅' },
                { label: 'Expired', value: stats.expired, bg: '#dc2626', icon: '❌' },
                { label: 'Expiring in 30d', value: stats.expiringSoon, bg: '#d97706', icon: '⚠️' },
              ].map((s, i) => (
                <div className="col-md-3 col-6" key={i}>
                  <div className="text-white text-center rounded-3 py-3 shadow-sm"
                    style={{ background: s.bg }}>
                    <div style={{ fontSize: 22 }}>{s.icon}</div>
                    <h3 className="my-1 fw-bold">{s.value}</h3>
                    <small style={{ opacity: 0.8 }}>{s.label}</small>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
              <div className="d-flex align-items-center justify-content-between p-3"
                style={{ background: NAVY }}>
                <span className="text-white fw-bold">All Certificates</span>
                <button className="btn btn-sm btn-outline-light" onClick={fetchList}>🔄 Refresh</button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: 14 }}>
                  <thead className="bg-light">
                    <tr>
                      <th>Certificate No.</th>
                      <th>Petrol Pump</th>
                      <th>Contact</th>
                      <th>Cal. Date</th>
                      <th>Valid Till</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">
                          No certificates yet. Generate your first one!
                        </td>
                      </tr>
                    ) : certificates.map(c => (
                      <tr key={c._id}>
                        <td className="fw-bold" style={{ color: NAVY }}>{c.certificateNo}</td>
                        <td>
                          <div className="fw-semibold">{c.petrolPumpName}</div>
                          <small className="text-muted">{c.petrolPumpAddress?.substring(0, 28)}…</small>
                        </td>
                        <td>
                          <div>{c.contactPerson}</div>
                          <small className="text-muted">{c.contactNo}</small>
                        </td>
                        <td>{new Date(c.dateOfCalibration).toLocaleDateString('en-GB')}</td>
                        <td>{new Date(c.calibrationValidTill).toLocaleDateString('en-GB')}</td>
                        <td>
                          <span className={`badge bg-${c.paymentStatus === 'AMC' ? 'primary' : 'success'}`}>
                            {c.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${c.status === 'Active' ? 'success' : c.status === 'Expired' ? 'danger' : 'secondary'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                            onClick={() => downloadCert(c)}>
                            <Download size={13} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateGenerator;