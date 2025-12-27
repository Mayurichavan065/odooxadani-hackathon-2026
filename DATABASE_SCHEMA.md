# GearGuard Database Schema Documentation

## Overview
This document describes the complete database schema for the GearGuard Maintenance Management System. The database uses SQLite for development and contains 14 tables total (4 core business tables + 10 Django system tables).

---

## Core Business Tables

### 1. `maintenance_equipment`
Stores all company assets (machines, vehicles, computers) that require maintenance.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `name` | varchar(200) | ✓ | Equipment name |
| `serial_number` | varchar(100) | ✓ | Unique serial number |
| `department_or_owner` | varchar(200) | ✓ | Department or employee owner |
| `location` | varchar(200) | ✓ | Physical location |
| `purchase_date` | date | ✓ | Date of purchase |
| `warranty_end` | date | ✗ | Warranty expiration date |
| `is_usable` | bool | ✓ | Equipment status (True=usable, False=scrapped) |
| `created_at` | datetime | ✓ | Record creation timestamp |
| `updated_at` | datetime | ✓ | Last update timestamp |
| `default_technician_id` | INTEGER | ✗ | FK to `auth_user` |
| `default_team_id` | bigint | ✗ | FK to `maintenance_maintenanceteam` |

**Foreign Keys:**
- `default_technician_id` → `auth_user(id)` - Default technician for this equipment
- `default_team_id` → `maintenance_maintenanceteam(id)` - Default maintenance team

**Indexes:**
- `maintenance_equipment_default_technician_id_51c9e9e9`
- `maintenance_equipment_default_team_id_5174cad2`

**Business Logic:**
- When a maintenance request is marked as SCRAP, `is_usable` automatically becomes False
- Serial number should be unique

---

### 2. `maintenance_maintenanceteam`
Stores maintenance teams (e.g., Mechanics, Electricians, IT Support).

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `name` | varchar(200) | ✓ | Team name |
| `created_at` | datetime | ✓ | Record creation timestamp |
| `updated_at` | datetime | ✓ | Last update timestamp |

**Relationships:**
- One-to-Many with `maintenance_equipment` (as default_team)
- Many-to-Many with `auth_user` through `maintenance_maintenanceteam_members`

---

### 3. `maintenance_maintenanceteam_members`
Junction table for the Many-to-Many relationship between teams and technicians.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `maintenanceteam_id` | bigint | ✓ | FK to `maintenance_maintenanceteam` |
| `user_id` | INTEGER | ✓ | FK to `auth_user` |

**Foreign Keys:**
- `maintenanceteam_id` → `maintenance_maintenanceteam(id)`
- `user_id` → `auth_user(id)`

**Constraints:**
- Unique constraint on (`maintenanceteam_id`, `user_id`) - prevents duplicate team memberships

**Indexes:**
- `maintenance_maintenanceteam_members_maintenanceteam_id_user_id_f7f5e111_uniq` (Unique)
- `maintenance_maintenanceteam_members_maintenanceteam_id_a7144ce8`
- `maintenance_maintenanceteam_members_user_id_662760d7`

---

### 4. `maintenance_maintenancerequest`
Stores maintenance requests (both corrective and preventive).

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `subject` | varchar(300) | ✓ | Request description/subject |
| `request_type` | varchar(20) | ✓ | Type: `CORRECTIVE` or `PREVENTIVE` |
| `scheduled_date` | datetime | ✓ | When work should be performed |
| `duration` | bigint | ✓ | Duration in microseconds |
| `status` | varchar(20) | ✓ | Status: `NEW`, `IN_PROGRESS`, `REPAIRED`, or `SCRAP` |
| `created_at` | datetime | ✓ | Record creation timestamp |
| `updated_at` | datetime | ✓ | Last update timestamp |
| `created_by_id` | INTEGER | ✗ | FK to `auth_user` (request creator) |
| `equipment_id` | bigint | ✓ | FK to `maintenance_equipment` |
| `technician_id` | INTEGER | ✗ | FK to `auth_user` (assigned technician) |
| `team_id` | bigint | ✗ | FK to `maintenance_maintenanceteam` |

**Foreign Keys:**
- `created_by_id` → `auth_user(id)` - User who created the request
- `equipment_id` → `maintenance_equipment(id)` - Equipment requiring maintenance
- `technician_id` → `auth_user(id)` - Assigned technician
- `team_id` → `maintenance_maintenanceteam(id)` - Assigned team

**Indexes:**
- `maintenance_maintenancerequest_created_by_id_3c488460`
- `maintenance_maintenancerequest_equipment_id_4869814d`
- `maintenance_maintenancerequest_technician_id_8df895e2`
- `maintenance_maintenancerequest_team_id_6fe7a8a3`

