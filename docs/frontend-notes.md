# Frontend Notes

Important guidelines for the frontend developer consuming this API.

---

## Token Storage

Store both tokens after login:

- **Access token** — Short-lived (6 hours). Use for all API requests.
- **Refresh token** — Long-lived (7 days). Use to get a new access token without re-login.

### Recommended Storage

- `localStorage` or `sessionStorage` for simplicity.
- HTTP-only cookies for better security (if backend supports it).

### Token Refresh Flow

1. Detect 401 response (expired access token).
2. POST to `/api/users/refresh/` with the refresh token.
3. Receive new access token.
4. Retry the original request with the new token.

---

## Role-Based UI

Use the `role` field from `GET /api/users/me/` to control what the user sees.

| Role              | Can Do                                    | Hide From UI                |
|-------------------|-------------------------------------------|-----------------------------|
| `fleet_manager`   | Create/edit/delete vehicles               | Driver management           |
| `dispatcher`      | Manage trips                              | Vehicle/driver management   |
| `safety_officer`  | Create/edit/delete drivers                | Vehicle management          |
| `financial_analyst` | View expenses and reports              | Create/edit operations      |

### Button Visibility

| Action                | Required Role        |
|-----------------------|----------------------|
| "Add Vehicle" button  | `fleet_manager`      |
| "Edit Vehicle" button | `fleet_manager`      |
| "Delete Vehicle" button | `fleet_manager`    |
| "Add Driver" button   | `safety_officer`     |
| "Edit Driver" button  | `safety_officer`     |
| "Delete Driver" button | `safety_officer`   |

---

## Decimal Handling

Decimal fields come as **strings** in API responses (e.g. `"2500.00"`).

### Parse to numbers before display

```javascript
const capacity = parseFloat(vehicle.max_load_capacity_kg);
```

### Format for display

```javascript
new Intl.NumberFormat('en-IN', {
  style: 'unit',
  unit: 'kilogram'
}).format(capacity); // "2,500 kg"
```

---

## Date Handling

- **Date fields** (e.g. `license_expiry_date`): Format `YYYY-MM-DD`
- **DateTime fields** (e.g. `created_at`): Format ISO 8601 (`2025-10-01T08:30:00Z`)
- Use `new Date(isoString)` to parse in JavaScript.

---

## Status Badges

Use colored badges for status values.

### Vehicle Status

| Status      | Badge Color | Label       |
|-------------|-------------|-------------|
| `available` | Green       | Available   |
| `on_trip`   | Blue        | On Trip     |
| `in_shop`   | Yellow      | In Shop     |
| `retired`   | Red         | Retired     |

### Driver Status

| Status      | Badge Color | Label       |
|-------------|-------------|-------------|
| `available` | Green       | Available   |
| `on_trip`   | Blue        | On Trip     |
| `off_duty`  | Gray        | Off Duty    |
| `suspended` | Red         | Suspended   |

---

## Error Handling

All errors follow a consistent JSON structure. See `errors.md` for full details.

### Quick Reference

| Status | Meaning                    | Action                           |
|--------|----------------------------|----------------------------------|
| 400    | Validation failed          | Show field-level errors to user  |
| 401    | Not authenticated          | Redirect to login                |
| 403    | No permission              | Show "access denied" message     |
| 404    | Resource not found         | Show "not found" message         |

---

## API Response Structure

- **Lists** return arrays of objects.
- **Single objects** return the object directly (not wrapped in a `data` key).
- **Decimals** are strings — always parse before display.
- **Dates** are ISO 8601 strings — use `Date` constructor to parse.
