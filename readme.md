# INOTEC Complaint & Calibration Management System

A centralized web-based platform developed for **Innovative Technologies Pvt. Ltd. (INOTEC)** to streamline complaint registration, service tracking, and calibration certificate management.

The system enables support staff to efficiently register customer complaints while providing administrators with powerful tools to monitor service operations, manage complaint lifecycles, and generate calibration certificates from a single dashboard.

---

## Overview

The Complaint & Calibration Management System is designed to digitize and simplify INOTEC's after-sales service workflow.

It replaces manual complaint handling with a secure, role-based platform where complaints can be created, tracked, updated, and resolved efficiently.

The application also includes calibration certificate generation for completed service requests, providing a complete service management solution.

---

## Features

### Support Portal

- Secure Support Staff Login
- Register Customer Complaints
- Upload Complaint Attachments
- View Complaint History
- Track Complaint Status
- View Complaint Details
- Complaint Timeline
- Responsive Dashboard

### Admin Portal

- Secure Administrator Login
- Dashboard with Live Statistics
- Complaint Management
- Update Complaint Status
- Internal Remarks & Notes
- Complaint Timeline
- Calibration Certificate Generator
- Analytics Dashboard
- View Complete Complaint Details

---

## Tech Stack

### Frontend

- React.js
- React Router DOM
- Axios
- Bootstrap
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Express Validator

---

## Project Structure

```
client/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   │   ├── admin/
│   │   └── support/
│   ├── services/
│   └── App.jsx
│
server/
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/
├── config/
└── server.js
```

---

## User Roles

### Administrator

Administrators have complete access to the system, including:

- Managing complaints
- Updating complaint status
- Viewing analytics
- Monitoring service operations
- Generating calibration certificates

### Support Staff

Support users can:

- Register complaints
- View complaints
- Track complaint progress
- Access complaint details

---

## Authentication

The application uses **JWT-based authentication** with role-based authorization.

Each authenticated user receives a secure token which is used to access protected resources.

Supported Roles:

- Admin
- Support

---

## Complaint Workflow

```
Complaint Logged
        │
        ▼
Open
        │
        ▼
Assigned
        │
        ▼
In Progress
        │
        ▼
Resolved
        │
        ▼
Closed
```

---

## Key Modules

- Authentication
- Complaint Management
- Status Tracking
- Complaint Timeline
- File Uploads
- Certificate Generation
- Analytics
- Dashboard

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
```

### Navigate to the project

```bash
cd inotec-complaint-management-system
```

### Install dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

---

## Environment Variables

Create a `.env` file inside the backend.

```env
PORT=5001

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Create a `.env` file inside the frontend.

```env
VITE_API_URL=http://localhost:5001/api
```

---

## Running the Project

### Start Backend

```bash
npm run dev
```

### Start Frontend

```bash
npm run dev
```

---

## Future Enhancements

- Email Notifications
- SMS Notifications
- Engineer Assignment Module
- AMC Management
- QR Code Complaint Tracking
- Service History Reports
- Inventory Management
- Customer Feedback Dashboard

---

## Screenshots

Add screenshots of the following pages:

- Landing Page
- Admin Dashboard
- Support Dashboard
- Complaint Registration
- Complaint Details
- Manage Complaints
- Certificate Generator
- Analytics Dashboard

---

## Security

- JWT Authentication
- Protected Routes
- Role-Based Access Control
- Request Validation
- Secure File Upload Handling

---

## Developed By

**Apoorv Tripathi**

B.Tech Computer Science & Engineering

Full Stack Web Developer

---

## License

This project was developed as a custom service management solution for **Innovative Technologies Pvt. Ltd. (INOTEC)**.

© 2025 Innovative Technologies Pvt. Ltd. All Rights Reserved.
