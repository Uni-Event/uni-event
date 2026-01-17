# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

# Test pentru verificarea cookie-urilor după login
def test_cookies_after_login(page: Page):
    page.goto("http://localhost:5173/auth", wait_until="domcontentloaded")

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill("test@gmail.com")
    login_form.locator('input[placeholder="Introduceți parola"]').fill("Test1234!")

    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    expect(page).not_to_have_url("http://localhost:5173/auth")

    page.wait_for_timeout(1000)

    # Preluare cookie-uri
    cookies = page.context.cookies()

    assert len(cookies) > 0, "No cookies were set after login."

    # Verificare că există cookie-uri pentru domeniul local
    assert any(
        ("localhost" in (c.get("domain") or "") or "127.0.0.1" in (c.get("domain") or ""))
        for c in cookies
    ), f"Cookies exist, but none look like local cookies. Got: {[c.get('domain') for c in cookies]}"
