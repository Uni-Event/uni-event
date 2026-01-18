import uuid # pentru a genera emailuri unice
import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
REGISTER_URL = f"{BASE}/api/users/register/"


# Test pentru a verifica că endpoint-ul de înregistrare respinge tentativele de SQL Injection
def test_register_rejects_sql_injection_like_email():
    bad_email = "test' OR 1=1 --"

    payload = {
        "email": bad_email,
        "password": "Abcd1234!",
        "password2": "Abcd1234!",
        "first_name": "Ana",
        "last_name": "Test",
    }

    r = requests.post(REGISTER_URL, json=payload, timeout=10)

    # 400 Bad Request, 401 Unauthorized sau 403 Forbidden sunt răspunsuri acceptabile
    assert r.status_code in (400, 401, 403), r.text