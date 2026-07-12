# Drivers API

**Base URL:** `http://localhost:8000/api/fleet/drivers/`  
**Auth:** `Authorization: Bearer <access_token>`  
**Content-Type:** `application/json`

**Permissions:**
- **GET** (list/retrieve): Any authenticated user
- **POST / PATCH / DELETE**: Safety Officer only (`role: "safety_officer"`)

---

## GET `/api/fleet/drivers/` — List All Drivers

### Response

**200 OK**

```json
[
  {
    "id": 1,
    "name": "Rajesh Kumar",
    "license_number": "MH1220230001",
    "license_category": "HMV",
    "license_expiry_date": "2027-06-15",
    "contact_number": "9876543210",
    "status": "available",
    "created_at": "2025-09-15T10:00:00Z"
  }
]
```

---

## POST `/api/fleet/drivers/` — Create Driver

### Request

| Field                | Type   | Required | Description                                |
|----------------------|--------|----------|--------------------------------------------|
| `name`               | string | Yes      | Driver's full name                         |
| `license_number`     | string | Yes      | Unique license number                      |
| `license_category`   | string | Yes      | License category: `LMV` or `HMV`          |
| `license_expiry_date`| date   | Yes      | License expiry date (format: `YYYY-MM-DD`) |
| `contact_number`     | string | Yes      | Phone number                               |
| `status`             | string | No       | Default: `available`                       |

`created_at` is auto-set. Do not include it in the request.

#### Example

```json
{
  "name": "Rajesh Kumar",
  "license_number": "MH1220230001",
  "license_category": "HMV",
  "license_expiry_date": "2027-06-15",
  "contact_number": "9876543210",
  "status": "available"
}
```

### Response

**201 Created**

```json
{
  "id": 1,
  "name": "Rajesh Kumar",
  "license_number": "MH1220230001",
  "license_category": "HMV",
  "license_expiry_date": "2027-06-15",
  "contact_number": "9876543210",
  "status": "available",
  "created_at": "2025-09-15T10:00:00Z"
}
```

---

## GET `/api/fleet/drivers/{id}/` — Retrieve Driver

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id`  | int  | Driver ID   |

### Response

**200 OK**

```json
{
  "id": 1,
  "name": "Rajesh Kumar",
  "license_number": "MH1220230001",
  "license_category": "HMV",
  "license_expiry_date": "2027-06-15",
  "contact_number": "9876543210",
  "status": "available",
  "created_at": "2025-09-15T10:00:00Z"
}
```

---

## PATCH `/api/fleet/drivers/{id}/` — Partial Update Driver

Send only the fields you want to change.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id`  | int  | Driver ID   |

### Request

| Field                | Type   | Required | Description                  |
|----------------------|--------|----------|------------------------------|
| `name`               | string | No       | Updated name                 |
| `license_number`     | string | No       | Updated license number       |
| `license_category`   | string | No       | Updated category             |
| `license_expiry_date`| date   | No       | Updated expiry date          |
| `contact_number`     | string | No       | Updated phone number         |
| `status`             | string | No       | Updated status               |

#### Example

```json
{
  "status": "suspended"
}
```

### Response

**200 OK**

```json
{
  "id": 1,
  "name": "Rajesh Kumar",
  "license_number": "MH1220230001",
  "license_category": "HMV",
  "license_expiry_date": "2027-06-15",
  "contact_number": "9876543210",
  "status": "suspended",
  "created_at": "2025-09-15T10:00:00Z"
}
```

---

## DELETE `/api/fleet/drivers/{id}/` — Delete Driver

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id`  | int  | Driver ID   |

### Response

**204 No Content**

No response body.
