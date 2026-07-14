import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status] || 'secondary';
  return <span className={`badge bg-${color}`}>{status}</span>;
};

export default StatusBadge;