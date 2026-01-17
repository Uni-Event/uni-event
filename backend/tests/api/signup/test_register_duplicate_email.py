import uuid # pentru a genera emailuri unice
import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
REGISTER_URL = f"{BASE}/api/users/register/"

# Test pentru a verifica că înregistrarea cu email duplicat e respinsă
def test_register_duplicate_email_should_fail():
    #email unic
    email = f"dup_{uuid.uuid4().hex[:10]}@example.com"

    payload = {
        "email": email,
        "password": "Abcd1234!",
        "password2": "Abcd1234!",
        "first_name": "Ana",
        "last_name": "Test",
    }

    # Succes
    r1 = requests.post(REGISTER_URL, json=payload, timeout=10)
    assert r1.status_code in (200, 201), r1.text #200 OK sau 201 Created

    # Failed - email duplicat
    r2 = requests.post(REGISTER_URL, json=payload, timeout=10)

    assert r2.status_code in (400, 409), r2.text #400 Bad Request sau 409 Conflict
