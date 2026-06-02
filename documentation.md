# HR Leave Management System - Complete Documentation

## 1. Project Overview
The HR Leave Management System is a comprehensive full-stack web application designed to streamline the process of applying for, reviewing, and approving employee leave requests. It replaces manual paperwork with a digital, role-based workflow that ensures transparency, accurate leave balance tracking, and efficient communication between employees, team leaders, and human resources.

## 2. Technology Stack
The application is built using a modern, scalable technology stack:

### Frontend (Client-Side)
- **Framework**: React.js (via Vite for fast development and building)
- **Routing**: React Router DOM (for single-page application navigation)
- **Styling**: Tailwind CSS (for responsive, utility-first design)
- **Icons**: Lucide React
- **HTTP Client**: Axios (for API communication)

### Backend (Server-Side)
- **Framework**: Django & Django REST Framework (DRF)
- **Database**: SQLite3 (Default development database, easily swappable to PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
- **Security**: CORS headers configuration

## 3. User Roles and Hierarchies
The system enforces strict access control through three primary user roles:

1. **Employee**: Can view their own leave balances, submit new leave requests, view their leave history, and cancel pending requests.
2. **Team Leader (TL)**: Acts as the first stage of approval. Can view pending requests from employees and either approve or reject them. TL approval is mandatory before a request reaches HR.
3. **HR Manager (Administrator)**: The final authority in the approval chain. Can view all requests across the company, but can only approve requests that have already been approved by a Team Leader. HR can also view the leave balances of all staff members.

## 4. Approval Workflow Lifecycle
The application features a strict 2-tier approval workflow to ensure proper oversight:

1. **Application**: Employee submits a leave request. Status becomes `Pending`.
2. **Stage 1 (Team Leader Review)**: 
   - If rejected: Status becomes `Rejected` (with feedback).
   - If approved: Status becomes `TL_Approved`.
3. **Stage 2 (HR Manager Review)**:
   - HR reviews requests marked as `TL_Approved`.
   - If rejected: Status becomes `Rejected` (with feedback).
   - If approved: Status becomes `Approved`. The system automatically and atomically deducts the requested days from the employee's specific leave balance (Vacation, Sick, or Casual).

## 5. System Features & Modules

### Authentication & Authorization
- Secure JWT-based login and registration.
- Role-based UI rendering (Navigation bar and dashboards change based on the logged-in user's role).
- Protected API endpoints on the backend ensuring users can only access data relevant to their role.

### Employee Dashboard
- **Leave Balances**: Real-time display of remaining Vacation, Sick, and Casual leave days.
- **Apply for Leave**: Form to select leave type, date range, and provide a reason.
- **My Leaves**: A detailed history table of all past and active applications, displaying the current status and any rejection feedback.

### Team Leader Dashboard
- **KPI Metrics**: Quick overview of pending, approved, and rejected requests.
- **Actionable Requests Table**: Displays requests awaiting Stage 1 approval.
- **Inline Actions**: Quick inline modals to confirm approval or provide a mandatory reason for rejection.

### HR Manager Workspace
- **Global Overview**: Advanced metrics and statistics across the entire organization.
- **Pending Action Checklist**: Highlights requests that have passed TL approval and need final HR sign-off.
- **Staff Balances Directory**: A global view of all registered employees and their current leave balances.

## 6. Installation & Running Locally

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Create and activate a virtual environment: `python -m venv venv` and `venv\Scripts\activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Apply database migrations: `python manage.py migrate`
5. Run the development server: `python manage.py runserver`
*(The backend runs on http://127.0.0.1:8000)*

### Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the Vite development server: `npm run dev`
*(The frontend runs on http://localhost:5173)*

## 7. API Endpoints Reference

### Authentication
- `POST /api/accounts/register/` - Register a new user
- `POST /api/accounts/login/` - Authenticate and receive JWT tokens

### Employee
- `GET /api/employee/balance/` - Get logged-in user's balance
- `POST /api/employee/apply-leave/` - Submit a request
- `GET /api/employee/leaves/` - Get user's leave history
- `PUT /api/employee/cancel/<id>/` - Cancel a pending request

### Team Leader
- `GET /api/tl/stats/` - Get TL dashboard statistics
- `GET /api/tl/leaves/` - Get all leave requests for review
- `PUT /api/tl/approve/<id>/` - Stage 1 Approval
- `PUT /api/tl/reject/<id>/` - Reject request

### HR Manager
- `GET /api/manager/leaves/` - Get all company requests
- `PUT /api/manager/approve/<id>/` - Final Approval & Balance Deduction
- `PUT /api/manager/reject/<id>/` - Reject request
- `GET /api/manager/balances/` - Get all employee balances

## 8. Database Schema Overview
- **User**: Custom user model tracking `email` (as username), `name`, `role`, and `is_active`.
- **LeaveBalance**: One-to-One relationship with User. Tracks integers for `vacation_balance`, `sick_balance`, and `casual_balance`.
- **LeaveRequest**: Foreign key to User. Tracks `leave_type`, `start_date`, `end_date`, `total_days`, `reason`, `status`, and `rejection_reason`.

---
*End of Documentation*
