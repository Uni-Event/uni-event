import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE}/api/token/"

# Test pentru login cu parolă greșită
def test_login_wrong_password():
    r = requests.post(LOGIN_URL, json={"email": "test@gmail.com", "password": "Gresita123!"}, timeout=10)
    assert r.status_code in (400, 401), r.text

# Test pentru login cu utilizator inexistent
def test_login_user_not_found():
    r = requests.post(LOGIN_URL, json={"email": "nu_exista@gmail.com", "password": "Test1234!"}, timeout=10)
    assert r.status_code in (400, 401), r.text

# Test pentru login cu câmpuri lipsă
def test_login_missing_fields():
    r = requests.post(LOGIN_URL, json={"email": "test@gmail.com"}, timeout=10)
    assert r.status_code == 400, r.text
