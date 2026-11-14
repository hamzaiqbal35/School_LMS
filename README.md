# School Management System (LMS)

A production-ready, full-stack School Management System architected to streamline institutional administration, automate academic workflows, manage fee lifecycles, and deliver dedicated portals for administrators, faculty, and students. Built with Next.js, Express.js, MongoDB, and modern TypeScript tooling.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Administrative Control Panel](#administrative-control-panel)
  - [Faculty & Teacher Portal](#faculty--teacher-portal)
  - [Academic Structure & Master Data](#academic-structure--master-data)
  - [Fee Management & Challan Engine](#fee-management--challan-engine)
  - [Attendance Tracking & Audit Control](#attendance-tracking--audit-control)
  - [Teacher Substitution Workflow](#teacher-substitution-workflow)
  - [Public Portal & Inquiries](#public-portal--inquiries)
- [System Architecture & Tech Stack](#system-architecture--tech-stack)
  - [Frontend Architecture](#frontend-architecture)
  - [Backend Architecture](#backend-architecture)
  - [Security Implementation](#security-implementation)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [System Prerequisites](#system-prerequisites)
  - [Repository Setup](#repository-setup)
  - [Backend Configuration (`lms-server`)](#backend-configuration-lms-server)
  - [Frontend Configuration (`lms-client`)](#frontend-configuration-lms-client)
  - [Database Initialization & Seeding](#database-initialization--seeding)
- [REST API Reference](#rest-api-reference)
- [Deployment Guidelines](#deployment-guidelines)
- [License](#license)

---

## Overview

School Management System (LMS) is a centralized school enterprise resource planning (ERP) platform designed for primary and secondary educational institutions. The application separates concerns between a reactive client application built on Next.js 16 and a secured Express.js 5 RESTful API backed by MongoDB. It provides comprehensive record keeping, financial accounting, dynamic timetable scheduling, faculty substitution management, and real-time analytical reporting.

---

## Key Features

### Administrative Control Panel
- **Institutional Analytics**: Real-time metrics tracking student enrollment totals, active staff counts, revenue status, and attendance percentages via interactive Recharts visualizations.
- **Student Lifecycle Management**: Complete enrollment workflow including student admission, profile modification, academic status toggling, and class promotion.
- **Faculty Directory**: Centralized teacher directory handling qualifications, assigned disciplines, contact records, and system account credentials.
- **Role-Based Access Control**: Strict multi-tiered permissions enforcing distinct privileges for Administrators, Teachers, and Students.

### Faculty & Teacher Portal
- **Classroom Hub**: Instant overview of assigned academic classes, active sections, and student rosters.
- **Daily Attendance Marking**: Streamlined roll-call interface allowing rapid daily recording with support for Present, Absent, and Late indicators.
- **Dynamic Daily Schedule**: Automated aggregation of regular class assignments alongside assigned temporary substitution periods for the current day.
- **Profile Management**: Teacher profile dashboard with profile picture uploads backed by Cloudinary storage.

### Academic Structure & Master Data
- **Class & Section Hierarchies**: Dynamic configuration of academic classes, associated sections, and subject curricula.
- **Timetable Slot Allocation**: Configurable time slot definitions across operating weekdays with start and end time parameters.
- **Data Initialization**: CLI seeding utilities to populate standard class structures, subjects, and periods upon fresh deployment.

### Fee Management & Challan Engine
- **Class Fee Structures**: Granular fee configuration supporting base tuition, admission charges, lab fees, examination charges, and custom line items.
- **Automated Challan Generation**: Batch generation of monthly or periodic student fee challans with unique tracking identifiers.
- **PDF Generation & QR Codes**: Automated generation of print-ready bank challans rendered via Puppeteer and Sparticuz Chromium, embedded with scannable verification QR codes.
- **Payment Verification Workflow**: Administrative reconciliation module to mark challans as paid, issue verification timestamps, and track overdue receivables.

### Attendance Tracking & Audit Control
- **Student Attendance Logs**: Date-filtered historical attendance queries across specific classes and sections.
- **Teacher Attendance Records**: Staff-wide daily check-in and attendance auditing.
- **Attendance Freezing**: Administrative security feature to freeze finalized attendance records, preventing unauthorized retroactive modifications.

### Teacher Substitution Workflow
- **Unassigned Period Detection**: Automatic detection of class schedules left unattended due to teacher leaves or absences.
- **Teacher Availability Engine**: Automatic resolution of eligible, non-conflicting teachers for any requested period.
- **Substitution Scheduling**: Instant assignment of substitute teachers with direct updates reflected on the substitute teacher's daily schedule.

### Public Portal & Inquiries
- **Marketing & Landing Pages**: Modern landing page with institutional information, curriculum summaries, and contact details.
- **Contact Inquiries**: Functional inquiry submission form delivering instant notifications via Nodemailer SMTP integration.
- **Account Recovery**: Secure password reset flow using time-sensitive reset tokens dispatched via email.

---

## System Architecture & Tech Stack

### Frontend Architecture
- **Framework**: Next.js 16 (React 19, App Router architecture)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **Component Primitives**: Radix UI (Dialog, Dropdown Menu, Popover, Select, Tabs, Avatar)
- **State Management**: Zustand with persistent client stores
- **Data Visualization**: Recharts
- **Offline / Client Storage**: Dexie.js (IndexedDB wrapper) with Dexie React Hooks
- **Icons & Animation**: Lucide React, Framer Motion, Tailwindcss Animate
- **Notifications**: Sonner
- **HTTP Client**: Axios with configured request/response interceptors

### Backend Architecture
- **Runtime Environment**: Node.js
- **Web Framework**: Express.js 5
- **Database**: MongoDB with Mongoose 9 ODM
- **Authentication**: JSON Web Tokens (JWT) stored in HTTP-only cookies and Authorization headers
- **Document Rendering**: Puppeteer and `@sparticuz/chromium` (headless browser rendering for fee challans)
- **Code & Barcode Generation**: `qrcode`
- **File & Media Storage**: Cloudinary via Multer memory storage
- **Email Delivery**: Nodemailer (SMTP transport)
- **Input Validation**: Zod schemas
- **Logging**: Winston logger with structured output

### Security Implementation
- **Data Sanitization**: MongoDB query sanitization to prevent NoSQL injection attacks.
- **Parameter Pollution Defense**: HTTP Parameter Pollution (`hpp`) mitigation.
- **Secure Headers**: Helmet integration for enforcing Content Security Policy (CSP), HSTS, and frame protections.
- **Brute Force Protection**: Rate limiting (`express-rate-limit`) applied to authentication and communication endpoints.
- **Credential Protection**: Bcrypt-hashed password storage with salted rounds.

---

## Project Directory Structure

```text
School_LMS/
├── lms-client/                     # Next.js frontend application
│   ├── app/                        # Next.js App Router pages and layouts
│   │   ├── (auth)/                 # Authentication routes (login, forgot-password, reset-password)
│   │   ├── admin/                  # Protected administrative portal
│   │   │   ├── assignments/        # Teacher class/subject assignments
│   │   │   ├── attendance/         # Student attendance oversight
│   │   │   ├── classes/            # Class and section master management
│   │   │   ├── fees/               # Fee structure and challan management
│   │   │   ├── profile/            # Administrator profile settings
│   │   │   ├── students/           # Student directory and registration
│   │   │   ├── substitution/       # Faculty substitution workflows
│   │   │   └── teachers/           # Teacher management and records
│   │   ├── teacher/                # Protected faculty portal
│   │   │   ├── attendance/         # Class attendance recording interface
│   │   │   ├── profile/            # Teacher profile and credentials
│   │   │   └── students/           # Class student list inspection
│   │   ├── about/                  # Public about page
│   │   ├── contact/                # Public contact form
│   │   ├── layout.tsx              # Root HTML shell and providers
│   │   └── page.tsx                # Public institutional landing page
│   ├── components/                 # Reusable React components
│   │   ├── admin/                  # Admin layout components
│   │   ├── dashboard/              # Analytics charts (Recharts)
│   │   ├── providers/              # Theme and context wrappers
│   │   ├── teacher/                # Faculty navigation and layout components
│   │   └── ui/                     # Design system UI components (Radix + Tailwind)
│   ├── lib/                        # Client utilities and Axios API instance
│   ├── store/                      # Zustand state slices (e.g., useAuthStore)
│   ├── next.config.ts              # Next.js configuration and image domains
│   └── package.json
│
├── lms-server/                     # Express.js REST API backend
│   ├── src/
│   │   ├── config/                 # Database connection and environment configurations
│   │   ├── controllers/            # Route controllers
│   │   │   └── admin/              # Specialized admin management controllers
│   │   ├── middlewares/            # Authentication, validation, and error middleware
│   │   ├── models/                 # Mongoose schemas (Student, User, FeeChallan, etc.)
│   │   ├── routes/                 # Express API route declarations
│   │   ├── scripts/                # Database seed scripts (e.g., seedAdmin.js)
│   │   ├── services/               # Background services (PDF generation, email dispatch)
│   │   ├── utils/                  # Helper utilities and token generators
│   │   ├── validations/            # Zod validation schemas
│   │   ├── app.js                  # Express application configuration
│   │   └── server.js               # HTTP server entry point
│   ├── public/                     # Static assets and generated challan PDFs
│   ├── .env.example                # Sample environment configuration
│   └── package.json
│
└── README.md                       # Master project documentation
```

---

## Getting Started

### System Prerequisites
Ensure your local development environment meets the following requirements:
- **Node.js**: Version 18.x or higher (Node 20+ LTS recommended)
- **Package Manager**: npm, yarn, pnpm, or bun
- **Database**: MongoDB instance (local MongoDB server or MongoDB Atlas cluster)
- **Cloudinary Account**: Cloud name, API key, and API secret for media management
- **SMTP Account**: SMTP credentials (e.g., Gmail App Password, SendGrid, or Mailtrap)

---

### Repository Setup

Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/School_LMS.git
cd School_LMS
```

---

### Backend Configuration (`lms-server`)

1. Change directory into the backend project:
   ```bash
   cd lms-server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create an environment configuration file:
   ```bash
   cp .env.example .env
   ```

4. Populate `.env` with your environment values:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Connection
   MONGO_URI=mongodb://localhost:27017/school_lms

   # Client Application Origin
   CLIENT_URL=http://localhost:3000

   # JSON Web Token Secret
   JWT_SECRET=your_jwt_secret_key_here

   # Cloudinary Media Storage
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Nodemailer SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   FROM_EMAIL=your_email@gmail.com
   FROM_NAME=School_LMS
   ```

---

### Frontend Configuration (`lms-client`)

1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd lms-client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create an environment configuration file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Verify or update the API endpoint in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

---

### Database Initialization & Seeding

Before running the application for the first time, initialize the database with an administrative account.

From the `lms-server` directory, run:

```bash
npm run seed:admin
```

This provisions the default administrative user:
- **Email**: `admin@school.com`
- **Password**: `password123`
- **Role**: `ADMIN`

> Change the default administrative password immediately after logging in for the first time.

---

### Running the Application

1. **Start the backend server** (from `lms-server`):
   ```bash
   npm run dev
   ```
   The backend API will be available at `http://localhost:5000`.

2. **Start the frontend application** (from `lms-client`):
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## REST API Reference

The backend exposes structured REST endpoints under the `/api` prefix:

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns session cookie/JWT |
| `POST` | `/api/auth/logout` | Public | Clears session cookie and invalidates session |
| `POST` | `/api/auth/forgotpassword` | Public | Dispatches password reset link via SMTP |
| `PUT` | `/api/auth/resetpassword/:token` | Public | Resets user password using reset token |
| `GET` | `/api/auth/me` | Authenticated | Fetches profile of currently logged-in user |
| `PUT` | `/api/auth/update-profile` | Authenticated | Updates name, contact, or profile credentials |

### Administrative Operations (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/stats` | Admin | Retrieves institutional overview KPI counts |
| `GET` | `/api/admin/dashboard/fees-chart` | Admin | Retrieves monthly fee collection analytics |
| `GET` | `/api/admin/dashboard/attendance-chart` | Admin | Retrieves aggregated student attendance trends |
| `GET` | `/api/admin/teachers` | Admin | Lists all registered teachers |
| `POST` | `/api/admin/teachers` | Admin | Creates a new teacher record and login account |
| `PUT` | `/api/admin/teachers/:id` | Admin | Modifies teacher profile details |
| `DELETE` | `/api/admin/teachers/:id` | Admin | Deletes or deactivates a teacher account |
| `GET` | `/api/admin/students` | Admin | Lists enrolled students with optional class filters |
| `POST` | `/api/admin/students` | Admin | Enrolls a new student into the system |
| `GET` | `/api/admin/students/:id` | Admin | Retrieves specific student profile and records |
| `PUT` | `/api/admin/students/:id` | Admin | Updates student academic and biographical data |
| `GET` | `/api/admin/master-data` | Admin | Retrieves classes, sections, subjects, and slots |
| `POST` | `/api/admin/master-data/init` | Admin | Populates system default master data |
| `POST` | `/api/admin/assignments` | Admin | Assigns a teacher to a class, section, and subject |
| `GET` | `/api/admin/assignments` | Admin | Lists active class timetable assignments |

### Teacher Operations (`/api/teacher`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/teacher/assignments` | Teacher | Retrieves assigned classes and today's substitutions |
| `GET` | `/api/teacher/students` | Teacher | Retrieves student roster for an assigned section |

### Attendance Management (`/api/attendance` & `/api/teacher-attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance` | Faculty / Admin | Submits daily attendance record for a class |
| `GET` | `/api/attendance` | Faculty / Admin | Queries attendance records by date and class |
| `POST` | `/api/attendance/freeze` | Admin | Freezes attendance records against modification |
| `GET` | `/api/teacher-attendance` | Faculty / Admin | Fetches faculty attendance records |
| `POST` | `/api/teacher-attendance` | Admin | Logs faculty attendance status |

### Fees & Challans (`/api/fees`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/fees` | Authenticated | Queries generated fee challan records |
| `GET` | `/api/fees/structures` | Admin | Lists configured fee structures by class |
| `POST` | `/api/fees/structures` | Admin | Creates or updates class fee structure |
| `POST` | `/api/fees/generate` | Admin | Executes batch challan generation |
| `GET` | `/api/fees/download/:id` | Authenticated | Serves generated PDF fee challan |
| `POST` | `/api/fees/verify/:id` | Admin | Reconciles challan and marks payment as verified |
| `DELETE` | `/api/fees/:id` | Admin | Cancels or removes a generated fee challan |

### Faculty Substitution Engine (`/api/substitution`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/substitution/needed` | Admin | Lists unattended periods requiring substitution |
| `GET` | `/api/substitution/available-teachers` | Admin | Queries eligible teachers free during target period |
| `POST` | `/api/substitution` | Admin | Assigns a substitute teacher for a specified period |
| `DELETE` | `/api/substitution/:id` | Admin | Cancels an existing substitution assignment |

### Utilities (`/api/upload` & `/api/contact`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload/avatar` | Authenticated | Uploads image to Cloudinary and returns URL |
| `POST` | `/api/contact` | Public | Delivers contact inquiry email to administration |

---

## Deployment Guidelines

### Production Build
1. **Frontend**:
   ```bash
   cd lms-client
   npm run build
   npm run start
   ```

2. **Backend**:
   Ensure `NODE_ENV=production` is set in your production environment variables.
   ```bash
   cd lms-server
   npm start
   ```

### Reverse Proxy & HTTPS
When deploying in a production environment (such as behind Nginx, AWS ALB, Render, or Heroku):
- Set `app.set('trust proxy', 1);` (already preconfigured in `app.js`).
- Configure valid TLS/SSL certificates for HTTPS.
- Set `CLIENT_URL` in `lms-server/.env` to the production frontend domain to ensure CORS requests and cookie transmission operate without restriction.

---

## License

This project is distributed under the terms of the ISC License. See the respective package manifests for individual dependency licensing details.
