# GearGuard API - Frontend Integration Guide

## ✅ Server Status: ALL APIs WORKING

**Base URL:** `http://127.0.0.1:8000/api/`

All endpoints tested and verified. Ready for frontend integration!

---

## 📋 Available Endpoints

### 1. API Root
**GET** `/api/`

Returns links to all available endpoints.

**Response:**
```json
{
  "equipment": "http://127.0.0.1:8000/api/equipment/",
  "teams": "http://127.0.0.1:8000/api/teams/",
  "requests": "http://127.0.0.1:8000/api/requests/",
  "calendar": "http://127.0.0.1:8000/api/calendar/"
}
```

---

## 🔧 Equipment Endpoints

### List All Equipment
**GET** `/api/equipment/`

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Industrial Generator",
      "serial_number": "GEN-2025-001",
      "department_or_owner": "Facilities Department",
      "location": "Building A - Basement",
      "purchase_date": "2024-01-15",
      "warranty_end": "2027-01-15",
      "default_team": 1,
      "default_team_name": "Electrical Team",
      "default_technician": 1,
      "default_technician_name": "John Doe",
      "is_usable": true,
      "created_at": "2025-12-27T10:00:00Z",
      "updated_at": "2025-12-27T10:00:00Z"
    }
  ]
}
```

### Create Equipment
**POST** `/api/equipment/`

**Request Body:**
```json
{
  "name": "Industrial Generator",
  "serial_number": "GEN-2025-001",
  "department_or_owner": "Facilities Department",
  "location": "Building A - Basement",
  "purchase_date": "2024-01-15",
  "warranty_end": "2027-01-15",
  "default_team": 1,
  "default_technician": 1,
  "is_usable": true
}
```

### Get Equipment Details
**GET** `/api/equipment/{id}/`

### Update Equipment
**PUT** `/api/equipment/{id}/`
**PATCH** `/api/equipment/{id}/`

### Delete Equipment
**DELETE** `/api/equipment/{id}/`

### Get Equipment Requests
**GET** `/api/equipment/{id}/requests/`

Returns all maintenance requests for specific equipment.

---

## 👥 Team Endpoints

### List All Teams
**GET** `/api/teams/`

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Electrical Team",
      "members": [
        {
          "id": 1,
          "username": "tech1",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com"
        }
      ],
      "member_ids": [],
      "created_at": "2025-12-27T10:00:00Z",
      "updated_at": "2025-12-27T10:00:00Z"
    }
  ]
}
```

### Create Team
**POST** `/api/teams/`

**Request Body:**
```json
{
  "name": "Electrical Maintenance Team",
  "member_ids": [1, 2, 3]
}
```

### Get Team Details
**GET** `/api/teams/{id}/`

### Update Team
**PUT** `/api/teams/{id}/`
**PATCH** `/api/teams/{id}/`

### Delete Team
**DELETE** `/api/teams/{id}/`

---

## 🔨 Maintenance Request Endpoints

### List All Requests
**GET** `/api/requests/`

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "subject": "Routine maintenance check",
      "equipment": 1,
      "equipment_name": "Industrial Generator",
      "request_type": "PREVENTIVE",
      "team": 1,
      "team_name": "Electrical Team",
      "technician": 1,
      "technician_name": "John Doe",
      "scheduled_date": "2026-01-15T10:00:00Z",
      "duration": "02:00:00",
      "status": "NEW",
      "created_by": 1,
      "created_by_name": "Admin User",
      "created_at": "2025-12-27T10:00:00Z",
      "updated_at": "2025-12-27T10:00:00Z"
    }
  ]
}
```

### Create Maintenance Request
**POST** `/api/requests/`

**Request Body:**
```json
{
  "subject": "Generator making unusual noise",
  "equipment": 1,
  "request_type": "CORRECTIVE",
  "scheduled_date": "2025-12-30T09:00:00Z",
  "duration": "03:00:00"
}
```

**Notes:**
- `team` is auto-assigned from equipment's default team
- `request_type`: `"CORRECTIVE"` or `"PREVENTIVE"`
- `duration` format: `"HH:MM:SS"`

### Get Request Details
**GET** `/api/requests/{id}/`

### Update Request
**PUT** `/api/requests/{id}/`
**PATCH** `/api/requests/{id}/`

### Delete Request
**DELETE** `/api/requests/{id}/`

---

## 🔄 Special Request Actions

### Update Request Status
**POST** `/api/requests/{id}/status/`

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Valid Status Transitions:**
- `NEW` → `IN_PROGRESS`
- `IN_PROGRESS` → `REPAIRED` or `SCRAP`
- `REPAIRED` → `SCRAP`

**Response:**
```json
{
  "id": 1,
  "subject": "Routine maintenance check",
  "status": "IN_PROGRESS",
  ...
}
```

**Error Response (invalid transition):**
```json
{
  "status": [
    "Invalid status transition from NEW to SCRAP. Allowed transitions: IN_PROGRESS"
  ]
}
```

### Assign Technician
**POST** `/api/requests/{id}/assign/`

**Request Body:**
```json
{
  "technician": 1
}
```

**Validation:**
- Technician must be a member of the request's assigned team

**Error Response:**
```json
{
  "technician": [
    "Technician must be a member of team \"Electrical Team\""
  ]
}
```

---

## 📅 Calendar Endpoint

### Get Preventive Maintenance Calendar
**GET** `/api/calendar/`

Returns all PREVENTIVE maintenance requests formatted as calendar events.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Quarterly preventive maintenance",
    "start": "2026-01-15T10:00:00Z",
    "end": "2026-01-15T12:00:00Z",
    "equipment": "Industrial Generator",
    "technician": "John Doe",
    "status": "NEW",
    "request_type": "PREVENTIVE"
  }
]
```