**Business Logic:**
- When equipment is selected, team is auto-assigned from equipment's `default_team_id`
- Status workflow: `NEW` → `IN_PROGRESS` → `REPAIRED` or `SCRAP`
- When status changes to `SCRAP`, equipment's `is_usable` flag is set to False
- Assigned technician must be a member of the assigned team

**Request Types:**
- `CORRECTIVE`: Unplanned repair (breakdown)
- `PREVENTIVE`: Planned maintenance (routine checkup)

**Status Values:**
- `NEW`: Just created, awaiting assignment
- `IN_PROGRESS`: Work has started
- `REPAIRED`: Successfully completed
- `SCRAP`: Equipment is beyond repair

---

## User & Authentication Tables

### 5. `auth_user`
Django's built-in user table storing technicians, managers, and staff.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `password` | varchar(128) | ✓ | Hashed password |
| `last_login` | datetime | ✗ | Last login timestamp |
| `is_superuser` | bool | ✓ | Admin privileges |
| `username` | varchar(150) | ✓ | Unique username |
| `first_name` | varchar(150) | ✓ | User's first name |
| `last_name` | varchar(150) | ✓ | User's last name |
| `email` | varchar(254) | ✓ | Email address |
| `is_staff` | bool | ✓ | Can access admin panel |
| `is_active` | bool | ✓ | Account is active |
| `date_joined` | datetime | ✓ | Registration date |

**Constraints:**
- `username` must be unique

---

### 6. `auth_group`
User groups for permission management.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `name` | varchar(150) | ✓ | Group name (unique) |

---

### 7. `auth_group_permissions`
Many-to-Many junction table between groups and permissions.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `group_id` | INTEGER | ✓ | FK to `auth_group` |
| `permission_id` | INTEGER | ✓ | FK to `auth_permission` |

**Unique Constraint:** (`group_id`, `permission_id`)

---

### 8. `auth_permission`
Available permissions in the system.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `content_type_id` | INTEGER | ✓ | FK to `django_content_type` |
| `codename` | varchar(100) | ✓ | Permission code |
| `name` | varchar(255) | ✓ | Human-readable name |

**Unique Constraint:** (`content_type_id`, `codename`)

---

### 9. `auth_user_groups`
Many-to-Many junction table between users and groups.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `user_id` | INTEGER | ✓ | FK to `auth_user` |
| `group_id` | INTEGER | ✓ | FK to `auth_group` |

**Unique Constraint:** (`user_id`, `group_id`)

---

### 10. `auth_user_user_permissions`
Many-to-Many junction table for direct user permissions.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `user_id` | INTEGER | ✓ | FK to `auth_user` |
| `permission_id` | INTEGER | ✓ | FK to `auth_permission` |

**Unique Constraint:** (`user_id`, `permission_id`)

---

## Django System Tables

### 11. `django_admin_log`
Logs all admin panel actions for audit trail.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `action_time` | datetime | ✓ | When action occurred |
| `object_id` | TEXT | ✗ | ID of affected object |
| `object_repr` | varchar(200) | ✓ | String representation |
| `action_flag` | smallint unsigned | ✓ | Action type (add/change/delete) |
| `change_message` | TEXT | ✓ | Description of change |
| `content_type_id` | INTEGER | ✗ | FK to `django_content_type` |
| `user_id` | INTEGER | ✓ | FK to `auth_user` |

---

### 12. `django_content_type`
Maps models to their apps and names.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `app_label` | varchar(100) | ✓ | Django app name |
| `model` | varchar(100) | ✓ | Model name |

**Unique Constraint:** (`app_label`, `model`)

---

### 13. `django_migrations`
Tracks which database migrations have been applied.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | INTEGER | ✓ (PK) | Primary key |
| `app` | varchar(255) | ✓ | App name |
| `name` | varchar(255) | ✓ | Migration file name |
| `applied` | datetime | ✓ | When migration was applied |

---

### 14. `django_session`
Stores user session data.

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| `session_key` | varchar(40) | ✓ (PK) | Session identifier |
| `session_data` | TEXT | ✓ | Encrypted session data |
| `expire_date` | datetime | ✓ | When session expires |

**Indexes:**
- `django_session_expire_date_a5c62663` - For efficient session cleanup

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│   auth_user     │
│  (Technicians)  │
└────────┬────────┘
         │
         │ members (M2M)
         ↓
┌─────────────────────────────────┐
│ maintenance_maintenanceteam     │
│ - id                            │
│ - name                          │
└────────┬────────────────────────┘
         │
         │ default_team (FK)
         ↓
┌──────────────────────────────────┐
│ maintenance_equipment            │
│ - id                             │
│ - name, serial_number            │
│ - department_or_owner, location  │
│ - purchase_date, warranty_end    │
│ - is_usable                      │
│ - default_team_id (FK)           │
│ - default_technician_id (FK)     │
└────────┬─────────────────────────┘
         │
         │ equipment (FK)
         ↓
