# TransitOps — Smart Transport Operations Platform

A centralized platform to manage the full lifecycle of transport operations — vehicles, drivers, dispatch/trips, maintenance, fuel & expenses, and reporting. Built to replace spreadsheets and logbooks with a role-based web application.

## Core Features

- **Authentication & RBAC** — JWT-based login with four roles: Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
- **Vehicle Registry** — CRUD with status tracking (Available, On Trip, In Shop, Retired), region, and registration uniqueness
- **Driver Management** — CRUD with license tracking, safety scores, and expiry validation
- **Trip Lifecycle** — Draft → Dispatched → Completed → Cancelled with atomic vehicle/driver status transitions
- **Maintenance Workflow** — Active records automatically set vehicles to In Shop; closing restores to Available
- **Fuel & Expense Tracking** — Log fuel, tolls, parking, and other expenses per vehicle/trip
- **Dashboard KPIs** — Server-calculated stats: fleet utilization, active trips, available drivers, costs
- **Reports & Analytics** — Fuel efficiency, operational cost per vehicle, ROI, CSV export

## User Roles

| Role | Capabilities |
|------|-------------|
| **Fleet Manager** | Manage vehicles, maintenance records, view dashboard |
| **Dispatcher** | Create/dispatch/complete/cancel trips, manage expenses |
| **Safety Officer** | Manage driver profiles, license validity, safety scores |
| **Financial Analyst** | View fuel logs, expenses, reports/analytics; log expenses |

## Tech Stack

**Backend:** Django 6.0, Django REST Framework 3.17, SQLite, SimpleJWT  
**Frontend:** React 19, Vite 8, npm

### Key Libraries

**Backend:**
- `djangorestframework-simplejwt` — JWT authentication
- `django-cors-headers` — CORS handling
- `django-filter` — Queryset filtering
- `python-dotenv` — Environment variable loading

**Frontend:**
- `react` / `react-dom` — UI framework
- `vite` — Build tool and dev server
- `oxlint` — Linting

## Repository Structure

```
/
├── backend/                  # Django REST API
│   ├── transitops/           # Project settings, root URL config
│   ├── users/                # Custom User model, JWT auth endpoints
│   ├── fleet/                # Vehicle, Driver, MaintenanceLog models & views
│   ├── trips/                # Trip, Expense models & views
│   ├── dashboard/            # Stats, reports, CSV export endpoints
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                  # Environment variables (not committed)
│
└── frontend/                 # React application
    ├── src/
    │   ├── components/       # UI components (Dashboard, Fleet, Trips, etc.)
    │   ├── api.js            # Centralized API client with token refresh
    │   ├── App.jsx           # Root component with auth routing
    │   └── main.jsx          # Entry point
    ├── index.html
    ├── vite.config.js        # Dev server proxy to backend
    └── package.json
```

## Prerequisites

- Python 3.12+
- Node.js 18+ and npm
- Git

## Installation & Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # set DJANGO_SECRET_KEY
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` requests to the backend.

## Environment Variables

| File | Variable | Purpose | Example |
|------|----------|---------|---------|
| `backend/.env` | `DJANGO_SECRET_KEY` | Django secret key for session/JWT signing | `django-insecure-transitops-dev-key-2026` |

The frontend requires no environment variables — API proxying is configured in `vite.config.js`.

## Running Tests

No automated tests exist yet.

## API Overview

### Auth (`/api/users/`)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/users/login/` | Obtain JWT access + refresh tokens | No |
| POST | `/api/users/refresh/` | Refresh access token | No |
| GET | `/api/users/me/` | Get current user profile | Yes |

### Vehicles (`/api/fleet/vehicles/`)

| Method | Endpoint | Purpose | Role |
|--------|----------|---------|------|
| GET | `/api/fleet/vehicles/` | List all vehicles | Any |
| POST | `/api/fleet/vehicles/` | Register vehicle | Fleet Manager |
| GET | `/api/fleet/vehicles/{id}/` | Get vehicle detail | Any |
| PATCH | `/api/fleet/vehicles/{id}/` | Update vehicle | Fleet Manager |
| DELETE | `/api/fleet/vehicles/{id}/` | Delete vehicle | Fleet Manager |

### Drivers (`/api/fleet/drivers/`)

| Method | Endpoint | Purpose | Role |
|--------|----------|---------|------|
| GET | `/api/fleet/drivers/` | List all drivers | Any |
| GET | `/api/fleet/drivers/available/` | List available drivers (not expired, not suspended) | Any |
| POST | `/api/fleet/drivers/` | Register driver | Safety Officer |
| PATCH | `/api/fleet/drivers/{id}/` | Update driver | Safety Officer |
| DELETE | `/api/fleet/drivers/{id}/` | Delete driver | Safety Officer |

### Maintenance (`/api/fleet/maintenance/`)

| Method | Endpoint | Purpose | Role |
|--------|----------|---------|------|
| GET | `/api/fleet/maintenance/` | List maintenance records | Any |
| POST | `/api/fleet/maintenance/` | Create record (sets vehicle to In Shop) | Fleet Manager / Dispatcher |
| PATCH | `/api/fleet/maintenance/{id}/` | Update status (Active ↔ Completed) | Fleet Manager / Dispatcher |

### Trips (`/api/trips/trips/`)

| Method | Endpoint | Purpose | Role |
|--------|----------|---------|------|
| GET | `/api/trips/trips/` | List all trips | Any |
| POST | `/api/trips/trips/` | Create trip (Draft) | Dispatcher |
| PATCH | `/api/trips/trips/{id}/` | Update trip / Dispatch | Dispatcher |
| POST | `/api/trips/trips/{id}/complete/` | Complete trip (requires odometer + fuel) | Dispatcher |
| POST | `/api/trips/trips/{id}/cancel/` | Cancel trip (restores vehicle/driver) | Dispatcher |

### Expenses (`/api/trips/expenses/`)

| Method | Endpoint | Purpose | Role |
|--------|----------|---------|------|
| GET | `/api/trips/expenses/` | List all expenses | Any |
| POST | `/api/trips/expenses/` | Log expense | Dispatcher / Financial Analyst |
| PATCH | `/api/trips/expenses/{id}/` | Update expense | Dispatcher / Financial Analyst |

### Dashboard & Reports (`/api/dashboard/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/dashboard/stats/` | KPI statistics (fleet utilization, costs, trip counts) |
| GET | `/api/dashboard/reports/` | Per-vehicle reports (fuel efficiency, ROI, operational cost) |
| GET | `/api/dashboard/reports/csv/` | CSV export of vehicle performance report |

## Default Login

No seed data or fixtures are included. Create a superuser for admin access:

```bash
cd backend
python manage.py createsuperuser
```

Then create users via the Django admin panel at `http://localhost:8000/admin/` and assign roles (`fleet_manager`, `dispatcher`, `safety_officer`, `financial_analyst`).
