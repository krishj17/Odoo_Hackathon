# Master Prompt: Audit & Complete TransitOps Platform

Paste everything below into your coding agent (Claude Code, Cursor, etc.) with the repo open/available.

---

## ROLE

You are a senior full-stack engineer auditing and completing an existing project called **TransitOps**, a Smart Transport Operations Platform. Stack: **Django + Django REST Framework + SQLite (backend)**, **React (frontend)**. Some features are already implemented but broken or incomplete. Your job is to **audit the entire codebase against the specification below, identify every gap or bug, and fix/complete everything** until the full spec is met.

Do NOT rewrite working code unnecessarily — patch, extend, and fix. Only refactor where the existing implementation is fundamentally broken or blocks correct behavior.

---

## STEP 0 — AUDIT FIRST, THEN REPORT, THEN CODE

Before writing any code:
1. Explore the repo structure (backend apps/models/serializers/views/urls, frontend components/pages/api calls).
2. Produce a **gap report** comparing the current implementation against every requirement below. For each requirement mark: ✅ Working / ⚠️ Partially working (describe bug) / ❌ Missing.
3. Only after presenting the gap report, proceed to implement fixes in priority order: (1) data model correctness, (2) business rule enforcement, (3) API correctness, (4) frontend flows, (5) dashboard/reports.

Do not skip the gap report — it prevents redundant or destructive rewrites.

---

## SCOPE

