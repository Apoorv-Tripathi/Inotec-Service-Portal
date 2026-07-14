import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Landing from './pages/Landing'

import Dashboard from './pages/support/Dashboard'
import LogComplaint from './pages/support/LogComplaint'
import ComplaintDetails from './pages/support/ComplaintDetails'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageComplaints from './pages/admin/ManageComplaints'
import CertificateGenerator from './pages/admin/CertificateGenerator'
import Analytics from './pages/admin/Analytics'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Support */}
          <Route path="/support/dashboard" element={<Dashboard />} />
          <Route path="/support/log-complaint" element={<LogComplaint />} />
          <Route path="/support/complaint/:complaintId" element={<ComplaintDetails />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<ManageComplaints />} />
          <Route path="/admin/certificate-generator" element={<CertificateGenerator />} />
          <Route path="/admin/analytics" element={<Analytics />} />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App