import time # pentru a genera emailuri unice bazate pe timestamp
import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
SIGNUP_URL = f"{BASE}/api/users/register/"

# email unic
def _unique_email():
    return f"test_{int(time.time() * 1000)}@gmail.com"

# pozitiv: creare cont cu date valide
def test_signup_create_account_success():
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": _unique_email(),
        "password": "Test1234!",
        "password2": "Test1234!",
    }
    r = requests.post(SIGNUP_URL, json=payload, timeout=10)
    assert r.status_code in (200, 201), r.text # 200 OK sau 201 Created

# negativ: câmp lipsă
def test_signup_missing_email():
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "password": "Test1234!",
        "password2": "Test1234!",
    }
    r = requests.post(SIGNUP_URL, json=payload, timeout=10)
    assert r.status_code == 400, r.text

# negativ: email invalid
def test_signup_invalid_email():
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": "not-an-email",
        "password": "Test1234!",
        "password2": "Test1234!",
    }
    r = requests.post(SIGNUP_URL, json=payload, timeout=10)
    assert r.status_code == 400, r.text

# negativ: parole diferite
def test_signup_password_mismatch():
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": _unique_email(),
        "password": "Test1234!",
        "password2": "AltParola123!",
    }
    r = requests.post(SIGNUP_URL, json=payload, timeout=10)
    assert r.status_code == 400, r.text

# negativ: parolă prea slabă
def test_signup_weak_password():
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": _unique_email(),
        "password": "123",
        "password2": "123",
    }
    r = requests.post(SIGNUP_URL, json=payload, timeout=10)
    assert r.status_code == 400, r.text

# negativ: email duplicat (creează 1 cont, apoi încearcă iar)
def test_signup_duplicate_email():
    email = _unique_email()

    payload_ok = {
        "first_name": "Test",
        "last_name": "User",
        "email": email,
        "password": "Test1234!",
        "password2": "Test1234!",
    }
    r1 = requests.post(SIGNUP_URL, json=payload_ok, timeout=10)
    assert r1.status_code in (200, 201), r1.text

    r2 = requests.post(SIGNUP_URL, json=payload_ok, timeout=10)
    assert r2.status_code in (400, 409), r2.text  # 400 Bad Request sau 409 Conflict
