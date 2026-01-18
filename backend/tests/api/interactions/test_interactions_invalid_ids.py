import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
INTERACTIONS_URL = f"{BASE}/api/interactions/"

# Test pentru a verifica răspunsul la ID-uri invalide
def test_interactions_invalid_ids():
    payload = {
        "event_id": 999999
    }
    r = requests.post(INTERACTIONS_URL, json=payload)
    assert r.status_code == 404 # Așteptăm 404 Not Found