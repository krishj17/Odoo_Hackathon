# Error Responses

All error responses follow the standard REST format. The response body contains a JSON object describing the error.

---

## 400 Bad Request

Returned when the request body fails validation.

### Missing Required Field

```json
{
  "license_expiry_date": ["This field is required."]
}
```

### Duplicate Unique Field

```json
{
  "registration_number": ["vehicle with this registration number already exists."]
}
```

### Multiple Validation Errors

```json
{
  "registration_number": ["vehicle with this registration number already exists."],
  "license_expiry_date": ["This field is required."],
  "contact_number": ["This field is required."]
}
```

---

## 401 Unauthorized

Returned when the JWT token is missing, invalid, or expired.

### Missing Token

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Invalid / Expired Token

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is expired or invalid"
    }
  ]
}
```

---

## 403 Forbidden

Returned when the authenticated user does not have the required role.

```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## 404 Not Found

Returned when the requested resource does not exist.

```json
{
  "detail": "Not found."
}
```
