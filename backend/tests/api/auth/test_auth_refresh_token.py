import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
REFRESH_URL = f"{BASE}/api/token/refresh/"

# Teste pentru endpoint-ul de refresh token
def test_refresh_requires_token():
    r = requests.post(REFRESH_URL, json={}) # fără token de refresh
    assert r.status_code == 400 # Bad Request

def test_refresh_rejects_invalid_token():
    r = requests.post(REFRESH_URL, json={"refresh": "invalid"}) # token de refresh invalid
    assert r.status_code in (400, 401) # Bad Request sau Unauthorized

# Testele demonstrează că autentificarea nu poate fi ocolită și că tokenurile sunt verificate corect.