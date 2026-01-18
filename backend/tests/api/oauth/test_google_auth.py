import requests # pentru a face cereri HTTP

BASE = "http://127.0.0.1:8000"
ENDPOINT = f"{BASE}/api/users/google/"

# Test pentru a verifica că endpoint-ul Google Auth permite doar POST, nu GET
def test_google_endpoint_allows_post_not_get():
    # Verificăm că GET nu este permis
    r_get = requests.get(ENDPOINT, allow_redirects=False, timeout=10)
    assert r_get.status_code == 405, r_get.status_code # 405 Method Not Allowed

    # Verificăm că OPTIONS indică că POST este permis
    r_opt = requests.options(ENDPOINT, timeout=10)
    assert r_opt.status_code in (200, 204), r_opt.status_code # 200 OK or 204 No Content

    # Verificăm că metoda POST este listată în header-ul Allow
    allow = r_opt.headers.get("Allow", "")
    assert "POST" in allow, allow
