import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE}/api/token/"

# Test pentru login reușit cu credențiale valide
def test_login_success():
    payload = {
        "email": "test@gmail.com",
        "password": "Test1234!"
    }

    # Efectuăm cererea de login
    r = requests.post(LOGIN_URL, json=payload, timeout=10)

    # Verificăm că răspunsul este 200 OK
    assert r.status_code == 200, r.text

    # Verificăm că răspunsul conține tokenurile de acces și refresh
    data = r.json()
    assert "access" in data, data
    assert "refresh" in data, data
