# Authentication

**Base URL:** `http://localhost:8000/api`  
**Content-Type:** `application/json`


## POST `/api/users/login/`

Obtain a JWT access and refresh token pair.

### Request

No auth required.

| Field    | Type   | Required | Description            |
|----------|--------|----------|------------------------|
| `email`  | string | Yes      | User's registered email |
| `password` | string | Yes    | User's password         |

#### Example

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

### Response

**200 OK**

| Field     | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `access`  | string | Short-lived JWT access token (6 hours) |
| `refresh` | string | Long-lived JWT refresh token (7 days)  |

#### Example

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## POST `/api/users/refresh/`

Refresh an expired access token using a valid refresh token.

### Request

No auth required.

| Field     | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| `refresh` | string | Yes      | The refresh token     |

#### Example

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response

**200 OK**

| Field    | Type   | Description                    |
|----------|--------|--------------------------------|
| `access` | string | New short-lived access token   |

#### Example

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```
