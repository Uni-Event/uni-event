import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE}/api/token/"

# Test pentru a verifica că CORS nu permite origini neautorizate
def test_cors_does_not_allow_random_origin():
    # Cerere OPTIONS cu un header Origin neautorizat
    headers = {"Origin": "https://evil.example"}
    r = requests.options(LOGIN_URL, headers=headers, timeout=10)

    # Verificăm că Access-Control-Allow-Origin nu este setat la "*" sau la originea neautorizată
    aco = r.headers.get("Access-Control-Allow-Origin", "")
    assert aco not in ("*", "https://evil.example"), f"CORS prea permisiv: ACAO={aco}"
