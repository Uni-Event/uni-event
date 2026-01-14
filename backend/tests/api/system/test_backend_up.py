import requests # pentru a face cereri HTTP

# Test pentru a verifica dacă backend-ul este funcțional
def test_backend_is_up():
    # Verificăm dacă pagina de login a admin-ului este accesibilă
    response = requests.get("http://127.0.0.1:8000/admin/login/")
    assert response.status_code in (200, 302) # 200 OK sau 302 Redirect către pagina de autentificare