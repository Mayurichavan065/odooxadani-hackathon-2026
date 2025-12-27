# GearGuard Backend - Quick Start Guide

## ✅ Setup Complete!

Your Django backend is fully configured and ready to use.

## Start the Development Server

```bash
cd backend
C:/Users/rajnp/Desktop/odoo/odooxadani-hackathon-2026/.venv/Scripts/python.exe manage.py runserver
```

Or simply:

```bash
cd backend
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

## API Endpoints Overview

### Equipment Management
- `GET    /api/equipment/` - List all equipment
- `POST   /api/equipment/` - Create new equipment
- `GET    /api/equipment/{id}/` - Get equipment details
- `PUT    /api/equipment/{id}/` - Update equipment
- `DELETE /api/equipment/{id}/` - Delete equipment
- `GET    /api/equipment/{id}/requests/` - Get all maintenance requests for equipment

### Maintenance Teams
- `GET    /api/teams/` - List all teams
- `POST   /api/teams/` - Create new team
- `GET    /api/teams/{id}/` - Get team details
- `PUT    /api/teams/{id}/` - Update team
- `DELETE /api/teams/{id}/` - Delete team

### Maintenance Requests
- `GET    /api/requests/` - List all requests
- `POST   /api/requests/` - Create new request
- `GET    /api/requests/{id}/` - Get request details
- `PUT    /api/requests/{id}/` - Update request
- `DELETE /api/requests/{id}/` - Delete request
- `POST   /api/requests/{id}/status/` - Update status (workflow validated)
- `POST   /api/requests/{id}/assign/` - Assign technician (team validated)

### Calendar
- `GET    /api/calendar/` - Get preventive maintenance events

## Create Admin User

```bash
python manage.py createsuperuser
```

Then access the admin panel at: `http://localhost:8000/admin/`

## Test the API

### Create a Technician User
```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User
tech = User.objects.create_user('technician1', 'tech@example.com', 'pass123')
tech.first_name = 'John'
tech.last_name = 'Smith'
tech.save()
print(f"Created user with ID: {tech.id}")
exit()
```

### Test API with curl or Postman

**1. Create a Team:**
```bash
curl -X POST http://localhost:8000/api/teams/ ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Electrical Team\", \"member_ids\": [1]}"
```

**2. Create Equipment:**
```bash
curl -X POST http://localhost:8000/api/equipment/ ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Generator A\", \"serial_number\": \"GEN-001\", \"department_or_owner\": \"Facilities\", \"location\": \"Building A\", \"purchase_date\": \"2023-01-15\", \"default_team\": 1}"
```

**3. Create Maintenance Request:**
```bash
curl -X POST http://localhost:8000/api/requests/ ^
  -H "Content-Type: application/json" ^
  -d "{\"subject\": \"Routine check\", \"equipment\": 1, \"request_type\": \"PREVENTIVE\", \"scheduled_date\": \"2025-01-15T10:00:00Z\", \"duration\": \"02:00:00\"}"
```

**4. Update Status:**
```bash
curl -X POST http://localhost:8000/api/requests/1/status/ ^
  -H "Content-Type: application/json" ^
  -d "{\"status\": \"IN_PROGRESS\"}"
```

**5. Assign Technician:**
```bash
curl -X POST http://localhost:8000/api/requests/1/assign/ ^
  -H "Content-Type: application/json" ^
  -d "{\"technician\": 1}"
```

## Business Logic Implemented

✅ **Auto-assign team** - Equipment's default team auto-assigned to new requests  
✅ **Technician validation** - Only team members can be assigned  
✅ **Status workflow** - NEW → IN_PROGRESS → REPAIRED → SCRAP  
✅ **Auto-scrap equipment** - Equipment marked unusable when status = SCRAP  
✅ **Calendar view** - Preventive maintenance appears in calendar endpoint  

## Project Structure

```
backend/
├── gearguard/              # Django project settings
├── maintenance/            # Main application
│   ├── models.py          # Equipment, Team, Request models
│   ├── serializers.py     # REST serializers with validation
│   ├── views.py           # API views with business logic
│   ├── urls.py            # API routing
│   └── admin.py           # Admin panel config
├── manage.py
├── requirements.txt
└── db.sqlite3            # Database (created)
```

## Notes

- CORS is enabled for all origins (perfect for hackathon)
- No authentication required (add in production)
- SQLite database (switch to PostgreSQL for production)
- All validation is automatic via serializers

Happy hacking! 🚀
