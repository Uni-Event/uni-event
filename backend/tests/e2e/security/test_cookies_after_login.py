from urllib.parse import urlparse # pentru parsarea URL-ului
from playwright.sync_api import expect # pentru așteptări în Playwright

# Test pentru a verifica existența cookie-urilor după autentificare
def test_cookies_after_login(page):
    page.goto("https://unievent-14dq.onrender.com/auth", wait_until="domcontentloaded")

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill("test@gmail.com")
    login_form.locator('input[placeholder="Introduceți parola"]').fill("Test1234!")
    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    expect(page).not_to_have_url("https://unievent-14dq.onrender.com/auth")
    page.wait_for_timeout(1000)

    # Verifică existența cookie-urilor
    cookies = page.context.cookies()
    assert len(cookies) > 0, "No cookies were set after login."

    # Verifică dacă există cookie-uri pentru domeniul curent
    host = urlparse(page.url).hostname 
    assert any((c.get("domain") or "").lstrip(".") == host for c in cookies), \
        f"Cookies exist, but none match host={host}. Got domains: {[c.get('domain') for c in cookies]}"
