import re
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"

# Regex pentru URL-ul de autentificare
AUTH_URL_RE = re.compile(r".*/auth/?$")

# Test pentru a verifica redirect după login
def test_url_redirect_after_login(page: Page):
    page.set_default_timeout(8000)

    # 1. Navigare la pagina de autentificare
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)

    # 2. Verificare: formularul de login este vizibil
    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=10000)
    page.wait_for_timeout(1000)

    # 3. Completare formular de login și submit
    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill("test@gmail.com")
    page.wait_for_timeout(700)

    login_form.locator('input[placeholder="Introduceți parola"]').fill("Test1234!")
    page.wait_for_timeout(700)

    login_form.get_by_role("button", name="AUTENTIFICARE").click()
    page.wait_for_timeout(2000)

    # 4. Verificare: redirect după login
    expect(page).not_to_have_url(AUTH_URL_RE, timeout=15000)
    page.wait_for_timeout(1000)

    # 5. Confirmare: URL-ul nu mai conține /auth
    current_url = page.url
    assert "/auth" not in current_url, f"Expected redirect after login, but still on: {current_url}"
