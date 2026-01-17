import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
REFRESH_URL = f"{BASE}/api/token/refresh/"

# Test pentru refresh token cu token invalid
def test_refresh_invalid_token_must_be_401():
    r = requests.post(REFRESH_URL, json={"refresh":"invalid"}, timeout=10)
    
    # Verificăm că răspunsul este 401 Unauthorized
    assert r.status_code == 401, f"Așteptam 401, am primit {r.status_code}. Body={r.text}"
