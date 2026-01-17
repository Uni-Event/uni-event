import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"

FAVORITES_URL = f"{BASE}/api/interactions/favorites/"
TICKETS_URL   = f"{BASE}/api/interactions/tickets/"
REVIEWS_URL   = f"{BASE}/api/interactions/reviews/"

# Teste pentru a verifica că endpoint-urile de interacțiuni necesită autentificare
def test_favorites_requires_auth():
    r = requests.get(FAVORITES_URL, timeout=10)
    assert r.status_code in (401, 403), f"{r.status_code} {r.text}"

def test_tickets_requires_auth():
    r = requests.get(TICKETS_URL, timeout=10)
    assert r.status_code in (401, 403), f"{r.status_code} {r.text}"

def test_reviews_requires_auth():
    r = requests.get(REVIEWS_URL, timeout=10)
    
    # Verificăm că răspunsul este 401 Unauthorized sau 403 Forbidden
    assert r.status_code in (401, 403), f"{r.status_code} {r.text}"
