# GearGuard Backend → Frontend Integration Report

**Version:** 1.0  
**Date:** December 27, 2025  
**Backend Repository:** odooxadani-hackathon-2026  
**Target Audience:** Frontend Developers

---

## 📋 Table of Contents

1. [Product Overview](#1-product-overview)
2. [Core Entities & Relationships](#2-core-entities--relationships)
3. [API Contract (Endpoint-by-Endpoint)](#3-api-contract-endpoint-by-endpoint)
4. [Business Rules & State Transitions](#4-business-rules--state-transitions)
5. [Validation Rules & Error Responses](#5-validation-rules--error-responses)
6. [Frontend Assumptions](#6-frontend-assumptions)

---

## 1. Product Overview

### 1.1 What Problem Does This System Solve?

**GearGuard** is an internal maintenance management system designed to streamline equipment maintenance operations within an organization. It addresses the following challenges:

- **Equipment Lifecycle Management**: Track all company equipment from purchase through maintenance to end-of-life
- **Preventive vs. Corrective Maintenance**: Distinguish between scheduled preventive maintenance and emergency repairs
- **Work Assignment**: Efficiently assign maintenance tasks to appropriate teams and technicians
- **Status Tracking**: Monitor maintenance requests from creation through completion
- **Calendar Planning**: Visualize and schedule preventive maintenance activities

### 1.2 Who Are the Users?

The system serves three primary user roles:

| Role | Responsibilities | Typical Actions |
|------|-----------------|-----------------|
| **Maintenance Manager** | Oversees all maintenance operations | Create equipment records, create maintenance requests, assign teams |
| **Team Lead** | Manages team members and work assignments | Assign technicians to requests, update team membership |
| **Technician** | Performs actual maintenance work | Update request status, mark equipment as scrapped |

**Note:** The current backend does not enforce role-based permissions - authentication is set to `AllowAny` for development purposes.

### 1.3 Real-World Workflow

**Typical Workflow:**

1. **Equipment Registration**: Manager registers new equipment with default maintenance team
2. **Maintenance Request Creation**: 
   - Preventive: Scheduled routine maintenance created in advance
   - Corrective: Emergency repair request created when equipment breaks
3. **Team Auto-Assignment**: System automatically assigns maintenance request to equipment's default team
4. **Technician Assignment**: Team lead assigns specific technician from the team
5. **Work Execution**: Technician updates status as work progresses (NEW → IN_PROGRESS → REPAIRED)
6. **Equipment Disposition**: If equipment cannot be repaired, status changes to SCRAP and equipment is marked unusable

---

## 2. Core Entities & Relationships

### 2.1 Entity Overview

The system consists of four core entities:

```
User (Django built-in)
  ↓
MaintenanceTeam ←→ Equipment
  ↓                  ↓
MaintenanceRequest
```

### 2.2 Detailed Entity Definitions

#### **Entity: User**

**What it represents:**  
System users who can be technicians, managers, or administrators.

**Source:**  
Django's built-in `User` model (username, first_name, last_name, email)

**Key relationships:**
- Can be a member of multiple MaintenanceTeams
- Can be the default technician for Equipment
- Can be assigned to MaintenanceRequests
- Can create MaintenanceRequests (tracked as `created_by`)

---

#### **Entity: MaintenanceTeam**

**What it represents:**  
A group of technicians with specific expertise (e.g., Electrical Team, HVAC Team, Mechanical Team)

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique identifier (auto-generated) |
| `name` | string | Team name (must be unique) |
| `members` | array[User] | List of technicians in this team |
| `created_at` | datetime | When team was created (auto-set) |
| `updated_at` | datetime | Last modification time (auto-updated) |

**Key relationships:**
- **Has many** Users (team members)
- **Has many** Equipment (as default team)
- **Has many** MaintenanceRequests

**Business meaning:**  
Teams represent organizational units with specific technical expertise. A team's members are the only technicians who can be assigned to maintenance requests for that team.

---

#### **Entity: Equipment**

**What it represents:**  
Physical company assets that require maintenance (generators, HVAC units, machinery, etc.)

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | auto | Unique identifier |
| `name` | string | ✅ | Equipment name |
| `serial_number` | string | ✅ | Unique serial number |
| `department_or_owner` | string | ✅ | Who owns/uses this equipment |
| `location` | string | ✅ | Physical location |
| `purchase_date` | date | ✅ | When equipment was purchased |
| `warranty_end` | date | optional | Warranty expiration date |
| `default_team` | integer (FK) | optional | Team assigned to maintain this equipment |
| `default_technician` | integer (FK) | optional | Primary technician for this equipment |
| `is_usable` | boolean | ✅ | Whether equipment is operational (default: true) |
| `created_at` | datetime | auto | Creation timestamp |
| `updated_at` | datetime | auto | Last update timestamp |

**Key relationships:**
- **Belongs to** one MaintenanceTeam (as default team)
- **Has** one default User (technician)
- **Has many** MaintenanceRequests

**Important behaviors:**
- When a maintenance request for this equipment is set to `SCRAP` status, `is_usable` is automatically set to `false`
- Default team is automatically assigned to new maintenance requests for this equipment

---

#### **Entity: MaintenanceRequest**

**What it represents:**  
A work order for equipment maintenance - either preventive (scheduled) or corrective (repair)

**Fields:**

| Field | Type | Required | Description | Editable? |
|-------|------|----------|-------------|-----------|
| `id` | integer | auto | Unique identifier | ❌ |
| `subject` | string | ✅ | Title/description of work | ✅ |
| `equipment` | integer (FK) | ✅ | Which equipment needs maintenance | ✅ |
| `request_type` | enum | ✅ | `CORRECTIVE` or `PREVENTIVE` | ✅ |
| `team` | integer (FK) | auto | Assigned maintenance team | ⚠️ Auto-set |
| `technician` | integer (FK) | optional | Assigned technician | ✅ |
| `scheduled_date` | datetime | ✅ | When maintenance should occur | ✅ |
| `duration` | duration | ✅ | Expected time (HH:MM:SS format) | ✅ |
| `status` | enum | auto | `NEW`, `IN_PROGRESS`, `REPAIRED`, `SCRAP` | ⚠️ Use `/status/` endpoint |
| `created_by` | integer (FK) | auto | User who created request | ❌ |
| `created_at` | datetime | auto | Creation timestamp | ❌ |
| `updated_at` | datetime | auto | Last update timestamp | ❌ |

**Key relationships:**
- **Belongs to** one Equipment
- **Belongs to** one MaintenanceTeam
- **Assigned to** one User (technician)
- **Created by** one User

**Business meaning:**
- Represents a unit of maintenance work from creation to completion
- Tracks the entire lifecycle: creation → assignment → execution → completion
- Status changes enforce a strict workflow (see Section 4)

---

### 2.3 Relationship Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├─ member_of ────────► ┌──────────────────┐
     │                      │ MaintenanceTeam  │
     │                      └────────┬─────────┘
     │                               │
     │                               │ default_team
     │                               ▼
     ├─ default_tech ──────► ┌──────────────┐
     │                        │  Equipment   │
     │                        └──────┬───────┘
     │                               │
     │                               │ equipment
     │                               ▼
     ├─ assigned_to ────────► ┌────────────────────┐
     │                         │ MaintenanceRequest │
     └─ created_by ───────────┤                    │
                               └────────────────────┘
                                        │
                                        │ team
                                        ▼
                               ┌──────────────────┐
                               │ MaintenanceTeam  │
                               └──────────────────┘
```

---

## 3. API Contract (Endpoint-by-Endpoint)

**Base URL:** `http://127.0.0.1:8000/api/`

**Important:** All endpoints require trailing slash `/`

---

### 3.1 Equipment Endpoints

#### **GET /api/equipment/**

**Purpose:** Retrieve list of all equipment with pagination

**Request:**
- Method: `GET`
- Headers: None required
- Query Parameters:
  - `page` (optional): Page number (default: 1)
  - `page_size` (optional): Items per page (default: 50)

**Response (200 OK):**
```json
{
  "count": 100,
  "next": "http://127.0.0.1:8000/api/equipment/?page=2",
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
      "default_technician": 2,
      "default_technician_name": "John Doe",
      "is_usable": true,
      "created_at": "2025-12-27T10:00:00Z",
      "updated_at": "2025-12-27T10:00:00Z"
    }
  ]
}
```

**Frontend Notes:**
- `default_team_name` and `default_technician_name` are read-only display fields
- Use `default_team` and `default_technician` IDs when creating/updating

---

#### **POST /api/equipment/**

**Purpose:** Create new equipment record

**Request:**
```json
{
  "name": "HVAC Unit #5",
  "serial_number": "HVAC-2025-005",
  "department_or_owner": "Building Operations",
  "location": "Building B - Roof",
  "purchase_date": "2025-12-01",
  "warranty_end": "2028-12-01",
  "default_team": 2,
  "default_technician": 5,
  "is_usable": true
}
```

**Required Fields:**
- `name`
- `serial_number` (must be unique)
- `department_or_owner`
- `location`
- `purchase_date`

**Optional Fields:**
- `warranty_end`
- `default_team`
- `default_technician`
- `is_usable` (defaults to `true`)

**Response (201 Created):**
```json
{
  "id": 15,
  "name": "HVAC Unit #5",
  "serial_number": "HVAC-2025-005",
  ...
}
```

**Backend Behavior:**
- Auto-generates `id`
- Auto-sets `created_at` and `updated_at`
- New maintenance requests for this equipment will auto-assign to `default_team`

**Side Effects:**
- None

---

#### **GET /api/equipment/{id}/**

**Purpose:** Retrieve single equipment details

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Industrial Generator",
  ...
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Not found."
}
```

---

#### **PUT /api/equipment/{id}/**

**Purpose:** Fully update equipment (all fields required)

**Request:**
```json
{
  "name": "Industrial Generator (Updated)",
  "serial_number": "GEN-2025-001",
  "department_or_owner": "Facilities Department",
  "location": "Building A - Basement Level 2",
  "purchase_date": "2024-01-15",
  "warranty_end": "2027-01-15",
  "default_team": 1,
  "default_technician": 2,
  "is_usable": true
}
```

---

#### **PATCH /api/equipment/{id}/**

**Purpose:** Partially update equipment (only changed fields)

**Request:**
```json
{
  "location": "Building A - Basement Level 2",
  "is_usable": false
}
```

**Frontend Use Case:**
- Use PATCH when updating only specific fields (e.g., changing location)
- Use PUT for full record replacement

---

#### **DELETE /api/equipment/{id}/**

**Purpose:** Delete equipment record

**Response (204 No Content):**
- Empty response body

**⚠️ Warning:**
- This will cascade delete all associated maintenance requests
- Frontend should show confirmation dialog

---

#### **GET /api/equipment/{id}/requests/**

**Purpose:** Get all maintenance requests for specific equipment

**Response (200 OK):**
```json
[
  {
    "id": 5,
    "subject": "Quarterly preventive check",
    "equipment": 1,
    "equipment_name": "Industrial Generator",
    "request_type": "PREVENTIVE",
    "status": "NEW",
    ...
  },
  {
    "id": 12,
    "subject": "Emergency repair - overheating",
    "equipment": 1,
    "equipment_name": "Industrial Generator",
    "request_type": "CORRECTIVE",
    "status": "REPAIRED",
    ...
  }
]
```

**Frontend Use Case:**
- Display maintenance history for specific equipment
- No pagination on this endpoint (returns all)

---

### 3.2 Maintenance Team Endpoints

#### **GET /api/teams/**

**Purpose:** Retrieve list of all maintenance teams

**Response (200 OK):**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Electrical Team",
      "members": [
        {
          "id": 2,
          "username": "john_tech",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@company.com"
        },
        {
          "id": 3,
          "username": "jane_tech",
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane@company.com"
        }
      ],
      "created_at": "2025-01-10T08:00:00Z",
      "updated_at": "2025-12-15T14:30:00Z"
    }
  ]
}
```

**Frontend Notes:**
- `members` array contains full user objects (read-only)
- Use `member_ids` array when creating/updating teams

---

#### **POST /api/teams/**

**Purpose:** Create new maintenance team

**Request:**
```json
{
  "name": "HVAC Specialists",
  "member_ids": [4, 5, 6]
}
```

**Required Fields:**
- `name` (must be unique)

**Optional Fields:**
- `member_ids` (array of user IDs)

**Response (201 Created):**
```json
{
  "id": 6,
  "name": "HVAC Specialists",
  "members": [
    {
      "id": 4,
      "username": "tech4",
      "first_name": "Mike",
      "last_name": "Johnson",
      "email": "mike@company.com"
    }
  ],
  "created_at": "2025-12-27T15:00:00Z",
  "updated_at": "2025-12-27T15:00:00Z"
}
```

---

#### **GET /api/teams/{id}/**

**Purpose:** Retrieve single team details

---

#### **PUT/PATCH /api/teams/{id}/**

**Purpose:** Update team

**Request (PATCH):**
```json
{
  "member_ids": [4, 5, 6, 7]
}
```

**Frontend Use Case:**
- Add/remove team members by sending updated `member_ids` array

---

#### **DELETE /api/teams/{id}/**

**Purpose:** Delete team

**⚠️ Warning:**
- Equipment with this as `default_team` will have team set to `null`
- Maintenance requests with this team will have team set to `null`

---

### 3.3 Maintenance Request Endpoints

#### **GET /api/requests/**

**Purpose:** Retrieve list of all maintenance requests

**Response (200 OK):**
```json
{
  "count": 250,
  "next": "http://127.0.0.1:8000/api/requests/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "subject": "Quarterly preventive maintenance",
      "equipment": 1,
      "equipment_name": "Industrial Generator",
      "request_type": "PREVENTIVE",
      "team": 1,
      "team_name": "Electrical Team",
      "technician": 2,
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

**Frontend Notes:**
- Display fields: `equipment_name`, `team_name`, `technician_name`, `created_by_name`
- ID fields: `equipment`, `team`, `technician`, `created_by` (use for editing)

---

#### **POST /api/requests/**

**Purpose:** Create new maintenance request

**Request:**
```json
{
  "subject": "Generator making unusual noise",
  "equipment": 1,
  "request_type": "CORRECTIVE",
  "scheduled_date": "2025-12-30T09:00:00Z",
  "duration": "03:00:00",
  "technician": 2
}
```

**Required Fields:**
- `subject`
- `equipment` (equipment ID)
- `request_type` (`"CORRECTIVE"` or `"PREVENTIVE"`)
- `scheduled_date` (ISO 8601 datetime with timezone)
- `duration` (format: `"HH:MM:SS"`)

**Optional Fields:**
- `technician` (user ID)
- `team` (team ID - usually auto-assigned)

**Response (201 Created):**
```json
{
  "id": 55,
  "subject": "Generator making unusual noise",
  "equipment": 1,
  "equipment_name": "Industrial Generator",
  "request_type": "CORRECTIVE",
  "team": 1,
  "team_name": "Electrical Team",
  "technician": 2,
  "technician_name": "John Doe",
  "scheduled_date": "2025-12-30T09:00:00Z",
  "duration": "03:00:00",
  "status": "NEW",
  "created_by": 8,
  "created_by_name": "Current User",
  "created_at": "2025-12-27T16:45:00Z",
  "updated_at": "2025-12-27T16:45:00Z"
}
```

**⚠️ Backend Behaviors (Auto-effects):**

1. **Team Auto-Assignment:**
   - If `team` is not provided, backend automatically assigns `equipment.default_team`
   - Frontend can omit `team` field when creating requests

2. **Status Initialization:**
   - Always starts as `"NEW"`

3. **Created By:**
   - If user is authenticated, `created_by` is auto-set to current user
   - Frontend should NOT send `created_by` in request

4. **Technician Validation:**
   - If `technician` is provided, they MUST be a member of `team`
   - If validation fails, returns 400 error (see Section 5.3)

---

#### **GET /api/requests/{id}/**

**Purpose:** Retrieve single request details

---

#### **PUT/PATCH /api/requests/{id}/**

**Purpose:** Update maintenance request

**⚠️ Important:** DO NOT use this endpoint to update `status`  
Use `POST /api/requests/{id}/status/` instead

**Request (PATCH):**
```json
{
  "subject": "Updated subject",
  "scheduled_date": "2025-12-31T10:00:00Z"
}
```

**Frontend Use Case:**
- Update subject, scheduled date, duration
- DO NOT update status here (use dedicated endpoint)

---

#### **DELETE /api/requests/{id}/**

**Purpose:** Delete maintenance request

---

### 3.4 Special Request Actions

#### **POST /api/requests/{id}/status/**

**Purpose:** Update request status with workflow validation

**Request:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Allowed Values:**
- `"NEW"`
- `"IN_PROGRESS"`
- `"REPAIRED"`
- `"SCRAP"`

**Response (200 OK):**
```json
{
  "id": 55,
  "subject": "Generator making unusual noise",
  "status": "IN_PROGRESS",
  ...
}
```

**⚠️ Backend Behavior:**

1. **Validates Status Transition** (see Section 4.1)
2. **Auto-Effect on SCRAP:**
   - If status changes to `"SCRAP"`, the associated equipment's `is_usable` is automatically set to `false`
   - This happens in the background - frontend doesn't need to do anything

**Error Response (400 Bad Request):**
```json
{
  "status": [
    "Invalid status transition from NEW to SCRAP. Allowed transitions: IN_PROGRESS"
  ]
}
```

**Frontend Implementation:**
```javascript
// ❌ WRONG - Don't update status via PATCH
fetch(`/api/requests/55/`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'IN_PROGRESS' })
});

// ✅ CORRECT - Use dedicated status endpoint
fetch(`/api/requests/55/status/`, {
  method: 'POST',
  body: JSON.stringify({ status: 'IN_PROGRESS' })
});
```

---

#### **POST /api/requests/{id}/assign/**

**Purpose:** Assign technician to maintenance request

**Request:**
```json
{
  "technician": 3
}
```

**Required Fields:**
- `technician` (user ID)

**Response (200 OK):**
```json
{
  "id": 55,
  "subject": "Generator making unusual noise",
  "technician": 3,
  "technician_name": "Jane Smith",
  ...
}
```

**⚠️ Backend Validation:**
- Technician MUST be a member of the request's assigned team
- If not, returns 400 error

**Error Response (400 Bad Request):**
```json
{
  "technician": [
    "Technician must be a member of team \"Electrical Team\""
  ]
}
```

**Frontend Use Case:**
- When request has a team, show dropdown of only that team's members
- Validate on frontend before submitting to prevent errors

---

### 3.5 Calendar Endpoint

#### **GET /api/calendar/**

**Purpose:** Get all preventive maintenance requests formatted as calendar events

**Response (200 OK):**
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
  },
  {
    "id": 8,
    "title": "HVAC filter replacement",
    "start": "2026-01-20T14:00:00Z",
    "end": "2026-01-20T15:30:00Z",
    "equipment": "HVAC Unit #3",
    "technician": "Unassigned",
    "status": "NEW",
    "request_type": "PREVENTIVE"
  }
]
```

**Backend Behavior:**
- Filters for `request_type == "PREVENTIVE"` only
- `end` is calculated as `scheduled_date + duration`
- `technician` displays "Unassigned" if no technician assigned
- Returns array (not paginated)

**Frontend Use Case:**
- Display in calendar component (FullCalendar, react-big-calendar, etc.)
- `start` and `end` are ready for direct use
- Click event to view/edit full maintenance request

---

## 4. Business Rules & State Transitions

### 4.1 Maintenance Request Status Workflow

**Valid Status Transitions:**

```
NEW
 ↓
IN_PROGRESS
 ↓
 ├─→ REPAIRED
 │    ↓
 └────→ SCRAP
```

**Transition Rules:**

| Current Status | Can Transition To | Cannot Transition To |
|---------------|-------------------|---------------------|
| `NEW` | `IN_PROGRESS` | `REPAIRED`, `SCRAP` |
| `IN_PROGRESS` | `REPAIRED`, `SCRAP` | `NEW` |
| `REPAIRED` | `SCRAP` | `NEW`, `IN_PROGRESS` |
| `SCRAP` | (none - final state) | Any |

**Frontend Implementation Guidelines:**

1. **Status Button Visibility:**
   ```javascript
   // Show "Start Work" button only if status === "NEW"
   {status === "NEW" && <Button onClick={() => updateStatus("IN_PROGRESS")}>Start Work</Button>}
   
   // Show "Mark Repaired" and "Mark Scrap" only if status === "IN_PROGRESS"
   {status === "IN_PROGRESS" && (
     <>
       <Button onClick={() => updateStatus("REPAIRED")}>Mark Repaired</Button>
       <Button onClick={() => updateStatus("SCRAP")}>Mark Scrap</Button>
     </>
   )}
   
   // Show "Mark Scrap" only if status === "REPAIRED"
   {status === "REPAIRED" && <Button onClick={() => updateStatus("SCRAP")}>Mark Scrap</Button>}
   
   // Show nothing if status === "SCRAP" (final state)
   ```

2. **Status Dropdown Filtering:**
   ```javascript
   const getAllowedStatuses = (currentStatus) => {
     const transitions = {
       'NEW': ['IN_PROGRESS'],
       'IN_PROGRESS': ['REPAIRED', 'SCRAP'],
       'REPAIRED': ['SCRAP'],
       'SCRAP': []
     };
     return transitions[currentStatus] || [];
   };
   ```

**⚠️ Important:**
- Backend enforces these rules
- If frontend sends invalid transition, backend returns 400 error
- Frontend should prevent invalid transitions in UI for better UX

---

### 4.2 Team Auto-Assignment

**Rule:**
When creating a maintenance request, if `team` is not provided, backend automatically assigns the equipment's `default_team`.

**Scenario:**
```javascript
// Equipment #1 has default_team = Electrical Team (ID: 1)

// Frontend creates request WITHOUT team
POST /api/requests/
{
  "subject": "Repair needed",
  "equipment": 1,
  ...
  // No "team" field
}

// Backend response INCLUDES auto-assigned team
{
  "id": 99,
  "team": 1,
  "team_name": "Electrical Team",
  ...
}
```

**Frontend Implementation:**
- Can omit `team` field when creating requests
- Backend handles assignment automatically
- Response will include assigned team

**Override Option:**
- Frontend CAN explicitly set `team` to override default
- Use case: Equipment needs maintenance from a different team

---

### 4.3 Equipment Usability Auto-Update

**Rule:**
When maintenance request status changes to `SCRAP`, the associated equipment's `is_usable` field is automatically set to `false`.

**Scenario:**
```javascript
// Equipment #5 currently has is_usable = true

// Technician marks request as SCRAP
POST /api/requests/42/status/
{
  "status": "SCRAP"
}

// Backend automatically:
// 1. Updates request status to SCRAP
// 2. Sets equipment #5's is_usable = false
```

**Frontend Implementation:**
- No action needed - backend handles automatically
- After marking as SCRAP, refresh equipment details to show updated `is_usable`
- Consider showing warning: "Marking this as SCRAP will mark equipment as unusable"

---

### 4.4 Technician Team Membership Validation

**Rule:**
A technician can only be assigned to a maintenance request if they are a member of the request's assigned team.

**Validation Points:**
1. When creating request with technician
2. When updating request's technician
3. When using `/assign/` endpoint

**Scenario:**
```javascript
// Request #55 is assigned to "Electrical Team" (ID: 1)
// Electrical Team members: [User 2, User 3, User 4]

// ❌ INVALID - User 7 is not in Electrical Team
POST /api/requests/55/assign/
{
  "technician": 7
}

// Response: 400 Bad Request
{
  "technician": [
    "Technician must be a member of team \"Electrical Team\""
  ]
}

// ✅ VALID - User 3 is in Electrical Team
POST /api/requests/55/assign/
{
  "technician": 3
}
```

**Frontend Implementation:**
```javascript
// Get request's team members
const request = await fetch(`/api/requests/55/`).then(r => r.json());
const team = await fetch(`/api/teams/${request.team}/`).then(r => r.json());

// Show dropdown with only team members
<select>
  {team.members.map(member => (
    <option value={member.id}>
      {member.first_name} {member.last_name}
    </option>
  ))}
</select>
```

---

### 4.5 Request Type Meanings

| Type | Code | Purpose | Typical Scheduling |
|------|------|---------|-------------------|
| **Preventive** | `PREVENTIVE` | Scheduled routine maintenance to prevent failures | Regular intervals (monthly, quarterly) |
| **Corrective** | `CORRECTIVE` | Emergency repair of broken equipment | As soon as possible |

**Business Differences:**

**Preventive Maintenance:**
- Scheduled in advance
- Appears on calendar view (`/api/calendar/`)
- Equipment is typically still functional
- Goal: Prevent future breakdowns

**Corrective Maintenance:**
- Created in response to equipment failure
- Urgent priority
- Equipment may be unusable (`is_usable = false`)
- Goal: Restore functionality

**Frontend UI Suggestions:**
- Use different colors: Green for PREVENTIVE, Red for CORRECTIVE
- Filter by type on request list
- Show PREVENTIVE on calendar, CORRECTIVE in urgent task list

---

## 5. Validation Rules & Error Responses

### 5.1 Common Error Format

All validation errors follow this structure:

```json
{
  "field_name": [
    "Error message 1",
    "Error message 2"
  ]
}
```

**Multiple Field Errors:**
```json
{
  "serial_number": [
    "equipment with this serial number already exists."
  ],
  "purchase_date": [
    "Date has wrong format. Use one of these formats instead: YYYY-MM-DD."
  ]
}
```

---

### 5.2 Equipment Validation Errors

#### **Serial Number Already Exists**

**Error:**
```json
{
  "serial_number": [
    "equipment with this serial number already exists."
  ]
}
```

**When it occurs:**
- Creating equipment with duplicate serial number
- Updating equipment to use another equipment's serial number

**Frontend handling:**
- Show inline error on serial number field
- Suggest checking existing equipment

---

#### **Invalid Date Format**

**Error:**
```json
{
  "purchase_date": [
    "Date has wrong format. Use one of these formats instead: YYYY-MM-DD."
  ]
}
```

**Expected format:** `YYYY-MM-DD` (e.g., `"2025-12-27"`)

**Frontend implementation:**
```javascript
// ✅ CORRECT
{
  "purchase_date": "2025-12-27"
}

// ❌ WRONG
{
  "purchase_date": "12/27/2025"  // American format
}
{
  "purchase_date": "27-12-2025"  // European format
}
```

---

### 5.3 Maintenance Request Validation Errors

#### **Technician Not in Team**

**Error:**
```json
{
  "technician": [
    "Technician must be a member of team \"Electrical Team\""
  ]
}
```

**When it occurs:**
- Creating/updating request with technician who isn't in assigned team
- Using `/assign/` endpoint with invalid technician

**Frontend prevention:**
```javascript
// Load team members before showing technician dropdown
const team = await fetch(`/api/teams/${request.team}/`).then(r => r.json());

// Only show team members in dropdown
const validTechnicians = team.members;
```

---

#### **Invalid Status Transition**

**Error:**
```json
{
  "status": [
    "Invalid status transition from NEW to SCRAP. Allowed transitions: IN_PROGRESS"
  ]
}
```

**When it occurs:**
- Attempting to skip status steps (e.g., NEW → SCRAP)
- Attempting to reverse status (e.g., REPAIRED → IN_PROGRESS)

**Frontend prevention:**
- Only show valid next status options (see Section 4.1)
- Disable invalid status buttons

---

#### **Invalid Duration Format**

**Error:**
```json
{
  "duration": [
    "Duration has wrong format. Use HH:MM:SS format."
  ]
}
```

**Expected format:** `HH:MM:SS`

**Examples:**
```javascript
// ✅ CORRECT
"01:00:00"  // 1 hour
"02:30:00"  // 2 hours 30 minutes
"00:15:00"  // 15 minutes
"10:45:30"  // 10 hours 45 minutes 30 seconds

// ❌ WRONG
"1:00:00"     // Missing leading zero
"90"          // Just minutes
"1.5 hours"   // Text format
```

**Frontend implementation:**
```javascript
// Convert hours/minutes to HH:MM:SS
const formatDuration = (hours, minutes) => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

formatDuration(2, 30);  // "02:30:00"
```

---

#### **Invalid DateTime Format**

**Error:**
```json
{
  "scheduled_date": [
    "Datetime has wrong format. Use one of these formats instead: YYYY-MM-DDTHH:MM[:ss[.uuuuuu]][+HH:MM|-HH:MM|Z]."
  ]
}
```

**Expected format:** ISO 8601 with timezone

**Examples:**
```javascript
// ✅ CORRECT
"2025-12-27T14:30:00Z"           // UTC
"2025-12-27T14:30:00+05:30"      // India (UTC+5:30)
"2025-12-27T14:30:00-05:00"      // Eastern Time (UTC-5)

// ❌ WRONG
"2025-12-27 14:30:00"   // Missing 'T' separator
"12/27/2025 2:30 PM"    // Not ISO format
"2025-12-27"            // Missing time
```

**Frontend implementation:**
```javascript
// JavaScript Date to ISO string
const date = new Date('2025-12-27T14:30:00');
const isoString = date.toISOString();  // "2025-12-27T14:30:00.000Z"

// HTML datetime-local input
<input
  type="datetime-local"
  onChange={(e) => {
    const localDate = new Date(e.target.value);
    const isoDate = localDate.toISOString();
    // Send isoDate to backend
  }}
/>
```

---

#### **Missing Required Fields**

**Error:**
```json
{
  "subject": [
    "This field is required."
  ],
  "equipment": [
    "This field is required."
  ]
}
```

**When it occurs:**
- Omitting required fields when creating request

**Required fields for POST /api/requests/:**
- `subject`
- `equipment`
- `request_type`
- `scheduled_date`
- `duration`

---

### 5.4 Team Validation Errors

#### **Duplicate Team Name**

**Error:**
```json
{
  "name": [
    "maintenance team with this name already exists."
  ]
}
```

**When it occurs:**
- Creating team with existing name
- Renaming team to match another team's name

---

### 5.5 HTTP Error Codes Reference

| Status Code | Meaning | When It Occurs |
|------------|---------|----------------|
| **200 OK** | Success | GET, PUT, PATCH successful |
| **201 Created** | Resource created | POST successful |
| **204 No Content** | Success, no body | DELETE successful |
| **400 Bad Request** | Validation failed | Invalid data, business rule violation |
| **404 Not Found** | Resource doesn't exist | Invalid ID in URL |
| **500 Internal Server Error** | Backend error | Unexpected backend issue |

**Frontend Error Handling:**
```javascript
const handleApiError = async (response) => {
  if (response.status === 400) {
    const errors = await response.json();
    // Show validation errors to user
    Object.entries(errors).forEach(([field, messages]) => {
      showError(field, messages.join(', '));
    });
  } else if (response.status === 404) {
    showError('general', 'Record not found');
  } else if (response.status === 500) {
    showError('general', 'Server error. Please try again later.');
  }
};
```

---

## 6. Frontend Assumptions

### 6.1 Authentication & Authorization

**Current State:**
- ✅ **No authentication required**
- All endpoints use `AllowAny` permission
- No login/logout needed

**User Tracking:**
- `created_by` field is auto-set if user is authenticated
- Since auth is disabled, this may be `null`

**For Production:**
- Backend needs to implement JWT or session authentication
- Frontend will need login flow
- Add role-based permissions (Admin, Manager, Technician)

**Frontend Implementation (Current):**
```javascript
// No auth headers needed
fetch('/api/equipment/', {
  method: 'GET'
  // No Authorization header required
});
```

---

### 6.2 Pagination

**Enabled on:**
- `GET /api/equipment/`
- `GET /api/teams/`
- `GET /api/requests/`

**Not paginated:**
- `GET /api/calendar/`
- `GET /api/equipment/{id}/requests/`

**Pagination Format:**
```json
{
  "count": 250,
  "next": "http://127.0.0.1:8000/api/requests/?page=3",
  "previous": "http://127.0.0.1:8000/api/requests/?page=1",
  "results": [...]
}
```

**Parameters:**
- `?page=2` - Get page 2
- `?page_size=20` - Change items per page (default: 50)

**Frontend Implementation:**
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [pageSize] = useState(50);

const fetchRequests = async () => {
  const response = await fetch(
    `/api/requests/?page=${currentPage}&page_size=${pageSize}`
  );
  const data = await response.json();
  
  return {
    items: data.results,
    total: data.count,
    hasNext: !!data.next,
    hasPrevious: !!data.previous
  };
};
```

---

### 6.3 CORS Configuration

**Current State:**
- ✅ **CORS enabled for all origins**
- `CORS_ALLOW_ALL_ORIGINS = True` in settings

**Frontend Impact:**
- Can call API from any domain
- No CORS errors during development

**For Production:**
- Update backend settings to whitelist specific frontend domain
- Example: `CORS_ALLOWED_ORIGINS = ['https://gearguard-frontend.com']`

**Frontend Development:**
```javascript
// Works from any origin (localhost:3000, localhost:5173, etc.)
fetch('http://127.0.0.1:8000/api/equipment/')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

### 6.4 Date & Time Formats

**Summary Table:**

| Field Type | Format | Example | Usage |
|-----------|--------|---------|-------|
| **Date** | `YYYY-MM-DD` | `"2025-12-27"` | `purchase_date`, `warranty_end` |
| **DateTime** | ISO 8601 with timezone | `"2025-12-27T14:30:00Z"` | `scheduled_date`, `created_at` |
| **Duration** | `HH:MM:SS` | `"02:30:00"` | `duration` |

**JavaScript Helpers:**
```javascript
// Date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Date to ISO 8601
const formatDateTime = (date) => {
  return date.toISOString();
};

// Hours/Minutes to HH:MM:SS
const formatDuration = (hours, minutes) => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

// Example usage
const now = new Date();
console.log(formatDate(now));       // "2025-12-27"
console.log(formatDateTime(now));   // "2025-12-27T14:30:00.000Z"
console.log(formatDuration(2, 30)); // "02:30:00"
```

---

### 6.5 Timezone Handling

**Backend:**
- Uses UTC timezone (`TIME_ZONE = 'UTC'` in settings)
- All datetime fields stored and returned in UTC

**Frontend Responsibility:**
- Backend sends UTC times
- Frontend must convert to user's local timezone for display
- Convert back to UTC when sending to backend

**Implementation:**
```javascript
// Display UTC time in user's local timezone
const displayLocalTime = (utcString) => {
  const date = new Date(utcString);
  return date.toLocaleString();  // Automatically converts to local time
};

// Input: User selects local time, convert to UTC for backend
const inputElement = document.querySelector('input[type="datetime-local"]');
const localDate = new Date(inputElement.value);
const utcForBackend = localDate.toISOString();

// Example
displayLocalTime("2025-12-27T14:30:00Z");
// Output (EST): "12/27/2025, 9:30:00 AM"
// Output (IST): "12/27/2025, 8:00:00 PM"
```

---

### 6.6 Field Editability Reference

**Read-Only Fields (Never Editable):**
- `id` - Auto-generated
- `created_at` - Auto-set on creation
- `updated_at` - Auto-updated on save
- `created_by` - Auto-set to current user
- Display fields: `equipment_name`, `team_name`, `technician_name`, etc.

**Auto-Calculated Fields:**
- `team` (on request creation) - Auto-assigned from equipment's default team
- `is_usable` (on equipment) - Auto-set to `false` when request status = SCRAP

**Frontend Form Guidelines:**
```javascript
// ✅ Include in form
<input name="name" />
<input name="serial_number" />
<input name="location" />

// ❌ Don't include in form (read-only)
<input name="id" disabled />  // Remove entirely
<input name="created_at" disabled />  // Remove entirely

// ⚠️ Display only (use related object's ID for editing)
<div>Equipment: {request.equipment_name}</div>
<input type="hidden" name="equipment" value={request.equipment} />
```

---

### 6.7 API Base URL Configuration

**Development:**
```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

**Production:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.gearguard.com/api';
```

**Best Practice:**
```javascript
// Create API utility
// src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const apiGet = (endpoint) => {
  return fetch(`${API_BASE_URL}${endpoint}`).then(r => r.json());
};

export const apiPost = (endpoint, data) => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());
};

// Usage
import { apiGet, apiPost } from './utils/api';

const equipment = await apiGet('/equipment/');
const newRequest = await apiPost('/requests/', requestData);
```

---

### 6.8 Trailing Slash Requirement

**⚠️ CRITICAL:** All API endpoints require trailing slash `/`

```javascript
// ✅ CORRECT
GET /api/equipment/
GET /api/requests/5/
POST /api/requests/5/status/

// ❌ WRONG - Will return 404
GET /api/equipment
GET /api/requests/5
POST /api/requests/5/status
```

**Django Behavior:**
- Django redirects URLs without trailing slash
- But POST/PUT/PATCH requests lose body data in redirect
- Always include trailing slash to avoid issues

**Frontend Implementation:**
```javascript
// Helper function to ensure trailing slash
const ensureTrailingSlash = (url) => {
  return url.endsWith('/') ? url : `${url}/`;
};

// Usage
const fetchData = (endpoint) => {
  const url = ensureTrailingSlash(endpoint);
  return fetch(`${API_BASE_URL}${url}`);
};

fetchData('/equipment');  // Becomes '/equipment/'
```

---

## 7. Quick Reference

### 7.1 Complete Endpoint List

```
Equipment:
  GET    /api/equipment/                 - List all equipment
  POST   /api/equipment/                 - Create equipment
  GET    /api/equipment/{id}/            - Get equipment details
  PUT    /api/equipment/{id}/            - Update equipment (full)
  PATCH  /api/equipment/{id}/            - Update equipment (partial)
  DELETE /api/equipment/{id}/            - Delete equipment
  GET    /api/equipment/{id}/requests/   - Get equipment's requests

Teams:
  GET    /api/teams/                     - List all teams
  POST   /api/teams/                     - Create team
  GET    /api/teams/{id}/                - Get team details
  PUT    /api/teams/{id}/                - Update team (full)
  PATCH  /api/teams/{id}/                - Update team (partial)
  DELETE /api/teams/{id}/                - Delete team

Maintenance Requests:
  GET    /api/requests/                  - List all requests
  POST   /api/requests/                  - Create request
  GET    /api/requests/{id}/             - Get request details
  PUT    /api/requests/{id}/             - Update request (full)
  PATCH  /api/requests/{id}/             - Update request (partial)
  DELETE /api/requests/{id}/             - Delete request
  POST   /api/requests/{id}/status/      - Update status (validated)
  POST   /api/requests/{id}/assign/      - Assign technician (validated)

Calendar:
  GET    /api/calendar/                  - Get preventive maintenance calendar
```

---

### 7.2 Entity Field Reference

**Equipment:**
```javascript
{
  id: number,                    // Read-only
  name: string,                  // Required
  serial_number: string,         // Required, unique
  department_or_owner: string,   // Required
  location: string,              // Required
  purchase_date: "YYYY-MM-DD",   // Required
  warranty_end: "YYYY-MM-DD",    // Optional
  default_team: number,          // Optional (team ID)
  default_team_name: string,     // Read-only
  default_technician: number,    // Optional (user ID)
  default_technician_name: string, // Read-only
  is_usable: boolean,            // Default: true, auto-updated
  created_at: "ISO 8601",        // Read-only
  updated_at: "ISO 8601"         // Read-only
}
```

**MaintenanceTeam:**
```javascript
{
  id: number,                    // Read-only
  name: string,                  // Required, unique
  members: [User],               // Read-only (full objects)
  member_ids: [number],          // Write-only (user IDs)
  created_at: "ISO 8601",        // Read-only
  updated_at: "ISO 8601"         // Read-only
}
```

**MaintenanceRequest:**
```javascript
{
  id: number,                           // Read-only
  subject: string,                      // Required
  equipment: number,                    // Required (equipment ID)
  equipment_name: string,               // Read-only
  request_type: "CORRECTIVE|PREVENTIVE", // Required
  team: number,                         // Auto-assigned (team ID)
  team_name: string,                    // Read-only
  technician: number,                   // Optional (user ID)
  technician_name: string,              // Read-only
  scheduled_date: "ISO 8601",           // Required
  duration: "HH:MM:SS",                 // Required
  status: "NEW|IN_PROGRESS|REPAIRED|SCRAP", // Auto-set, use /status/ to update
  created_by: number,                   // Auto-set (user ID)
  created_by_name: string,              // Read-only
  created_at: "ISO 8601",               // Read-only
  updated_at: "ISO 8601"                // Read-only
}
```

---

### 7.3 Status Transition Cheatsheet

```
NEW          → IN_PROGRESS    ✅
NEW          → REPAIRED        ❌
NEW          → SCRAP           ❌

IN_PROGRESS  → REPAIRED        ✅
IN_PROGRESS  → SCRAP           ✅
IN_PROGRESS  → NEW             ❌

REPAIRED     → SCRAP           ✅
REPAIRED     → IN_PROGRESS     ❌
REPAIRED     → NEW             ❌

SCRAP        → (any)           ❌ (final state)
```

---

### 7.4 Common Validation Rules

| Field | Rule | Error if Violated |
|-------|------|-------------------|
| `serial_number` | Unique across all equipment | "equipment with this serial number already exists." |
| `team.name` | Unique across all teams | "maintenance team with this name already exists." |
| `request.technician` | Must be member of request.team | "Technician must be a member of team \"[name]\"" |
| `request.status` | Must follow transition workflow | "Invalid status transition from [old] to [new]." |
| `purchase_date` | Format: YYYY-MM-DD | "Date has wrong format." |
| `scheduled_date` | Format: ISO 8601 with timezone | "Datetime has wrong format." |
| `duration` | Format: HH:MM:SS | "Duration has wrong format." |

---

## 8. Frontend Development Checklist

### 8.1 Essential Features to Implement

**Equipment Management:**
- [ ] List all equipment with pagination
- [ ] Create new equipment
- [ ] View equipment details
- [ ] Edit equipment (name, location, team assignment)
- [ ] Delete equipment (with confirmation)
- [ ] View equipment's maintenance history
- [ ] Visual indicator for unusable equipment (`is_usable = false`)

**Team Management:**
- [ ] List all teams
- [ ] Create new team with members
- [ ] View team details
- [ ] Add/remove team members
- [ ] Delete team (with warning about affected equipment/requests)

**Maintenance Request Management:**
- [ ] List all requests with filters (status, type, equipment)
- [ ] Create new request (corrective or preventive)
- [ ] View request details
- [ ] Edit request (subject, scheduled date, duration)
- [ ] Update request status with workflow validation
- [ ] Assign technician from team members
- [ ] Delete request (with confirmation)

**Calendar View:**
- [ ] Display all preventive maintenance on calendar
- [ ] Click event to view/edit request
- [ ] Filter by status, technician, equipment
- [ ] Drag-and-drop to reschedule (updates `scheduled_date`)

**UI/UX Enhancements:**
- [ ] Status badges with colors (NEW: blue, IN_PROGRESS: yellow, REPAIRED: green, SCRAP: red)
- [ ] Request type badges (CORRECTIVE: red, PREVENTIVE: green)
- [ ] Technician dropdown filtered by team members
- [ ] Date/time pickers with local timezone display
- [ ] Form validation before submission
- [ ] Error message display for API errors
- [ ] Loading states for API calls
- [ ] Confirmation dialogs for destructive actions

---

### 8.2 Recommended Libraries

**HTTP Client:**
- Axios or native fetch

**State Management:**
- React Query (for API caching) or Redux Toolkit

**Form Handling:**
- React Hook Form or Formik

**Date Handling:**
- date-fns or Day.js

**Calendar Component:**
- FullCalendar or react-big-calendar

**UI Framework:**
- Material-UI, Ant Design, or Chakra UI

**Notifications:**
- react-toastify or Notistack

---

### 8.3 Sample API Service (React)

```javascript
// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Equipment
export const getEquipment = (page = 1) => 
  API.get(`/equipment/?page=${page}`);

export const getEquipmentById = (id) => 
  API.get(`/equipment/${id}/`);

export const createEquipment = (data) => 
  API.post('/equipment/', data);

export const updateEquipment = (id, data) => 
  API.patch(`/equipment/${id}/`, data);

export const deleteEquipment = (id) => 
  API.delete(`/equipment/${id}/`);

export const getEquipmentRequests = (id) => 
  API.get(`/equipment/${id}/requests/`);

// Teams
export const getTeams = () => 
  API.get('/teams/');

export const getTeamById = (id) => 
  API.get(`/teams/${id}/`);

export const createTeam = (data) => 
  API.post('/teams/', data);

export const updateTeam = (id, data) => 
  API.patch(`/teams/${id}/`, data);

// Maintenance Requests
export const getRequests = (page = 1, filters = {}) => {
  const params = new URLSearchParams({ page, ...filters });
  return API.get(`/requests/?${params}`);
};

export const getRequestById = (id) => 
  API.get(`/requests/${id}/`);

export const createRequest = (data) => 
  API.post('/requests/', data);

export const updateRequest = (id, data) => 
  API.patch(`/requests/${id}/`, data);

export const updateRequestStatus = (id, status) => 
  API.post(`/requests/${id}/status/`, { status });

export const assignTechnician = (id, technician) => 
  API.post(`/requests/${id}/assign/`, { technician });

export const deleteRequest = (id) => 
  API.delete(`/requests/${id}/`);

// Calendar
export const getCalendar = () => 
  API.get('/calendar/');

export default API;
```

---

## 9. Testing Recommendations

### 9.1 Backend API Testing

**Test Server Status:**
```bash
# Check if server is running
curl http://127.0.0.1:8000/api/

# Should return list of endpoints
```

**Test with Postman:**
- Import provided collection: `GearGuard_API_Collection.postman.json`
- Run all tests to verify API responses

**Test with Python:**
```bash
cd backend
python test_all_endpoints.py
```

---

### 9.2 Frontend Integration Testing

**Critical Test Cases:**

1. **Status Workflow:**
   - Create request (status should be NEW)
   - Update to IN_PROGRESS (should succeed)
   - Try to update to NEW (should fail with 400)
   - Update to REPAIRED (should succeed)
   - Update to SCRAP (should succeed AND equipment.is_usable should become false)

2. **Team Assignment:**
   - Create request for equipment with default_team
   - Verify team is auto-assigned
   - Try to assign technician not in team (should fail)
   - Assign valid technician (should succeed)

3. **Pagination:**
   - Load equipment list
   - Navigate to page 2
   - Verify different records displayed

4. **Calendar View:**
   - Create preventive request
   - Verify it appears on calendar
   - Create corrective request
   - Verify it does NOT appear on calendar

---

## 10. Support & Contact

**Backend Documentation:**
- [QUICKSTART.md](QUICKSTART.md) - Setup instructions
- [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) - API examples
- [PROJECT_COMPLETE.md](PROJECT_COMPLETE.md) - Project overview

**Backend Repository:**
- GitHub: [odooxadani-hackathon-2026](https://github.com/Mayurichavan065/odooxadani-hackathon-2026.git)

**Server:**
- Development: http://127.0.0.1:8000/
- API Root: http://127.0.0.1:8000/api/

**Start Server:**
```bash
cd backend
python manage.py runserver
```

---

## 11. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-27 | Initial comprehensive frontend integration report |

---

**Ready for Frontend Development! 🚀**

This document provides all necessary information to build a complete frontend application for the GearGuard maintenance management system. All backend APIs are tested and working. Happy coding!
