import uuid # pentru a genera emailuri unice
import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
REGISTER_URL = f"{BASE}/api/users/register/"

# email unic pentru fiecare test
def _unique_email():
    return f"pwtest_{uuid.uuid4().hex[:10]}@example.com"

def test_register_password_too_short_should_fail():
    payload = {
        "email": _unique_email(),
        "password": "Ab1!",          # prea scurt
        "password2": "Ab1!",
        "first_name": "Ana",
        "last_name": "Test",
    }

    r = requests.post(REGISTER_URL, json=payload, timeout=10)

    assert r.status_code == 400, r.text #400 Bad Request

def test_register_password_only_numbers_should_fail():
    payload = {
        "email": _unique_email(),
        "password": "12345678",      # doar cifre
        "password2": "12345678",
        "first_name": "Ana",
        "last_name": "Test",
    }

    r = requests.post(REGISTER_URL, json=payload, timeout=10)
    assert r.status_code == 400, r.text


def test_register_password_no_uppercase_should_fail():
    payload = {
        "email": _unique_email(),
        "password": "abcdefg1!",     # fără majusculă
        "password2": "abcdefg1!",
        "first_name": "Ana",
        "last_name": "Test",
    }

    r = requests.post(REGISTER_URL, json=payload, timeout=10)
    assert r.status_code == 400, r.text


def test_register_password_mismatch_should_fail():
    payload = {
        "email": _unique_email(),
        "password": "Abcd1234!",
        "password2": "Abcd1234?",    # diferit
        "first_name": "Ana",
        "last_name": "Test",
    }

    r = requests.post(REGISTER_URL, json=payload, timeout=10)
    assert r.status_code == 400, r.text
