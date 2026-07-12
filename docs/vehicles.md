# Vehicles API

**Base URL:** `http://localhost:8000/api/fleet/vehicles/`  
**Auth:** `Authorization: Bearer <access_token>`  
**Content-Type:** `application/json`

**Permissions:**
- **GET** (list/retrieve): Any authenticated user
- **POST / PATCH / DELETE**: Fleet Manager only (`role: "fleet_manager"`)

---

## GET `/api/fleet/vehicles/` — List All Vehicles

### Query Parameters (Optional)

| Param      | Type   | Description                                              |
|------------|--------|----------------------------------------------------------|
| `status`   | string | Filter by status: `available`, `on_trip`, `in_shop`, `retired` |
| `type`     | string | Filter by type: `van`, `truck`, `mini`                   |
| `search`   | string | Search by `registration_number` or `name_model`          |
| `ordering` | string | Sort by `created_at`, `odometer`, or `acquisition_cost`  |

Use `-` prefix for descending order (e.g. `-created_at`).

### Response

**200 OK**

```json
[
  {
    "id": 1,
    "registration_number": "MH-12-AB-1234",
    "name_model": "Tata Ace Gold",
    "type": "truck",
    "max_load_capacity_kg": "2500.00",
    "odometer": "15230.50",
    "acquisition_cost": "850000.00",
    "status": "available",
    "created_at": "2025-10-01T08:30:00Z"
  }
]
```

---

## POST `/api/fleet/vehicles/` — Create Vehicle

### Request

| Field                 | Type    | Required | Description                              |
|-----------------------|---------|----------|------------------------------------------|
| `registration_number` | string  | Yes      | Unique vehicle registration number       |
| `name_model`          | string  | Yes      | Vehicle name/model                       |
| `type`                | string  | Yes      | Vehicle type: `van`, `truck`, `mini`     |
| `max_load_capacity_kg`| decimal | Yes      | Maximum load capacity in kg              |
| `odometer`            | decimal | No       | Current odometer reading (default: `0`)  |
| `acquisition_cost`    | decimal | Yes      | Purchase cost of the vehicle             |
| `status`              | string  | No       | Default: `available`                     |

`created_at` is auto-set. Do not include it in the request.

#### Example

```json
{
  "registration_number": "MH-12-AB-5678",
  "name_model": "Eeco Van",
  "type": "van",
  "max_load_capacity_kg": 800.00,
  "odometer": 0,
  "acquisition_cost": 550000.00,
  "status": "available"
}
```

### Response

**201 Created**

```json
{
  "id": 2,
  "registration_number": "MH-12-AB-5678",
  "name_model": "Eeco Van",
  "type": "van",
  "max_load_capacity_kg": "800.00",
  "odometer": "0.00",
  "acquisition_cost": "550000.00",
  "status": "available",
  "created_at": "2025-12-07T08:45:00Z"
}
```

---

## GET `/api/fleet/vehicles/{id}/` — Retrieve Vehicle

### Path Parameters

| Param | Type | Description  |
|-------|------|--------------|
| `id`  | int  | Vehicle ID   |

### Response

**200 OK**

```json
{
  "id": 1,
  "registration_number": "MH-12-AB-1234",
  "name_model": "Tata Ace Gold",
  "type": "truck",
  "max_load_capacity_kg": "2500.00",
  "odometer": "15230.50",
  "acquisition_cost": "850000.00",
  "status": "on_trip",
  "created_at": "2025-10-01T08:30:00Z"
}
```

---

## PATCH `/api/fleet/vehicles/{id}/` — Partial Update Vehicle

Send only the fields you want to change.

### Path Parameters

| Param | Type | Description  |
|-------|------|--------------|
| `id`  | int  | Vehicle ID   |

### Request

| Field                 | Type    | Required | Description              |
|-----------------------|---------|----------|--------------------------|
| `registration_number` | string  | No       | Updated registration      |
| `name_model`          | string  | No       | Updated name/model        |
| `type`                | string  | No       | Updated type              |
| `max_load_capacity_kg`| decimal | No       | Updated capacity          |
| `odometer`            | decimal | No       | Updated odometer          |
| `acquisition_cost`    | decimal | No       | Updated cost              |
| `status`              | string  | No       | Updated status            |

#### Example

```json
{
  "status": "in_shop"
}
```

### Response

**200 OK**

```json
{
  "id": 1,
  "registration_number": "MH-12-AB-1234",
  "name_model": "Tata Ace Gold",
  "type": "truck",
  "max_load_capacity_kg": "2500.00",
  "odometer": "15230.50",
  "acquisition_cost": "850000.00",
  "status": "in_shop",
  "created_at": "2025-10-01T08:30:00Z"
}
```

---

## DELETE `/api/fleet/vehicles/{id}/` — Delete Vehicle

### Path Parameters

| Param | Type | Description  |
|-------|------|--------------|
| `id`  | int  | Vehicle ID   |

### Response

**204 No Content**

No response body.
