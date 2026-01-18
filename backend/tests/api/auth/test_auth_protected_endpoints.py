import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
PROFILE_URL = f"{BASE}/api/users/profile/"

# Test pentru a verifica că endpoint-ul /api/users/profile/ necesită autentificare
def test_profile_requires_authentication():
    r = requests.get(PROFILE_URL) # fără token de autentificare
    assert r.status_code in (401, 403)
# 401 - Unauthorized (utilizator neautentificat)
# 403 - Forbidden (acces interzis)
# Testul trece doar dacă endpoint-ul este protejat