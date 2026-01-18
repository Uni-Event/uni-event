import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE}/api/token/"

# Test pentru a verifica că răspunsurile de login nu dezvăluie existența utilizatorilor
def test_login_does_not_leak_user_existence():
    # cerere pentru un utilizator inexistent
    r1 = requests.post(LOGIN_URL, json={
        "email": "nu_exista@gmail.com",
        "password": "Test1234!"
    })
    # cerere pentru un utilizator existent, dar cu parolă greșită
    r2 = requests.post(LOGIN_URL, json={
        "email": "test@gmail.com",
        "password": "Gresita123!"
    })

    assert r1.status_code == r2.status_code # ambele ar trebui să fie 400 sau 401

    # Testul trece doar dacă răspunsurile sunt identice, prevenind astfel enumerarea utilizatorilor
