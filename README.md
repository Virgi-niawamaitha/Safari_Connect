# Safari_Connect

This repository contains both the Frontend (React + Vite) and Backend (Node.js + Prisma) for the Safari_Connect platform.

---

## 🎨 Frontend (SafiriConnect-React)

### Quick Start

```bash
cd safiriconnect-react
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

### How to use

On the login screen, click one of the **demo account buttons** to instantly access each role:
- 👤 **Demo Passenger** → Full booking flow
- 🏢 **Demo SACCO Owner** → Fleet & operations dashboard  
- 🛡️ **Demo Super Admin** → Platform governance

### Tech Stack
- React 18 + Vite
- React Router v6 (role-based routing)
- Context API for auth state
- Pure CSS (no UI library — all custom)

### Project Structure
```
src/
├── context/AuthContext.jsx    ← Role-based auth (user/owner/admin)
├── components/
│   ├── UI.jsx                 ← Shared components (Modal, Badge, SeatMap, Charts...)
│   ├── Topbar.jsx
│   ├── Sidebar.jsx            ← Role-specific nav
│   └── ProtectedLayout.jsx    ← Auth guard + layout
├── pages/
│   ├── Login.jsx
│   ├── user/     (8 pages)    ← Passenger flow
│   ├── owner/    (10 pages)   ← SACCO operations
│   └── admin/    (9 pages)    ← Super admin
├── styles/globals.css
├── App.jsx                    ← All routes
```

---

## ⚙️ Backend (Safari_Connect Backend)

### Project setup

```bash
cd backend
```

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:
```
DATABASE_URL="postgresql://Database_name:your_secure_password@localhost:5432/Safari_connect"
JWT_SECRET="your_super_secret_key"
PORT=xxxx
```

### 3. Database

1. Download and Install PostgreSQL locally.
2. Create database:
   ```sql
   CREATE DATABASE Safari_Connect;
   CREATE USER Safari_Connect WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE Safari_Connect TO Safari_Connect;
   ```

### 4. Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed

# View database in Prisma Studio
npx prisma studio
```

### 5. Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

---

## 🚀 Deployment & Collaboration

For detailed instructions on creating features, ngrok setup, and M-Pesa integration, please see the backend documentation sections.
