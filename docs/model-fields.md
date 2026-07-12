# Model Field Reference

Field types and constraints for all models used in the API.

---

## Vehicle

| Field                    | Type                 | Constraints                              | Notes                          |
|--------------------------|----------------------|------------------------------------------|--------------------------------|
| `id`                     | int                  | Primary key, auto-generated             | Read-only                      |
| `registration_number`    | string (max 20)      | **unique**                               |                                |
| `name_model`             | string (max 100)     |                                          |                                |
| `type`                   | string (max 20)      | Free text                               | `van` / `truck` / `mini`       |
| `max_load_capacity_kg`   | decimal (10,2)       |                                          |                                |
| `odometer`               | decimal (10,2)       | default: `0`                             |                                |
| `acquisition_cost`       | decimal (12,2)       |                                          |                                |
| `status`                 | string (max 20)      | Choices                                  | `available` / `on_trip` / `in_shop` / `retired` |
| `created_at`             | datetime             | auto_now_add=True                        | Read-only                      |

---

## Driver

| Field                | Type               | Constraints                              | Notes                    |
|----------------------|--------------------|------------------------------------------|--------------------------|
| `id`                 | int                | Primary key, auto-generated             | Read-only                |
| `name`               | string (max 100)   |                                          |                          |
| `license_number`     | string (max 30)    | **unique**                               |                          |
| `license_category`   | string (max 10)    | Free text                               | `LMV` / `HMV`           |
| `license_expiry_date`| date               |                                          | Format: `YYYY-MM-DD`    |
| `contact_number`     | string (max 15)    |                                          |                          |
| `status`             | string (max 20)    | Choices                                  | `available` / `on_trip` / `off_duty` / `suspended` |
| `created_at`         | datetime           | auto_now_add=True                        | Read-only                |

---

## MaintenanceLog

| Field          | Type                 | Constraints                              | Notes                    |
|----------------|----------------------|------------------------------------------|--------------------------|
| `id`           | int                  | Primary key, auto-generated             |                          |
| `vehicle`      | ForeignKey → Vehicle | on_delete=CASCADE                       | related_name: `maintenance_logs` |
| `service_type` | string (max 100)     |                                          |                          |
| `cost`         | decimal (10,2)       |                                          |                          |
| `service_date` | date                 |                                          |                          |
| `status`       | string (max 20)      | Choices                                  | `active` / `completed`   |
| `created_at`   | datetime             | auto_now_add=True                        |                          |

> **Note:** No API endpoints exist for MaintenanceLog yet. Model only.

---

## Trip

| Field                | Type                 | Constraints                              | Notes                    |
|----------------------|----------------------|------------------------------------------|--------------------------|
| `id`                 | int                  | Primary key, auto-generated             |                          |
| `trip_code`          | string (max 10)      | **unique**                               | e.g. `TR001`            |
| `source`             | string (max 150)     |                                          |                          |
| `destination`        | string (max 150)     |                                          |                          |
| `vehicle`            | ForeignKey → Vehicle | null=True, blank=True, on_delete=SET_NULL |                       |
| `driver`             | ForeignKey → Driver  | null=True, blank=True, on_delete=SET_NULL |                       |
| `cargo_weight_kg`    | decimal (10,2)       |                                          |                          |
| `planned_distance_km`| decimal (10,2)       |                                          |                          |
| `status`             | string (max 20)      | Choices                                  | `draft` / `dispatched` / `completed` / `cancelled` |
| `dispatched_at`      | datetime             | null=True, blank=True                    |                          |
| `completed_at`       | datetime             | null=True, blank=True                    |                          |
| `final_odometer`     | decimal (10,2)       | null=True, blank=True                    |                          |
| `fuel_consumed_l`    | decimal (10,2)       | null=True, blank=True                    |                          |
| `created_by`         | ForeignKey → User    | null=True, on_delete=SET_NULL            |                          |
| `created_at`         | datetime             | auto_now_add=True                        |                          |

> **Note:** No API endpoints exist for Trip yet. Model only.

---

## Expense

| Field          | Type                 | Constraints                              | Notes                    |
|----------------|----------------------|------------------------------------------|--------------------------|
| `id`           | int                  | Primary key, auto-generated             |                          |
| `trip`         | ForeignKey → Trip    | null=True, blank=True, on_delete=SET_NULL |                       |
| `vehicle`      | ForeignKey → Vehicle | on_delete=CASCADE                       | related_name: `expenses` |
| `expense_type` | string (max 50)      |                                          |                          |
| `amount`       | decimal (10,2)       | default: `0`                             |                          |
| `description`  | text (max 500)       |                                          |                          |
| `created_at`   | datetime             | auto_now_add=True                        |                          |

> **Note:** No API endpoints exist for Expense yet. Model only.
