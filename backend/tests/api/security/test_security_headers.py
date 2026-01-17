import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
PING_URL = f"{BASE}/api/token/" 

# Test pentru a verifica prezența headerelor de securitate
def test_security_headers_present():
    # Efectuăm o cerere simplă POST
    r = requests.post(PING_URL, json={"email":"x", "password":"y"}, timeout=10)

    # headerele de securitate așteptate
    required = [
        "X-Content-Type-Options",   
        "X-Frame-Options",          
        "Referrer-Policy",
    ]

    # Verificăm dacă toate headerele necesare sunt prezente
    missing = [h for h in required if h not in r.headers]
    assert not missing, f"Lipsesc security headers: {missing}. Headers={dict(r.headers)}"
