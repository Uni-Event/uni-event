import uuid # pentru a genera emailuri unice
import pytest # framework de testare
import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
REGISTER_URL = f"{BASE}/api/users/register/"
TOKEN_URL = f"{BASE}/api/token/"
EVENTS_URL = f"{BASE}/api/events/"
FAVORITES_URL = f"{BASE}/api/interactions/favorites/"

PW = "Test1234!"

# IDOR (Insecure Direct Object Reference) - test pentru a verifica că un utilizator nu poate șterge favoritele altui utilizator

# email unic pentru fiecare test
def _email():
    return f"pytest_{uuid.uuid4().hex[:10]}@example.com"

# înregistrează un utilizator nou
def _register(email):
    requests.post(
        REGISTER_URL,
        json={
            "first_name": "Ana",
            "last_name": "Test",
            "email": email,
            "password": PW,
            "password2": PW
        },
        timeout=10
    )

# obține token de acces pentru un utilizator
def _token(email):
    # încearcă autentificarea cu email, dacă nu merge, încearcă cu username
    r = requests.post(TOKEN_URL, json={"email": email, "password": PW}, timeout=10)
    if r.status_code != 200:
        r = requests.post(TOKEN_URL, json={"username": email, "password": PW}, timeout=10)

    # Verificăm că autentificarea a reușit și returnăm tokenul de acces
    assert r.status_code == 200, r.text
    return r.json()["access"]

# construiește header-ul de autorizare
def _headers(tok):
    return {"Authorization": f"Bearer {tok}"}

# obține un ID de eveniment existent
def _get_any_event_id():
    # obține lista de evenimente publice
    r = requests.get(EVENTS_URL, timeout=10)
    assert r.status_code == 200, r.text
    data = r.json()

    # extrage primul ID de eveniment disponibil, iar dacă nu există, sare testul
    if isinstance(data, dict) and "results" in data:
        data = data["results"]
    if not data:
        pytest.skip("No events available to favorite.")
    return data[0]["id"]

# Test pentru a verifica că ștergerea unui favorit al altui utilizator este blocată
def test_favorite_delete_idor_is_blocked():
    # user A
    a = _email()
    _register(a)
    tok_a = _token(a)

    # user B
    b = _email()
    _register(b)
    tok_b = _token(b)

    # obține un ID de eveniment existent
    event_id = _get_any_event_id()

    # ✅ user A adaugă un favorit
    r_add = requests.post(
        FAVORITES_URL,
        json={"event_id": event_id},
        headers=_headers(tok_a),
        timeout=10
    )
    # Verificăm că adăugarea a reușit
    assert r_add.status_code in (200, 201), r_add.text

    # extrage ID-ul favoritului creat
    fav = r_add.json()
    fav_id = fav.get("id") or fav.get("pk")
    if not fav_id:
        pytest.skip(f"Favorite create did not return an id. Response: {fav}")

    # user B încearcă să șteargă favoritului user A (IDOR attempt)
    r_del = requests.delete(
        f"{FAVORITES_URL}{fav_id}/",
        headers=_headers(tok_b),
        timeout=10
    )

    # Verificăm că răspunsul este 403 Forbidden sau 404 Not Found
    assert r_del.status_code in (403, 404), f"Expected 403/404, got {r_del.status_code}. Body={r_del.text}"
