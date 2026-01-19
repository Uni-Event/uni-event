import re

# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "https://unievent-14dq.onrender.com"
# Regex pentru a detecta URL-urile de autentificare
AUTH_URL_RE = re.compile(r".*/auth/?$")

# Test pentru a verifica deconectarea prin UI
def test_logout_ui(page: Page):
    page.set_default_timeout(8000)
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=10000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill("test@gmail.com")
    login_form.locator('input[placeholder="Introduceți parola"]').fill("Test1234!")
    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    # Așteaptă să nu mai fie pe pagina de autentificare
    try:
        expect(page).not_to_have_url(AUTH_URL_RE, timeout=15000)
    except Exception:
        expect(login_form).not_to_be_visible(timeout=15000)

    # Închide eventualele modale
    page.keyboard.press("Escape")

    name_loc = page.get_by_text("test Test", exact=True)

    target = None
    for i in range(name_loc.count()):
        cand = name_loc.nth(i)
        try:
            if cand.is_visible():
                target = cand
                break
        except Exception:
            pass

    if target is None:
        raise AssertionError('Nu găsesc "test Test" vizibil în UI.')

    target.click()

    # Caută butonul de deconectare
    logout_btn = page.get_by_text("Deconectare", exact=True)
    if logout_btn.count() == 0:
        target.locator("xpath=ancestor::*[self::button or self::a or self::div][1]").click()

    logout_btn = page.get_by_text("Deconectare", exact=True).first
    expect(logout_btn).to_be_visible(timeout=10000)
    logout_btn.click()

    # Așteaptă să revină pe pagina de autentificare
    expect(page).to_have_url(AUTH_URL_RE, timeout=15000)
    expect(page.locator("form").filter(has_text="Bine ai revenit!")).to_be_visible(timeout=15000)
