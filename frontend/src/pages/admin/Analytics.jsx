import React from 'react';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <button 
            className="btn btn-link text-white text-decoration-none" 
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <span className="navbar-brand">Analytics Dashboard</span>
          <div></div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="card">
          <div className="card-body text-center py-5">
            <h4 className="mb-3">Analytics Dashboard</h4>
            <p className="text-muted">Coming soon... This will include:</p>
            <ul className="list-unstyled text-muted">
              <li>📊 Monthly complaint trends</li>
              <li>⏱️ Average resolution time</li>
              <li>📈 Product-wise breakdown</li>
              <li>🗺️ Location-based analytics</li>
              <li>⭐ Customer satisfaction ratings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;