import re
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"

# Regex pentru URL-ul de autentificare
AUTH_URL_RE = re.compile(r".*/auth/?$")

# Test pentru a verifica că o pagină protejată necesită autentificare
def test_protected_url_requires_auth(page: Page):
    page.set_default_timeout(8000)

    # 1.Navigare la pagina de autentificare pentru a reseta starea
    page.wait_for_timeout(1000)

    # 2. Navigare la pagina protejată (pagina principală în acest caz)
    page.goto(f"{BASE_UI}/", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)

    # 3) Verificare: suntem redirecționați la pagina de login
    try:
        expect(page).to_have_url(AUTH_URL_RE, timeout=8000)
        page.wait_for_timeout(1500)
    except Exception:
        # Dacă nu suntem redirecționați, verificăm dacă vedem formularul de login
        login_form = page.locator("form").filter(has_text="Bine ai revenit!")
        expect(login_form).to_be_visible(timeout=8000)
        page.wait_for_timeout(1500)

    # 4. Verificare: formularul de login este vizibil
    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=8000)
    page.wait_for_timeout(1000)
