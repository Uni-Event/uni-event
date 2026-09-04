# Testing

[Back to the main README](../README.md)

UniEvent was evaluated through manual API testing, automated API tests,
end-to-end browser tests, and a baseline security scan.

## Testing Overview

| Testing type | Tools | Covered areas |
| --- | --- | --- |
| Manual API testing | Postman | JWT authentication, token refresh and role permissions |
| Automated API testing | Pytest, Requests | Authentication, events, interactions, validation and security |
| End-to-end testing | Pytest, Playwright | Student and organizer workflows |
| Security scanning | OWASP ZAP | Security headers, information exposure and frontend configuration |

## Results Summary

| Area | Result |
| --- | --- |
| Manual JWT testing | All 8 documented test cases passed |
| Automated API testing | Most tests passed; two configuration issues were identified |
| End-to-end testing | All documented tests passed |
| OWASP ZAP scan | No high-risk alerts were identified |

The automated tests identified two configuration issues:

- the CORS policy allowed requests from any origin;
- the password policy accepted passwords without an uppercase character.

The OWASP ZAP scan identified missing security headers, including Content
Security Policy and anti-clickjacking protection. The scan was performed
against the local frontend and represents a baseline security assessment,
not a complete penetration test of the deployed application.

## Requirements

Before running the tests, install:

- Python 3.10 or newer; Python 3.11 is recommended
- Node.js and npm
- The UniEvent backend and frontend dependencies
- A configured local development environment

The backend and frontend should be available at:

```text
Backend:  http://127.0.0.1:8000
Frontend: http://localhost:5173
```

## Test Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv env
```

Activate it on Windows PowerShell:

```powershell
env\Scripts\Activate.ps1
```

Activate it on Windows Command Prompt:

```cmd
env\Scripts\activate.bat
```

Activate it on Linux or macOS:

```bash
source env/bin/activate
```

Install the project and testing dependencies:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements_new.txt
python -m pip install pytest pytest-django pytest-html requests
python -m pip install playwright pytest-playwright
python -m playwright install
```

Install the frontend dependencies:

```bash
cd ../frontend
npm install
```

## Starting the Test Environment

Start the backend in the first terminal:

```bash
cd backend
env\Scripts\Activate.ps1
python manage.py runserver
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Use a third terminal with the backend virtual environment activated to run the
tests.

## Running the Tests

### API Tests

From the `backend` directory:

```bash
pytest tests/api -q
```

The API tests cover:

- authentication and JWT token handling;
- account registration and Google authentication;
- event endpoints and input validation;
- favorites and user interactions;
- role-based access restrictions;
- SQL injection, XSS, CORS and security headers.

### End-to-End Tests

Run the E2E tests with a visible browser:

```bash
pytest tests/e2e -q --headed -s
```

Run them in headless mode:

```bash
pytest tests/e2e -q
```

The E2E tests cover:

- registration, login and logout;
- protected routes;
- event discovery and filtering;
- event registration and favorites;
- digital tickets and QR codes;
- event creation and management;
- organizer statistics;
- responsive interface behavior.

### Run a Specific Test

For example:

```bash
pytest tests/e2e/signup/test_validate_email.py -q --headed -s
```

### Run All Tests

```bash
pytest tests -q
```

### Generate an HTML Report

```bash
pytest tests -q --html=test-report.html --self-contained-html
```

## Test Organization

```text
backend/tests/
├── api/
│   ├── auth/
│   ├── events/
│   ├── interactions/
│   ├── oauth/
│   ├── security/
│   ├── signup/
│   └── system/
└── e2e/
    ├── auth/
    ├── design/
    ├── organizer/
    ├── security/
    ├── signup/
    ├── url/
    └── user/
```

## Additional Notes

- The backend and frontend must run simultaneously for E2E testing.
- Test URLs depend on the local environment configuration.
- A visible browser is useful when debugging failed E2E tests.
- Security findings should be verified again after configuration changes.