**Notes:**
- Only shows `PREVENTIVE` requests
- `end` is calculated as `start + duration`

---

## 🔧 React Integration Examples

### Using Fetch API

```javascript
// Get all equipment
fetch('http://127.0.0.1:8000/api/equipment/')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Create maintenance request
fetch('http://127.0.0.1:8000/api/requests/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'Emergency repair',
    equipment: 1,
    request_type: 'CORRECTIVE',
    scheduled_date: '2025-12-28T14:00:00Z',
    duration: '01:30:00'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Update status
fetch('http://127.0.0.1:8000/api/requests/1/status/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'IN_PROGRESS'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Using Axios

```javascript
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

// Get all equipment
axios.get(`${API_BASE}/equipment/`)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));

// Create maintenance request
axios.post(`${API_BASE}/requests/`, {
  subject: 'Emergency repair',
  equipment: 1,
  request_type: 'CORRECTIVE',
  scheduled_date: '2025-12-28T14:00:00Z',
  duration: '01:30:00'
})
.then(res => console.log(res.data))
.catch(err => console.error(err));

// Update status
axios.post(`${API_BASE}/requests/1/status/`, {
  status: 'IN_PROGRESS'
})
.then(res => console.log(res.data))
.catch(err => console.error(err));
```

### React Component Example

```javascript
import React, { useState, useEffect } from 'react';

function EquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/equipment/')
      .then(res => res.json())
      .then(data => {
        setEquipment(data.results);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Equipment List</h2>
      {equipment.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>Serial: {item.serial_number}</p>
          <p>Location: {item.location}</p>
          <p>Status: {item.is_usable ? '✅ Usable' : '❌ Not Usable'}</p>
        </div>
      ))}
    </div>
  );
}

export default EquipmentList;
```

---

## 🔐 CORS & Authentication

### CORS
- **Status:** ✅ Enabled for all origins (hackathon mode)
- **Production:** Update `CORS_ALLOW_ALL_ORIGINS` in `settings.py` to whitelist specific domains

### Authentication
- **Current:** No authentication required (AllowAny)
- **For Production:** Add JWT or session authentication

---

## 📊 Data Models Reference

### Request Types
- `CORRECTIVE` - Fix broken equipment
- `PREVENTIVE` - Scheduled maintenance

### Request Status
- `NEW` - Just created
- `IN_PROGRESS` - Technician working on it
- `REPAIRED` - Fixed successfully
- `SCRAP` - Equipment beyond repair (auto-marks equipment unusable)

### Duration Format
- String format: `"HH:MM:SS"`
- Examples: `"01:00:00"` (1 hour), `"02:30:00"` (2.5 hours)

### DateTime Format
- ISO 8601 format with timezone
- Example: `"2025-12-27T14:30:00Z"`

---

## 🧪 Testing APIs

### Using Browser
Open these URLs directly:
- http://127.0.0.1:8000/api/
- http://127.0.0.1:8000/api/equipment/
- http://127.0.0.1:8000/api/requests/
- http://127.0.0.1:8000/api/calendar/

### Using Postman
Import the collection: `GearGuard_API_Collection.postman.json`

### Using Python Script
```bash
cd backend
python test_all_endpoints.py
```

---

## 🐛 Common Issues & Solutions

### CORS Error
**Error:** `No 'Access-Control-Allow-Origin' header`
**Solution:** CORS is enabled. Make sure server is running.

### 404 Not Found
**Error:** `404` on endpoint
**Solution:** Verify URL includes `/api/` prefix and trailing slash.

### 400 Bad Request
**Error:** Validation failed
**Solution:** Check request body format and required fields.

### Invalid Status Transition
**Error:** Status transition not allowed
**Solution:** Follow valid workflow: NEW → IN_PROGRESS → REPAIRED → SCRAP

### Technician Not in Team
**Error:** "Technician must be a member of team"
**Solution:** Assign technician who is in the request's team.

---

## 📞 Support

**Backend Status:** ✅ All APIs working
**Server:** Running on http://127.0.0.1:8000/
**Documentation:** This file + `QUICKSTART.md` + `backend/README.md`

Ready for frontend development! 🚀
