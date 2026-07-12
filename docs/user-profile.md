# User Profile

**Base URL:** `http://localhost:8000/api`  
**Auth:** `Authorization: Bearer <access_token>`  
**Content-Type:** `application/json`

---

## GET `/api/users/me/`

Returns the profile of the currently authenticated user.

### Request

No body required. User is identified from the JWT token.

### Response

**200 OK**

| Field        | Type   | Description                              |
|--------------|--------|------------------------------------------|
| `id`         | int    | Auto-generated user ID                   |
| `username`   | string | Unique username                          |
| `first_name` | string | User's first name                        |
| `last_name`  | string | User's last name                         |
| `email`      | string | Unique email (used as login identifier)  |
| `role`       | string | User role for permission checks          |

### Role Values

| Role              | Description                        |
|-------------------|------------------------------------|
| `fleet_manager`   | Can manage vehicles                |
| `dispatcher`      | Can manage trips                   |
| `safety_officer`  | Can manage drivers                 |
| `financial_analyst` | Can view expenses and reports    |

#### Example

```json
{
  "id": 1,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "role": "fleet_manager"
}
```
