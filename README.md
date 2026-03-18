# SafiriConnect — Kenya's AI-Powered Transport Platform

> Built for the **AI for Autonomous Decision Making** Hackathon
> Full-stack platform: React + TypeScript frontend · Node.js + Prisma backend

---

## Repository Structure

```
Safari_Connect/
├── frontend/                   ← React + TypeScript + Vite (this document)
├── transport-booking-backend/  ← Node.js + Prisma + PostgreSQL
└── ai agent/                   ← AI autonomous decision engine
```

---

## 🎨 Frontend — SafiriConnect Web App

A professional, role-based transport management web application built with React 19, TypeScript, and Vite. No external UI library — fully custom CSS design system.

### Features

#### 🤖 AI Autonomous Decision Engine (Frontend Integration)
The platform surfaces real-time AI decisions across all role dashboards:

| Agent | What it does |
|---|---|
| **Trip Recommendation** | Ranks trips by price, travel time & reliability — returns top pick |
| **Dynamic Pricing Insight** | Forecasts fare movement from demand window — suggests cheaper slots |
| **Delay Risk Prediction** | Scores route risk from weather & traffic — returns risk level + guidance |
| **Fraud / Anomaly Scoring** | Screens booking/payment behaviour — returns allow / review / block |
| **Dispatch Planner** | Estimates seat pressure before departure — recommends standby vehicles |
| **Unified Decision Assist** | Combines all agents into one orchestrated response with top action |
| **Voice / Chat Assistant** | English + Swahili bilingual intent interpreter |

#### 🧑‍💼 Role-Based Access
Three fully separated portals with dedicated dashboards, navigation, and permissions:

| Role | Access | Key pages |
|---|---|---|
| **Passenger** | `/passenger/*` | Home, Search, Seat selection, My bookings, Profile |
| **SACCO Owner** | `/owner/*` | Dashboard, Fleet, Routes, Schedules, Analytics, Payments |
| **Super Admin** | `/admin/*` | Platform overview, SACCOs, Users, Bookings, Fraud, Analytics |

#### ✈️ Airline-Style Seat Selection
- 3-column layout: Class picker · Bus seat map · Booking summary
- Visual class zone banners (VIP 👑 / Business 💼 / Economy 🎫)
- Seats outside selected class are dimmed
- Row numbers + column labels (A B | C D) with aisle indicator
- Live seat availability count per class

#### Other Highlights
- Live AI decision cards with confidence bars on every dashboard
- Dark sidebar navigation with role pill, breadcrumb trail
- Topbar with global search, notifications, user avatar
- M-Pesa payment flow with STK push simulation
- E-ticket generation with QR placeholder
- Carrier services: Package delivery, Movers, Document courier
- Password show/hide toggle on all auth forms
- Profile page with trust score SVG ring, Help & Support, About section

---

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Routing | React Router v7 |
| State | Context API (AuthContext, BookingContext) |
| Styling | Custom CSS (no Tailwind, no UI library) |
| Fonts | DM Sans + Syne (Google Fonts) |

---

### Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> **Demo accounts** — on the login screen click any demo button to instantly access each role without filling in credentials.

| Demo | Role | What you see |
|---|---|---|
| Demo Passenger | Passenger | Full booking flow, seat map, AI travel assistant |
| Demo SACCO Owner | Owner | Fleet dashboard, dispatch AI, revenue analytics |
| Demo Super Admin | Admin | Platform overview, fraud AI, SACCO management |

---

### Project Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── App.tsx                     ← All routes (public + role-protected)
    ├── main.tsx                    ← Entry point
    ├── styles/
    │   └── globals.css             ← Full custom CSS design system
    ├── types/
    │   └── index.ts                ← TypeScript interfaces
    ├── context/
    │   ├── AuthContext.tsx         ← Role-based auth (passenger / owner / admin)
    │   └── BookingContext.tsx      ← Multi-step booking state machine
    ├── hooks/
    │   └── useToast.tsx            ← Toast notification hook
    ├── components/
    │   ├── DashboardLayout.tsx     ← Sidebar + topbar + breadcrumb shell
    │   ├── RequireAuth.tsx         ← Route guard by role
    │   └── UI.tsx                  ← Shared: SeatMap, AiAgentPanel, StatTile,
    │                                   Modal, Steps, Badge, Charts, MapEmbed
    └── pages/
        ├── Welcome.tsx             ← Landing page (SaaS-style)
        ├── auth/
        │   ├── Login.tsx
        │   └── Register.tsx
        ├── passenger/              ← 8 pages (Home → Search → Seat → Confirm → Payment → Ticket)
        ├── carrier/                ← 5 pages (Package, Movers, Courier, Tracking)
        ├── owner/                  ← 10 pages (Fleet, Routes, Schedules, Analytics…)
        └── admin/                  ← 9 pages (SACCOs, Users, Bookings, Support…)
```

---

### Available Scripts

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

---

## ⚙️ Backend — transport-booking-backend

### Setup

```bash
cd transport-booking-backend
npm install
```

Create `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/safari_connect"
JWT_SECRET="your_super_secret_key"
PORT=3000
```

### Database (PostgreSQL + Prisma)

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed        # optional
npx prisma studio         # visual DB browser
```

### Run

```bash
npm run start:dev    # development (hot reload)
npm run start:prod   # production
```

---

## 🤖 AI Agent — ai agent/

Autonomous decision engine implementing:
- Trip recommendation & ranking
- Dynamic fare forecasting
- Delay risk scoring
- Fraud / anomaly detection
- Dispatch planning
- Unified orchestration (all agents in one response)
- Chat + Voice assistant (English & Swahili)

See `ai agent/` directory for setup and API documentation.

---

## 🚀 Deployment

The frontend builds to a static bundle (`npm run build → dist/`) deployable to any static host (Vercel, Netlify, GitHub Pages).

The backend requires a Node.js runtime and PostgreSQL database.

---

*SafiriConnect — Hackathon submission · AI for Autonomous Decision Making · 2026*