Implement **core/mandatory requirements only**. Do NOT build the bonus features (charts library, PDF export, email reminders, document management, dark mode, advanced search/sort/filter beyond what's specified). If any of these already exist in the codebase, leave them as-is but do not invest time extending them.

---

## 1. AUTHENTICATION & RBAC

- Email + password login using Django auth (session or JWT — keep whatever the repo already uses; if broken, fix it; if absent, implement JWT via `djangorestframework-simplejwt` or session auth, whichever fits existing setup).
- All API endpoints must require authentication except login.
- Implement Role-Based Access Control with four roles: **Fleet Manager, Driver, Safety Officer, Financial Analyst**.
  - Fleet Manager: full access to vehicles, maintenance, dashboard.
  - Driver: can create/dispatch/complete trips, view available vehicles/drivers.
  - Safety Officer: manage driver profiles, license validity, safety scores (read/write on drivers).
  - Financial Analyst: read access to fuel logs, expenses, reports/analytics; no write access to vehicles/trips.
- Enforce role checks server-side (DRF permissions), not just hidden UI elements.
- Frontend: route guarding based on logged-in user's role; redirect/hide unauthorized sections.

## 2. DASHBOARD

KPIs to compute and display (server-calculated, not hardcoded):
- Active Vehicles (status = On Trip)
- Available Vehicles (status = Available)
- Vehicles in Maintenance (status = In Shop)
- Active Trips (status = Dispatched)
- Pending Trips (status = Draft)
- Drivers On Duty (status = On Trip)
- Fleet Utilization % = (Vehicles On Trip + In Shop) / Total Vehicles × 100 — verify/confirm formula makes sense with existing data model, document your chosen formula in code comments.

Filters: by vehicle type, status, region (add a `region` field to Vehicle model if it doesn't already exist — spec implies it's needed for filtering).

## 3. VEHICLE REGISTRY (CRUD)

Fields: Registration Number (**unique**, enforce at model + serializer level), Vehicle Name/Model, Type, Maximum Load Capacity, Odometer, Acquisition Cost, Status.
Status enum: `Available`, `On Trip`, `In Shop`, `Retired`.
- Enforce uniqueness with a proper DB constraint + friendly API error (not raw IntegrityError).
- Retired or In Shop vehicles must be excluded from any "available vehicles for trip" endpoint/dropdown.

## 4. DRIVER MANAGEMENT (CRUD)

Fields: Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score, Status.
Status enum: `Available`, `On Trip`, `Off Duty`, `Suspended`.
- Drivers with `license_expiry_date < today` OR status `Suspended` must be excluded from the "available drivers" list for trip assignment — enforce this **server-side** in the endpoint that serves trip-assignment options, not just frontend filtering.

## 5. TRIP MANAGEMENT

Trip creation requires: source, destination, vehicle (from available pool), driver (from available pool), cargo weight, planned distance.
Lifecycle: `Draft → Dispatched → Completed → Cancelled`.

Enforce these rules **in the backend** (API must reject invalid transitions/values with clear 4xx errors, don't rely on frontend validation alone):
- Cargo weight must not exceed the selected vehicle's max load capacity.
- Vehicle/driver must not already be `On Trip` or otherwise unavailable (In Shop, Retired, Suspended, expired license).
- **Dispatch** (Draft → Dispatched): atomically set vehicle status = On Trip, driver status = On Trip.
- **Complete** (Dispatched → Completed): requires final odometer reading and fuel consumed as input; atomically set vehicle status = Available, driver status = Available; update vehicle odometer.
- **Cancel** (Dispatched → Cancelled): atomically restore vehicle and driver to Available. (Clarify/confirm: cancelling a Draft trip should just mark it Cancelled with no status side effects since nothing was dispatched.)
- Use DB transactions (`transaction.atomic()`) for all these status changes to prevent race conditions/partial updates.

## 6. MAINTENANCE

- Create maintenance records tied to a vehicle (type of work, date, cost, notes/status open-closed).
- Creating an **active/open** maintenance record automatically sets vehicle status → `In Shop`, which must immediately remove it from all dispatch/trip-assignment dropdowns.
- Closing a maintenance record restores vehicle status → `Available`, **unless** the vehicle is `Retired` (must stay Retired).
- If a vehicle has multiple open maintenance records, only restore to Available once all are closed.

## 7. FUEL & EXPENSE MANAGEMENT

- Fuel logs: liters, cost, date, linked to vehicle (and ideally trip).
- Other expenses: tolls, maintenance-related, linked to vehicle.
- Compute **Total Operational Cost per vehicle** = sum(fuel costs) + sum(maintenance costs) [+ other expenses if modeled separately] — expose via an API endpoint, don't just compute ad hoc in frontend.

## 8. REPORTS & ANALYTICS

Expose via API (and render in frontend, table form is fine — no bonus charts required):
- Fuel Efficiency = Total Distance / Total Fuel (per vehicle)
- Fleet Utilization (reuse dashboard formula)
- Operational Cost per vehicle (reuse from #7)
- Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
  - If "Revenue" is not currently modeled anywhere, add a way to capture/derive it (e.g., revenue per trip field, or flag this as an assumption in your gap report and propose the simplest addition).
- CSV export for at least one of these reports (mandatory per spec). Use Python `csv` module or DRF renderer — no new heavy dependency needed.

## 9. DATA MODEL

Confirm these entities exist with correct relationships and fix any missing fields/constraints:
`Users`, `Roles`, `Vehicles`, `Drivers`, `Trips`, `Maintenance Logs`, `Fuel Logs`, `Expenses`.

---

## CROSS-CUTTING REQUIREMENTS

- **All business rules must be enforced server-side** in DRF serializers/views (not just React form validation). Treat frontend validation as UX sugar only.
- Return meaningful HTTP status codes and error messages for every validation failure (400 with a clear message, not 500).
- Wrap multi-model status updates (dispatch, complete, cancel, maintenance open/close) in `transaction.atomic()`.
- Write or fix Django migrations for any model changes — do not hand-edit the SQLite file.
- Keep the API RESTful and consistent with whatever URL/naming conventions already exist in the repo.
- Responsive web UI (should work on typical desktop and tablet widths at minimum).

---

## DELIVERABLE FOR THIS TASK

1. Gap report (as described in Step 0).
2. List of all files changed/added, grouped by backend/frontend.
3. For every business rule in Section 4 of the original spec ("Mandatory Business Rules"), confirm explicitly it is now enforced server-side, with the file/function where enforcement happens.
4. Note any assumptions you had to make (e.g., Revenue field, Region field) clearly, since these weren't fully specified in the original PDF.
5. Do not add bonus features (charts, PDF export, email reminders, document management, dark mode) unless they already existed and were broken — in that case, note whether you fixed or left them.

---

## ORIGINAL SPEC REFERENCE

**Business Context:** Digitize vehicle, driver, dispatch, maintenance, and expense management for transport operations, replacing spreadsheets/logbooks.

**Users:** Fleet Manager, Driver, Safety Officer, Financial Analyst (roles/permissions as defined above).

**Example workflow to validate end-to-end (use as a manual test script):**
1. Register vehicle 'Van-05', max capacity 500kg, status Available.
2. Register driver 'Alex' with valid license.
3. Create trip, cargo weight 450kg.
4. System validates 450kg ≤ 500kg, allows dispatch.
5. Vehicle and driver auto-become On Trip.
6. Complete trip with final odometer + fuel consumed.
7. Vehicle and driver auto-become Available.
8. Create maintenance record (e.g., Oil Change) → vehicle auto-becomes In Shop, hidden from dispatch.
9. Reports update operational cost and fuel efficiency based on latest trip/fuel log.

Run this exact scenario as a smoke test after your fixes and confirm each step passes.
