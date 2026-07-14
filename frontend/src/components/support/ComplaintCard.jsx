import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Calendar, Package } from 'lucide-react';

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();
  return (
    <div className="card mb-3 hover-shadow">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">#{complaint.complaintId}</h5>
          <StatusBadge status={complaint.status} />
        </div>
        <p className="text-muted mb-2">{complaint.subject}</p>
        <div className="d-flex gap-3 mb-3" style={{ fontSize: 14 }}>
          <span><Package size={16} className="me-1" />{complaint.productType}</span>
          <span><Calendar size={16} className="me-1" />{new Date(complaint.createdAt).toLocaleDateString()}</span>
        </div>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => navigate(`/support/complaint/${complaint.complaintId}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ComplaintCard;