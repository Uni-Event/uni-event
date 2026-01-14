import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
TOKEN_URL = f"{BASE}/api/token/"
EVENTS_URL = f"{BASE}/api/events/"

ORGANIZER_EMAIL = "test@gmail.com"
ORGANIZER_PASSWORD = "Test1234!"

# Funcție pentru a obține tokenul de acces al organizatorului
def _get_organizer_access_token() -> str:
    r = requests.post(
        TOKEN_URL,
        json={"email": ORGANIZER_EMAIL, "password": ORGANIZER_PASSWORD},
        timeout=10
    )
    assert r.status_code == 200, r.text

    # Verificăm că răspunsul conține tokenul de acces
    data = r.json()
    assert "access" in data, data
    return data["access"]

# Test pentru crearea unui eveniment cu payload invalid
def test_events_create_invalid_payload_returns_400():
    access = _get_organizer_access_token()

    # Setăm header-ul de autorizare
    headers = {"Authorization": f"Bearer {access}"}

    # Payload invalid pentru crearea evenimentului
    payload = {
        "title": "",           
        "date": "invalid",      
    }

    # Efectuăm cererea de creare a evenimentului
    r = requests.post(EVENTS_URL, json=payload, headers=headers, timeout=10)

    # Verificăm că răspunsul este 400 Bad Request
    assert r.status_code == 400, f"Expected 400, got {r.status_code}. Body={r.text}"
