# GearGuard - Maintenance Management System

A full-stack hackathon project for managing company equipment and maintenance workflows.

## 🚀 Project Overview

**GearGuard** is a comprehensive maintenance management system that helps organizations track equipment, manage maintenance teams, and handle corrective/preventive maintenance requests with automated workflow validation.

## 🎯 Key Features

- ✅ **Equipment Management** - Track all company equipment with warranty, location, and ownership
- ✅ **Team Management** - Organize maintenance technicians into teams
- ✅ **Smart Request Assignment** - Auto-assign teams based on equipment defaults
- ✅ **Workflow Validation** - Enforced status transitions (NEW → IN_PROGRESS → REPAIRED → SCRAP)
- ✅ **Technician Validation** - Only team members can be assigned to requests
- ✅ **Auto-Scrap Logic** - Equipment automatically marked unusable when scrapped
- ✅ **Calendar View** - Preventive maintenance scheduling and visualization

## 🛠️ Tech Stack

### Backend
- Django 5.0.1
- Django REST Framework 3.14.0
- SQLite (development) / PostgreSQL (production-ready)
- Python 3.12+

### Frontend (To be added)
- React
- (Your frontend stack here)

## 📁 Project Structure

```
odooxadani-hackathon-2026/
├── backend/                 # Django REST API
│   ├── gearguard/          # Project settings
│   ├── maintenance/        # Main app (models, views, serializers)
│   ├── manage.py
│   ├── requirements.txt
│   └── README.md
├── start_server.bat        # Quick server start script
├── QUICKSTART.md          # Quick setup guide
├── .gitignore
└── README.md
```

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Setup Database

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 3. Run Test (Optional)

```bash
python test_setup.py
```

### 4. Start Server

**Option A - Using script:**
```bash
start_server.bat
```

**Option B - Manual:**
```bash
cd backend
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## 📚 API Documentation

See [QUICKSTART.md](QUICKSTART.md) for detailed API documentation and testing examples.

### Main Endpoints

- `/api/equipment/` - Equipment CRUD operations
- `/api/teams/` - Team management
- `/api/requests/` - Maintenance request management
- `/api/requests/{id}/status/` - Update request status
- `/api/requests/{id}/assign/` - Assign technician
- `/api/calendar/` - Preventive maintenance calendar
- `/api/equipment/{id}/requests/` - Get all requests for equipment

## 🧪 Testing

Run the validation test:

```bash
cd backend
python test_setup.py
```

This creates test data and validates all business logic:
- Auto-team assignment
- Status workflow transitions
- Equipment scrap logic
- Technician assignment validation

## 🎓 Business Logic

### 1. Auto-Team Assignment
When creating a maintenance request, if the equipment has a default team, it's automatically assigned.

### 2. Technician Validation
Technicians can only be assigned if they're members of the request's assigned team.

### 3. Status Workflow
Valid state transitions:
```
NEW → IN_PROGRESS → REPAIRED → SCRAP
              └──────────┘
```

### 4. Equipment Scrap Logic
When a request status becomes SCRAP, the equipment's `is_usable` flag is automatically set to `false`.

### 5. Calendar Integration
All PREVENTIVE maintenance requests appear in the calendar endpoint with calculated end times.

## 📊 Database Schema

### Equipment
- name, serial_number, department_or_owner, location
- purchase_date, warranty_end
- default_team, default_technician
- is_usable (auto-updated on SCRAP)

### MaintenanceTeam
- name
- members (Many-to-Many with User)

### MaintenanceRequest
- subject, equipment (FK)
- request_type: CORRECTIVE | PREVENTIVE
- team (auto-assigned), technician (validated)
- scheduled_date, duration
- status: NEW | IN_PROGRESS | REPAIRED | SCRAP
- created_by

## 🔧 Development

### Run Server
```bash
python manage.py runserver
```

### Access Admin Panel
```bash
http://localhost:8000/admin/
```

### Create Test Data
Use the Django shell:
```bash
python manage.py shell
```

Or use the test script:
```bash
python test_setup.py
```

## 🚢 Deployment Ready

- CORS configured for frontend integration
- REST API with full CRUD operations
- Admin panel for data management
- Migrations included
- Production-ready model validation

## 📝 TODO (Post-Hackathon)

- [ ] Add JWT authentication
- [ ] Add file uploads for maintenance reports
- [ ] Add email notifications for due maintenance
- [ ] Add maintenance history/audit log
- [ ] Switch to PostgreSQL
- [ ] Add comprehensive unit tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add frontend application

## 👥 Team

Mayurichavan065 - [GitHub](https://github.com/Mayurichavan065)

## 📄 License

MIT License - feel free to use for your hackathon projects!

---

Built with ❤️ for Hackathon 2026
Official repository for Odoo x Adani University Hackathon 2026 virtual round submission.
