# GearGuard - Maintenance Management System

A Django REST API backend for managing company equipment and maintenance workflows.

## 🚀 Project Overview

**GearGuard** is a comprehensive maintenance management system that helps organizations track equipment, manage maintenance teams, and handle corrective/preventive maintenance requests with automated workflow validation.

## Tech Stack

- Django 5.0.1
- Django REST Framework 3.14.0
- SQLite (default, easily switchable to PostgreSQL/MySQL)

## Features

### Core Entities

1. **Equipment** - Company equipment requiring maintenance
2. **MaintenanceTeam** - Teams with assigned technicians
3. **MaintenanceRequest** - Maintenance requests with workflow management

### Business Logic

- ✅ Auto-assign maintenance team from equipment default
- ✅ Validate technician belongs to assigned team
- ✅ Workflow validation: NEW → IN_PROGRESS → REPAIRED → SCRAP
- ✅ Auto-mark equipment unusable when status = SCRAP
- ✅ Preventive maintenance calendar view

## API Endpoints

### Equipment
- `GET /api/equipment/` - List all equipment
- `POST /api/equipment/` - Create equipment
- `GET /api/equipment/{id}/` - Get equipment details
- `PUT /api/equipment/{id}/` - Update equipment
- `DELETE /api/equipment/{id}/` - Delete equipment
- `GET /api/equipment/{id}/requests/` - Get all requests for equipment

### Maintenance Teams
- `GET /api/teams/` - List all teams
- `POST /api/teams/` - Create team
- `GET /api/teams/{id}/` - Get team details
- `PUT /api/teams/{id}/` - Update team
- `DELETE /api/teams/{id}/` - Delete team

### Maintenance Requests
- `GET /api/requests/` - List all requests
- `POST /api/requests/` - Create request (auto-assigns team)
- `GET /api/requests/{id}/` - Get request details
- `PUT /api/requests/{id}/` - Update request
- `DELETE /api/requests/{id}/` - Delete request
- `POST /api/requests/{id}/status/` - Update status (validates workflow)
- `POST /api/requests/{id}/assign/` - Assign technician (validates team)

### Calendar
- `GET /api/calendar/` - Get preventive maintenance calendar events

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (for admin panel)

```bash
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

Admin panel: `http://localhost:8000/admin/`

## Quick Test with Sample Data

After running migrations, you can test the API:

### 1. Create a user (technician) via admin panel or shell

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User
user = User.objects.create_user('tech1', 'tech1@example.com', 'password123')
user.first_name = 'John'
user.last_name = 'Doe'
user.save()
```

### 2. Create sample data via API

**Create a team:**
```bash
curl -X POST http://localhost:8000/api/teams/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Electrical Team", "member_ids": [1]}'
```

**Create equipment:**
```bash
curl -X POST http://localhost:8000/api/equipment/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Generator A",
    "serial_number": "GEN-001",
    "department_or_owner": "Facilities",
    "location": "Building A",
    "purchase_date": "2023-01-15",
    "default_team": 1
  }'
```

**Create maintenance request:**
```bash
curl -X POST http://localhost:8000/api/requests/ \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Routine maintenance check",
    "equipment": 1,
    "request_type": "PREVENTIVE",
    "scheduled_date": "2025-01-15T10:00:00Z",
    "duration": "02:00:00"
  }'
```

**Update status:**
```bash
curl -X POST http://localhost:8000/api/requests/1/status/ \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

**Assign technician:**
```bash
curl -X POST http://localhost:8000/api/requests/1/assign/ \
  -H "Content-Type: application/json" \
  -d '{"technician": 1}'
```

## Project Structure

```
backend/
├── gearguard/              # Project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── maintenance/            # Main app
│   ├── models.py          # Equipment, Team, Request models
│   ├── serializers.py     # DRF serializers with validation
│   ├── views.py           # ViewSets and business logic
│   ├── urls.py            # API routing
│   └── admin.py           # Django admin configuration
├── manage.py
└── requirements.txt
```

## Business Rules Implementation

### 1. Auto-assign Team
When creating a maintenance request, if equipment has a `default_team`, it's automatically assigned.

### 2. Technician Validation
Only technicians who are members of the assigned team can be assigned to requests.

### 3. Status Workflow
Valid transitions enforced in serializer and view:
- NEW → IN_PROGRESS
- IN_PROGRESS → REPAIRED or SCRAP
- REPAIRED → SCRAP
- SCRAP → (terminal state)

### 4. Equipment Scrap Logic
When request status changes to SCRAP, equipment's `is_usable` flag is set to `false`.

### 5. Calendar Integration
Preventive maintenance requests are available via `/api/calendar/` endpoint with calculated end times.

## Notes for Hackathon

- CORS is wide open for easy frontend integration
- Authentication is disabled for speed (enable in production)
- SQLite for easy setup (switch to PostgreSQL for production)
- All validation is in serializers for clean separation
- Admin panel is configured for easy data management

## Next Steps (Post-Hackathon)

- Add authentication (JWT/Token)
- Add permissions and role-based access
- Add notification system for due maintenance
- Add file uploads for maintenance reports
- Add maintenance history tracking
- Switch to PostgreSQL
- Add unit tests
- Add API documentation (Swagger/OpenAPI)
