# School Management System (LMS)

A comprehensive, full-stack School Management System designed to streamline administrative tasks, enhance teacher productivity, and provide a seamless experience for students and parents. Built with modern web technologies for performance, scalability, and enhanced user experience.

## 🚀 Features

### 👨‍💼 Admin Module
- **Dashboard**: Real-time overview of students, teachers, classes, and financial metrics.
- **Student Management**: Complete lifecycle management (Admission, Editing, Deletion, Promoting).
- **Teacher Management**: Profile management, class assignment, and schedule tracking.
- **Fee Management**: Automated challan generation, fee structure definition, and payment tracking.
- **Attendance**: Global attendance monitoring and reporting.

### 👨‍🏫 Teacher Module
- **Classroom Hub**: View assigned classes and student lists.
- **Attendance System**: Easy-to-use interface for marking daily student attendance.
- **Academic Management**: (Planned) Assignment creation and grading.

### 🌟 Public & General
- **Landing Page**: Professional, responsive public-facing pages (Home, About, Contact).
- **Contact Form**: Functional contact form with automated email notifications.
- **Authentication**: Secure role-based login (Admin, Teacher, Student) with JWT.
- **Password Recovery**: Secure "Forgot Password" flow with email verification links.
- **Responsive Design**: Fully optimized for desktops, tablets, and mobile devices.

## 🛠 Tech Stack

### Client (Frontend)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **UI Libraries**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Animations**: Framer Motion, Tailwindcss Animate
- **State Management**: Zustand
- **Charts**: Recharts
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Data Fetching**: Axios

### Server (Backend)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & HTTP-only Cookies
- **Email Service**: Nodemailer (SMTP)
- **File Storage**: Cloudinary (for images/documents)
- **PDF Generation**: Puppeteer
- **Security**: Helmet, HPP, CORS, Rate Limiting, XSS-Clean
- **Validation**: Zod

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Database (Local or Atlas)
- Cloudinary Account
- SMTP Server (e.g., Gmail, SendGrid, Mailtrap)

### 1. Clone the Repository
\`\`\`bash
git clone <repository_url>
cd School_LMS
\`\`\`

### 2. Backend Setup (lms-server)
Navigate to the server directory and install dependencies:
\`\`\`bash
cd lms-server
npm install
\`\`\`

Create a \`.env\` file in \`lms-server\` with the following variables:
\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Frontend Connection
CLIENT_URL=http://localhost:3000

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
COOKIE_EXPIRE=30

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=School_LMS
\`\`\`

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup (lms-client)
Navigate to the client directory and install dependencies:
\`\`\`bash
cd ../lms-client
npm install
\`\`\`

Create a \`.env.local\` file in \`lms-client\`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

Start the development server:
\`\`\`bash
npm run dev
\`\`\`
Visit \`http://localhost:3000\` in your browser.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
