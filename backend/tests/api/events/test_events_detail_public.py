import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
EVENT_URL = f"{BASE}/api/events/1/" # Presupunem că evenimentul cu ID 1 există

# Test pentru a verifica că detaliile unui eveniment sunt publice
def test_event_detail_is_public():
    r = requests.get(EVENT_URL, timeout=10)
    assert r.status_code == 200, r.text
