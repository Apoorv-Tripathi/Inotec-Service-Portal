import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const C = {
  navy: "#0B1D3A",
  navyDark: "#071529",
  blue: "#1A56DB",
  blueDark: "#1444B8",
  blueLight: "#EBF0FD",
  border: "#D1D9E6",
  borderLight: "#E8EDF5",
  text: "#0F172A",
  textMid: "#374151",
  muted: "#6B7280",
  white: "#FFFFFF",
  bg: "#F4F6FA",
  success: "#15803D",
  successBg: "#F0FDF4",
  surface: "#FFFFFF",
  divider: "#E5EAF2",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: ${C.bg}; color: ${C.text}; }
  input { font-family: 'Inter', sans-serif; }
  input:focus { outline: none; border-color: ${C.blue} !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.12) !important; }
  button:hover { opacity: 0.93; }
  .card-hover:hover { border-color: ${C.blue} !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.1) !important; }
`;

const Tag = ({ children, color = C.blue }) => (
  <span style={{
    fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
    textTransform: "uppercase", padding: "3px 9px",
    borderRadius: 3, background: `${color}14`,
    color, border: `1px solid ${color}28`
  }}>{children}</span>
);

const Dot = ({ color = C.success }) => (
  <span style={{
    display: "inline-block", width: 7, height: 7,
    borderRadius: "50%", background: color,
    boxShadow: `0 0 0 2px ${color}30`, marginRight: 6
  }} />
);

export default function App() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [active, setActive] = useState(null);
  // Admin Login Form
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: ""
  });
  // Service Coordinator Login Form
  const [opForm, setOpForm] = useState({
    mobile: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleLogin = async (type) => {

    setError("");
    setLoading(true);
    try {
      if (type === "admin") {
        // ===== ADMIN LOGIN =====
        const response = await api.post("/auth/admin-login", {
          email: adminForm.email,
          password: adminForm.password,
        });
        login(response.data.token, response.data.user);
        navigate("/admin/dashboard");
      } else {
        // ===== CUSTOMER LOGIN VALIDATION =====
        if (!/^\+91[0-9]{10}$/.test(opForm.mobile)) {
          setError("Please enter mobile number in format: +919876543210");
          setLoading(false);
          return;
        }
        // ===== CUSTOMER LOGIN =====
        const response = await api.post("/auth/customer-login", {
          mobileNumber: opForm.mobile,
          password: opForm.password,
        });
        login(response.data.token, response.data.user);
        navigate("/support/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ═══════════════ TOP STRIP ═══════════════ */}
        <div style={{
          background: C.navyDark, height: 36,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px", borderBottom: "1px solid #ffffff0f"
        }}>
          <div style={{ display: "flex", gap: 24 }}>
            {["support@inotec.co.in", "+91-9453245747", "+91-9453283173"].map(t => (
              <span key={t} style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ display: "flex", alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              <Dot color="#22C55E" />All Systems Operational
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>Portal v2.1 · 2025</span>
          </div>
        </div>

        {/* ═══════════════ NAVBAR ═══════════════ */}
        <nav style={{
          background: C.navy, height: 60,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky", top: 0, zIndex: 100
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36, background: C.blue,
              borderRadius: 8, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontWeight: 900, color: C.white, fontSize: 13, letterSpacing: 0.5
            }}>IN</div>
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 14, letterSpacing: 0.2 }}>
                INOTEC
              </div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 10, letterSpacing: 0.3 }}>
                Innovative Technologies Pvt. Ltd.
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", margin: "0 10px" }} />
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 500 }}>
              Service Management Portal
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Tag color="#94A3B8">ISO 9001:2015</Tag>
            <Tag color="#22C55E">MSME Registered</Tag>
          </div>
        </nav>

        {/* ═══════════════ HERO ═══════════════ */}
        <div style={{
          background: `linear-gradient(155deg, ${C.navy} 0%, #0D2952 60%, #0F3070 100%)`,
          padding: "56px 40px 52px", position: "relative", overflow: "hidden"
        }}>
          {/* Background grid pattern */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />

          <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 3, height: 18, background: C.blue, borderRadius: 2 }} />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Internal Operations Platform
              </span>
            </div>

            <h1 style={{
              color: C.white, fontSize: 34, fontWeight: 800,
              lineHeight: 1.2, letterSpacing: -0.8, marginBottom: 14
            }}>
              Innovative Technologies Private Limited<br />
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 22, fontWeight: 500, letterSpacing: 0 }}>
                Complaint & Calibration Management System
              </span>
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.45)", fontSize: 13.5,
              lineHeight: 1.8, maxWidth: 580, marginBottom: 36
            }}>
              A centralized platform for managing customer service complaints, field operations, and calibration certificate issuance across all INOTEC product lines.
            </p>

            {/* Stat Row */}
            <div style={{
              display: "flex", gap: 0,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, overflow: "hidden",
              width: "fit-content"
            }}>
              {[
                { v: "1,000+", l: "Installations" },
                { v: "7+ Years", l: "In Service" },
                { v: "ISO 9001", l: "Certified" },
                { v: "24 × 7", l: "Field Support" },
                { v: "GeM", l: "Registered" },
              ].map((s, i, arr) => (
                <div key={i} style={{
                  padding: "14px 28px", textAlign: "center",
                  borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none"
                }}>
                  <div style={{ color: C.white, fontWeight: 800, fontSize: 17 }}>{s.v}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10.5, marginTop: 3, letterSpacing: 0.3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════ MAIN ═══════════════ */}
        <div style={{ flex: 1, maxWidth: 860, width: "100%", margin: "0 auto", padding: "36px 40px 60px" }}>

          {/* Access Selection Label */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: C.muted,
              letterSpacing: 1.4, textTransform: "uppercase"
            }}>Portal Access</span>
            <div style={{ flex: 1, height: 1, background: C.divider }} />
          </div>

          {/* Access Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>

            {/* Admin */}
            <div
              className="card-hover"
              onClick={() => setActive(active === "admin" ? null : "admin")}
              style={{
                background: C.surface,
                border: `1.5px solid ${active === "admin" ? C.blue : C.border}`,
                borderRadius: 10, padding: "22px 24px",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: active === "admin" ? `0 0 0 3px rgba(26,86,219,0.1)` : "0 1px 3px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 9,
                  background: active === "admin" ? `${C.navy}12` : C.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19
                }}>⚙️</div>
                {active === "admin"
                  ? <Tag color={C.navy}>Selected</Tag>
                  : <span style={{ fontSize: 11, color: C.muted }}>Click to expand</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                Administrator
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>
                Full system access. Manage complaints, assign engineers, generate calibration certificates, and monitor operations.
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Dashboard", "Complaints", "Certificates", "Analytics"].map(t => (
                  <span key={t} style={{
                    fontSize: 10, padding: "3px 8px", borderRadius: 4,
                    background: C.bg, color: C.muted, fontWeight: 600,
                    border: `1px solid ${C.borderLight}`
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Operator */}
            <div
              className="card-hover"
              onClick={() => setActive(active === "op" ? null : "op")}
              style={{
                background: C.surface,
                border: `1.5px solid ${active === "op" ? C.blue : C.border}`,
                borderRadius: 10, padding: "22px 24px",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: active === "op" ? `0 0 0 3px rgba(26,86,219,0.1)` : "0 1px 3px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 9,
                  background: active === "op" ? `${C.blue}12` : C.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19
                }}>🎧</div>
                {active === "op"
                  ? <Tag color={C.blue}>Selected</Tag>
                  : <span style={{ fontSize: 11, color: C.muted }}>Click to expand</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                Service Coordinator
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>
                Register and manage service complaints on behalf of petrol pump clients. Track complaint progress and history.
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Log Complaint", "Track Status", "View History", "Customer Info"].map(t => (
                  <span key={t} style={{
                    fontSize: 10, padding: "3px 8px", borderRadius: 4,
                    background: C.bg, color: C.muted, fontWeight: 600,
                    border: `1px solid ${C.borderLight}`
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px",
              borderRadius: "6px",
              background: "#FEE2E2",
              color: "#B91C1C",
              border: "1px solid #FCA5A5",
              fontSize: "13px",
            }}
          >
          {error}
          </div>
        )}
          {/* ─── Login Panel ─── */}
          {active && (
            <div style={{
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 28,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
            }}>
              {/* Panel Header */}
              <div style={{
                background: active === "admin" ? C.navy : C.blue,
                padding: "16px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>
                    {active === "admin" ? "Administrator Login" : "Service Coordinator Login"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 2 }}>
                    {active === "admin"
                      ? "Restricted — INOTEC management team only"
                      : "Authorized INOTEC service coordinators only"}
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  style={{
                    background: "rgba(255,255,255,0.12)", border: "none",
                    color: C.white, width: 28, height: 28, borderRadius: 6,
                    cursor: "pointer", fontSize: 14, fontWeight: 700
                  }}>✕</button>
              </div>

              {/* Form */}
              <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "end" }}>
                {active === "admin" ? (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, letterSpacing: 0.3 }}>
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        placeholder="admin@inotec.co.in"
                        value={adminForm.email}
                        onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))}
                        style={{
                          width: "100%", padding: "10px 13px",
                          border: `1.5px solid ${C.border}`, borderRadius: 7,
                          fontSize: 13, color: C.text, background: C.bg
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, letterSpacing: 0.3 }}>
                        PASSWORD
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••"
                        value={adminForm.password}
                        onChange={e => setAdminForm(p => ({ ...p, password: e.target.value }))}
                        style={{
                          width: "100%", padding: "10px 13px",
                          border: `1.5px solid ${C.border}`, borderRadius: 7,
                          fontSize: 13, color: C.text, background: C.bg
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, letterSpacing: 0.3 }}>
                        MOBILE NUMBER
                      </label>
                      <input
                        type="tel"
                        placeholder="+91XXXXXXXXXX"
                        value={opForm.mobile}
                        onChange={e => setOpForm(p => ({ ...p, mobile: e.target.value }))}
                        style={{
                          width: "100%", padding: "10px 13px",
                          border: `1.5px solid ${C.border}`, borderRadius: 7,
                          fontSize: 13, color: C.text, background: C.bg
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, letterSpacing: 0.3 }}>
                        PASSWORD
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••"
                        value={opForm.password}
                        onChange={e => setOpForm(p => ({ ...p, password: e.target.value }))}
                        style={{
                          width: "100%", padding: "10px 13px",
                          border: `1.5px solid ${C.border}`, borderRadius: 7,
                          fontSize: 13, color: C.text, background: C.bg
                        }}
                      />
                    </div>
                  </>
                )}
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.muted }}>
                    🔒 Secured connection · Session expires in 24h
                  </span>
                  <button
                    onClick={() => handleLogin(active === "admin" ? "admin" : "op")}
                    disabled={loading}
                    style={{
                      padding: "10px 32px",
                      background: active === "admin" ? C.navy : C.blue,
                      color: C.white, border: "none",
                      borderRadius: 7, fontWeight: 700, fontSize: 13,
                      cursor: "pointer", letterSpacing: 0.2,
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── System Info ─── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Capabilities */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, overflow: "hidden"
            }}>
              <div style={{
                padding: "12px 18px", borderBottom: `1px solid ${C.divider}`,
                fontSize: 11, fontWeight: 700, color: C.muted,
                letterSpacing: 1.2, textTransform: "uppercase", background: C.bg
              }}>
                System Modules
              </div>
              {[
                { icon: "📋", t: "Complaint Management", d: "End-to-end tracking from log to resolution" },
                { icon: "📄", t: "Certificate Generation", d: "ISO-compliant PDF with QR verification" },
                { icon: "📊", t: "Operations Analytics", d: "Resolution KPIs and product-wise breakdown" },
                { icon: "📱", t: "SMS Notifications", d: "Automated alerts at every status change" },
              ].map((f, i, arr) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "13px 18px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.divider}` : "none",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.textMid }}>{f.t}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Company Info */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, overflow: "hidden"
            }}>
              <div style={{
                padding: "12px 18px", borderBottom: `1px solid ${C.divider}`,
                fontSize: 11, fontWeight: 700, color: C.muted,
                letterSpacing: 1.2, textTransform: "uppercase", background: C.bg
              }}>
                Company Information
              </div>
              <div style={{ padding: "16px 18px" }}>
                {[
                  { l: "Legal Name", v: "Innovative Technologies Pvt. Ltd." },
                  { l: "Brand", v: "INOTEC" },
                  { l: "Established", v: "2018" },
                  { l: "Headquarters", v: "Kanpur, Uttar Pradesh" },
                  { l: "Address", v: "Plot 216, Sec-J, Gujaini, Udyog Nagar, Kanpur — 208022" },
                  { l: "Certifications", v: "ISO 9001:2015 · MSME · GeM" },
                  { l: "Products", v: "Tyre Inflators · Nitrogen Inflators · Air Compressors · LED Displays" },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "100px 1fr",
                    gap: 10, padding: "7px 0",
                    borderBottom: i < 6 ? `1px solid ${C.divider}` : "none"
                  }}>
                    <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{r.l}</span>
                    <span style={{ fontSize: 11, color: C.textMid, fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <div style={{
          borderTop: `1px solid ${C.divider}`,
          background: C.surface,
          padding: "14px 40px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ fontSize: 11, color: C.muted }}>
            © 2025 Innovative Technologies Private Limited · All rights reserved
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {["support@inotec.co.in", "www.inotec.co.in", "+91-9453245747"].map(t => (
              <span key={t} style={{ fontSize: 11, color: C.muted }}>{t}</span>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}