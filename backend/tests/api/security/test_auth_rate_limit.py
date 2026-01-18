import requests, time # pentru a face cereri HTTP și a măsura timpul

BASE = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE}/api/token/"

# Test pentru a verifica limitarea ratei la login
def test_login_rate_limiting():
    start = time.time() 
    statuses = [] 

    # Efectuăm 15 cereri de login cu parolă greșită
    for _ in range(15):
        r = requests.post(LOGIN_URL, json={
            "email": "test@gmail.com",
            "password": "Gresita123!"
        })
        statuses.append(r.status_code)

    # Calculăm timpul total scurs
    elapsed = time.time() - start

    # Verificăm că cel puțin una dintre cereri a fost limitată (429) sau că timpul a depășit 2 secunde
    assert (429 in statuses) or (elapsed > 2.0) 
