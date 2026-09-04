# UniEvent

### University Event Management Platform

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/Django_REST_Framework-A30000?style=flat-square&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?style=flat-square&logo=render&logoColor=white)

UniEvent is a collaborative full-stack web platform designed to centralize
the discovery, organization, approval, and attendance management of university
events.

The platform provides dedicated functionality for students, event organizers,
and administrators, covering the complete workflow from publishing an event to
participant registration and QR-based check-in.

> The application interface is currently available in Romanian.

## Live Application and Demonstration

<p align="center">
  <a href="https://youtu.be/QGaP4f8HSlI">
    <img
      src="docs/images/event-discovery.png"
      alt="UniEvent event discovery page"
      width="780"
    >
  </a>
</p>

<p align="center">
  <a href="https://unievent-14dq.onrender.com">
    <strong>Open the live application</strong>
  </a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://youtu.be/QGaP4f8HSlI">
    <strong>Watch the complete project demonstration</strong>
  </a>
</p>

> The Render service may require a short startup period after being inactive.

## Overview

University events are often promoted through separate communication channels
such as social media, email, physical posters, and internal announcements.
This makes events harder to discover and creates additional work for
organizers.

UniEvent brings these activities into a single platform. Students can discover
events, filter them by relevant criteria, register, save favorites, receive
digital tickets, and submit feedback. Organizers can create and manage events,
monitor participation, and validate attendees using QR codes.

## Key Features

### Students

- Account registration and email/password authentication
- Google authentication
- Event discovery, search, and filtering
- Event details, attachments, and map locations
- Event registration with participant capacity validation
- Favorite event management
- Digital tickets with unique QR codes
- Notifications and profile management
- Event reviews and ratings
- Organizer role requests

### Organizers

- Dedicated organizer dashboard
- Event creation, editing, and management
- Draft, approval, publication, and rejection workflow
- Event poster and document uploads
- Location selection and external map integration
- Participant and event statistics
- QR-based ticket validation and attendee check-in

### Administrators

- User and organizer request management
- Event approval and rejection
- University structure management
- Access to the Django administration interface

## Application Highlights

### Event Discovery and Details

<p align="center">
  <a href="docs/images/event-discovery.png">
    <img
      src="docs/images/event-discovery.png"
      alt="University event discovery and filtering"
      width="49%"
    >
  </a>
  <a href="docs/images/event-details.png">
    <img
      src="docs/images/event-details.png"
      alt="University event details"
      width="49%"
    >
  </a>
</p>

Students can browse available events, search by name, apply filters, inspect
event information, access attached materials, and open the event location.

### Organizer Event Management

<p align="center">
  <a href="docs/images/organizer-dashboard.png">
    <img
      src="docs/images/organizer-dashboard.png"
      alt="UniEvent organizer dashboard"
      width="49%"
    >
  </a>
  <a href="docs/images/event-creation.png">
    <img
      src="docs/images/event-creation.png"
      alt="UniEvent event creation form"
      width="49%"
    >
  </a>
</p>

Organizers can create events, save drafts, submit events for approval, manage
published events, upload promotional materials, and configure participation
limits.

### Statistics and QR Check-in

<p align="center">
  <a href="docs/images/organizer-statistics.png">
    <img
      src="docs/images/organizer-statistics.png"
      alt="UniEvent organizer statistics"
      width="49%"
    >
  </a>
  <a href="docs/images/qr-check-in.png">
    <img
      src="docs/images/qr-check-in.png"
      alt="UniEvent QR ticket check-in"
      width="49%"
    >
  </a>
</p>

Each registration generates a digital ticket with a unique QR code.
Organizers can scan tickets at the event entrance, validate registrations,
prevent duplicate check-ins, and monitor participation statistics.

## User Roles

| Role | Main capabilities |
| --- | --- |
| Student | Discover events, register, manage favorites, access tickets and submit reviews |
| Organizer | Create and manage events, view statistics and validate QR tickets |
| Administrator | Review organizer requests, approve events and manage platform data |

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, Material UI, Axios, React Router |
| Backend | Python, Django, Django REST Framework |
| Authentication | JWT, Google OAuth |
| Database | PostgreSQL, Neon |
| Media storage | Cloudinary |
| Maps and QR | Leaflet, OpenStreetMap, QR Code, html5-qrcode |
| Deployment | Render |
| Testing | Postman, Pytest, Playwright, OWASP ZAP |
| Project management | Jira, Confluence, Figma |

## Application Structure

UniEvent uses a separated frontend and backend architecture:

```text
React web application
        |
        | REST API / JSON
        v
Django REST Framework
        |
        +---- Neon PostgreSQL
        |
        +---- Cloudinary media storage
```

The backend exposes REST endpoints for users, events, interactions,
authentication, tickets, notifications, and organizer functionality. The
frontend communicates with these endpoints through a configured Axios client
and attaches JWT access tokens to authenticated requests.

More information about the technical decisions and development workflow is
available in the [development process documentation](docs/DEVELOPMENT_PROCESS.md).

## Documentation