┌──────────────────────────────────┐
│ maintenance_maintenancerequest   │
│ - id                             │
│ - subject, request_type          │
│ - scheduled_date, duration       │
│ - status                         │
│ - equipment_id (FK)              │
│ - team_id (FK)                   │
│ - technician_id (FK)             │
│ - created_by_id (FK)             │
└──────────────────────────────────┘
```

---

## Sample Data (Test Records)

### Equipment
```json
{
  "id": 1,
  "name": "TEST Generator",
  "serial_number": "TEST-GEN-001",
  "department_or_owner": "TEST Facilities",
  "location": "TEST Building A",
  "purchase_date": "2025-12-27",
  "is_usable": false,
  "default_team_id": 1
}
```

### Team
```json
{
  "id": 1,
  "name": "TEST Electrical Team",
  "members": [1]
}
```

### User (Technician)
```json
{
  "id": 1,
  "username": "testtech",
  "first_name": "Test",
  "last_name": "Technician",
  "email": "test@example.com"
}
```

### Maintenance Request
```json
{
  "id": 1,
  "subject": "TEST Routine maintenance",
  "request_type": "PREVENTIVE",
  "scheduled_date": "2026-01-03T10:07:46.799412",
  "duration": 7200000000,
  "status": "SCRAP",
  "equipment_id": 1,
  "team_id": 1,
  "technician_id": 1
}
```

---

## Database Constraints & Rules

### Unique Constraints
- `auth_user.username` - No duplicate usernames
- `maintenance_equipment.serial_number` - Each equipment has unique serial (recommended)
- `maintenance_maintenanceteam_members(maintenanceteam_id, user_id)` - No duplicate team memberships

### Cascade Rules
All foreign keys use `ON DELETE: NO ACTION` to prevent accidental data loss.

### Business Rules Enforced in Code
1. **Auto-team assignment**: When creating a maintenance request, if equipment is selected, the team is automatically assigned from `equipment.default_team_id`
2. **Scrap logic**: When request status changes to `SCRAP`, the associated equipment's `is_usable` flag is set to False
3. **Technician validation**: Assigned technician must be a member of the assigned team
4. **Status workflow**: Status can only transition in this order: `NEW` → `IN_PROGRESS` → `REPAIRED` or `SCRAP`

---

## Indexes Summary

### Core Business Tables
- All foreign keys are indexed for query performance
- Many-to-Many junction tables have unique composite indexes
- No full-text search indexes (can be added if needed)

### Query Optimization
The database is optimized for:
- Finding all requests for a specific equipment
- Finding all requests assigned to a specific team
- Finding all requests assigned to a specific technician
- Calendar queries for preventive maintenance
- Team membership lookups

---

## Migration History

Current migration: `0001_initial.py`

Applied migrations tracked in `django_migrations` table.

---

## Database Statistics (Current Test Data)

| Table | Record Count |
|-------|--------------|
| `maintenance_equipment` | 1 |
| `maintenance_maintenanceteam` | 1 |
| `maintenance_maintenanceteam_members` | 1 |
| `maintenance_maintenancerequest` | 1 |
| `auth_user` | 1 |
| All other tables | 0 (system) |

---

## Database Access

### Development
- **Engine**: SQLite3
- **Location**: `backend/db.sqlite3`
- **Admin Panel**: http://localhost:8000/admin/

### Utilities
- **Show all data**: Run `python backend/show_db.py`
- **Show schema**: Run `python backend/show_schema.py`

---

## API Endpoints Mapping

| Endpoint | Primary Table | Joins |
|----------|---------------|-------|
| `GET /api/equipment/` | `maintenance_equipment` | `default_team`, `default_technician` |
| `GET /api/equipment/{id}/requests/` | `maintenance_maintenancerequest` | Filter by `equipment_id` |
| `GET /api/teams/` | `maintenance_maintenanceteam` | `members` (M2M) |
| `GET /api/requests/` | `maintenance_maintenancerequest` | `equipment`, `team`, `technician`, `created_by` |
| `GET /api/calendar/` | `maintenance_maintenancerequest` | Filter `request_type=PREVENTIVE` |

---

## Future Enhancements

Potential schema improvements for production:

1. **Add indexes for common queries**:
   - `maintenance_maintenancerequest.scheduled_date` for calendar queries
   - `maintenance_maintenancerequest.status` for filtering
   - `maintenance_equipment.serial_number` (unique constraint)

2. **Add audit fields**:
   - Track who modified records
   - Log status change history

3. **Add soft delete**:
   - `deleted_at` timestamp instead of hard deletes

4. **Add file attachments**:
   - Photos of equipment
   - Maintenance reports/documentation

5. **Add recurring maintenance schedules**:
   - Cron-like schedule table for automatic preventive request creation

---

*Last Updated: December 27, 2025*
*Database Version: 1.0 (Initial)*
*Django Version: 5.0.1*
