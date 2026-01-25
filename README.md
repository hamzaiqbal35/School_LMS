# School Management System (LMS)

A comprehensive School Management System designed to streamline administrative tasks, enhance teacher productivity, and provide students/parents with easy access to academic information.

## 🚀 Features

### Admin Module
- **Dashboard**: Overview of total students, teachers, and other key metrics.
- **Student Management**: Add, update, view, and delete student records.
- **Teacher Management**: Manage teacher profiles and assignments.
- **Class Management**: Organize classes and sections.
- **Fee Management**: Define fee structures, generate challans, and track payments.
- **Attendance Monitoring**: View overall attendance stats.

### Teacher Module
- **Class Management**: View assigned classes and students.
- **Attendance**: Mark daily attendance for students.
- **Assignments**: Create and manage assignments.
- **Grading**: Input and manage student grades.

### General
- **Secure Authentication**: Role-based access control (Admin, Teacher).
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## 🛠 Tech Stack

### Client (Frontend)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **State Management**: Zustand
- **Icons**: Lucide React
- **Data Fetching**: Axios

### Server (Backend)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT & Cookies
- **File Storage**: Cloudinary (for images and documents)
- **Security**: Helmet, HPP, CORS, Rate Limiting

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Database (Local or Atlas)
- Cloudinary Account

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

Create a \`.env\` file in \`lms-server\` based on \`.env.example\`:
\`\`\`bash
cp .env.example .env
\`\`\`
Fill in your environment variables (MongoDB URI, Cloudinary credentials, etc.).

Start the development server:
\`\`\`bash
npm run dev
\`\`\`
The server will run on \`http://localhost:5000\` (default).

### 3. Frontend Setup (lms-client)
Navigate to the client directory and install dependencies:
\`\`\`bash
cd ../lms-client
npm install
\`\`\`

Create a \`.env.local\` file in \`lms-client\` based on \`.env.local.example\`:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`
Ensure \`NEXT_PUBLIC_API_URL\` points to your backend (e.g., \`http://localhost:5000/api\`).

Start the development server:
\`\`\`bash
npm run dev
\`\`\`
Visit \`http://localhost:3000\` in your browser.

## 🔑 Environment Variables

### Server (\`lms-server/.env\`)
| Variable | Description |
|----------|-------------|
| \`PORT\` | Port number for the server (default: 5000) |
| \`MONGO_URI\` | Connection string for MongoDB |
| \`CLIENT_URL\` | URL of the frontend (for CORS) |
| \`JWT_SECRET\` | Secret key for signing JWTs |
| \`CLOUDINARY_CLOUD_NAME\` | Cloudinary Cloud Name |
| \`CLOUDINARY_API_KEY\` | Cloudinary API Key |
| \`CLOUDINARY_API_SECRET\` | Cloudinary API Secret |

### Client (\`lms-client/.env.local\`)
| Variable | Description |
|----------|-------------|
| \`NEXT_PUBLIC_API_URL\` | Base URL for the backend API |

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
