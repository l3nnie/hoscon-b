# HostelConnect Backend API

Backend API for HostelConnect Kenya - Student Hostel Discovery Platform.

## Tech Stack

- **Node.js** with **Express.js** - Backend framework
- **Supabase** - PostgreSQL database with real-time capabilities
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Validation
- **Helmet** & **CORS** - Security

## Prerequisites

- Node.js (v18 or higher)
- Supabase account and project
- npm or yarn

## Installation & Setup

### 1. Database Migration (Supabase)
**Copy `migrations/001_initial_schema.sql` → Supabase Dashboard → SQL Editor → Run**

**Or use npm scripts:**
```bash
npm run db:migrate  # Warns about manual setup
npm run db:seed     # Populates demo data
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill:
```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### 3. Clone & Install
```bash
cd backend
npm install
npm run dev
```

## Tech Stack

- **Node.js** with **Express.js** - Backend framework
- **Supabase** - PostgreSQL database with real-time capabilities
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Validation
- **Helmet** & **CORS** - Security
