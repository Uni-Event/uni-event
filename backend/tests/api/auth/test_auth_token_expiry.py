import requests, base64, json # pentru a face cereri HTTP și a decoda JWT

BASE = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE}/api/token/"

 # extrage payload-ul dintr-un JWT, decodificat din base64 și convertit în JSON
def _jwt_payload(token):
    payload_b64 = token.split(".")[1] + "==="
    decoded = base64.urlsafe_b64decode(payload_b64.encode()).decode()
    return json.loads(decoded)

# Test pentru a verifica că tokenul de acces are un câmp de expirare și că expiră în timp util
def test_access_token_has_expiry():
    r = requests.post(LOGIN_URL, json={
        "email": "test@gmail.com",
        "password": "Test1234!"
    })
    assert r.status_code == 200 # autentificare reușită

    # Extragem tokenul de acces și verificăm payload-ul
    access = r.json()["access"]
    payload = _jwt_payload(access)

    # Verificăm că există câmpurile "exp" și "iat" și că diferența este rezonabilă (de ex. 24 de ore)
    assert "exp" in payload
    assert "iat" in payload
    assert (payload["exp"] - payload["iat"]) <= 24 * 3600