| Document | Description |
| --- | --- |
| [Development Process](docs/DEVELOPMENT_PROCESS.md) | Requirements, technical decisions, deployment and project organization |
| [Testing](docs/TESTING.md) | Manual testing, automated tests, security evaluation and test commands |
| [Team and Contributions](docs/TEAM_CONTRIBUTIONS.md) | Team members, primary roles, and areas of coordination |

## Team Project

UniEvent was developed collaboratively by a five-member team. Team members
contributed across backend development, frontend development, database design,
UI/UX, testing, deployment, documentation, and project management.

Individual responsibilities are described in
[Team and Contributions](docs/TEAM_CONTRIBUTIONS.md).

## Run Locally

<details>
<summary><strong>View installation instructions</strong></summary>

<br>

This section describes how to install and run UniEvent locally, primarily on
Windows.

The application consists of two parts:

- **Backend** — Django and Python
- **Frontend** — React and Node.js

### 1. Prerequisites

Before cloning the repository, make sure the following software is installed.

#### Python

Python 3.10 or newer is recommended.

Check the installed version:

```bash
python --version
```

If Python is not installed, download it from
[python.org](https://www.python.org/downloads/).

On Windows, enable the **Add Python to PATH** option during installation.

#### Node.js

The latest Node.js LTS version is recommended.

Check the installed versions:

```bash
node --version
npm --version
```

If Node.js is not installed, download it from
[nodejs.org](https://nodejs.org/en/) and use the standard installation
settings.

#### Database

The current version of UniEvent uses PostgreSQL. You can use a local
PostgreSQL instance or a hosted PostgreSQL database such as Neon.

You will need a valid PostgreSQL connection URL.

### 2. Clone the Repository

```bash
git clone https://github.com/Uni-Event/uni-event.git
cd uni-event
```

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

The directory should contain the `requirements_new.txt` file.

#### Create a Virtual Environment

```bash
python -m venv env
```

#### Activate the Virtual Environment

Windows PowerShell:

```powershell
env\Scripts\Activate.ps1
```

Windows Command Prompt:

```cmd
env\Scripts\activate.bat
```

Linux or macOS:

```bash
source env/bin/activate
```

If PowerShell reports that script execution is disabled, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Restart PowerShell and activate the environment again.

#### Install the Backend Dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements_new.txt
```

#### Configure the Environment

Create a file named `.env` inside the `backend` directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CSRF_TRUSTED_ORIGINS=http://localhost:5173
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

The Google OAuth and Cloudinary values are required when using their
corresponding features.

Never commit the `.env` file or credentials to the repository.

#### Initialize the Database

Apply the database migrations:

```bash
python manage.py migrate
```

#### Create an Administrator Account

Creating an administrator account is recommended:

```bash
python manage.py createsuperuser
```

#### Start the Backend

```bash
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000/
```

Available development pages include:

```text
Django Admin:     http://127.0.0.1:8000/admin/
Swagger API:      http://127.0.0.1:8000/swagger/
ReDoc API:        http://127.0.0.1:8000/redoc/
```

### 4. Frontend Setup

Open a second terminal and navigate to the frontend directory:

```bash
cd uni-event/frontend
```

Install the frontend dependencies:

```bash
npm install
```

Create a file named `.env` inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173/
```

The port may be different if port `5173` is already in use. Check the terminal
for the generated address.

The authentication page should appear after opening the frontend address.

### 5. Starting the Project Again

After the initial installation, start the two services in separate terminals.

Backend:

```powershell
cd uni-event/backend
env\Scripts\Activate.ps1
python manage.py runserver
```

Frontend:

```bash
cd uni-event/frontend
npm run dev
```

Both the backend and frontend must run simultaneously.

### 6. Common Problems

#### Python or pip Is Not Recognized

Check whether Python is available:

```bash
python --version
python -m pip --version
```

If it is not recognized, make sure Python was added to the system `PATH`.

#### PowerShell Blocks Virtual Environment Activation

Run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then restart PowerShell and activate the environment again.

#### The Frontend Displays a Blank Page

- Make sure the backend is running.
- Verify `VITE_API_BASE_URL` in `frontend/.env`.
- Open the browser developer console and check for connection errors.
- Clear the application's local storage and reload the page if an invalid
  authentication session was previously stored.

#### The Backend Does Not Start

- Make sure the virtual environment is active.
- Reinstall the dependencies from `requirements_new.txt`.
- Verify the `DATABASE_URL` value.
- Check that the PostgreSQL database is accessible.
- Run `python manage.py migrate` again.

### 7. Additional Notes

- Backend and frontend services must run simultaneously during local
  development.
- The local environment uses its own database and configuration.
- The publicly deployed version is available through the
  [UniEvent live application](https://unievent-14dq.onrender.com).
- Testing setup and commands are available in the
  [testing documentation](docs/TESTING.md).

</details>

## Project Status

UniEvent is a functional collaborative prototype deployed for demonstration
and portfolio purposes. The current version includes the primary student,
organizer, and administrator workflows.
