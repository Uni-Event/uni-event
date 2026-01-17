import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
EVENTS_URL = f"{BASE}/api/events/"

# Test pentru a verifica că adăugarea unui eveniment necesită autentificare
def test_events_create_requires_auth():
    payload = {
        "title": "Test event",
        "description": "demo",
        "location": "Suceava",
        "start_date": "2030-12-01T10:00:00Z",
        "end_date": "2030-12-01T12:00:00Z",
    }

    r = requests.post(EVENTS_URL, json=payload, timeout=10)

    # Verificăm că răspunsul este 401 Unauthorized sau 403 Forbidden
    assert r.status_code in (401, 403), f"Expected 401/403, got {r.status_code}. Body={r.text}"
