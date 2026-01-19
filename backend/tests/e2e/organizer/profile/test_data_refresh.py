import re
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "https://unievent-14dq.onrender.com"
AUTH_URL_RE = re.compile(r".*/auth/?$")

EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms: int = 600):
    page.wait_for_timeout(ms)

# Funcție de login
def login(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    slow(page, 700)

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=15000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    slow(page, 250)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    slow(page, 250)

    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    # Așteaptă să iasă de pe /auth
    try:
        expect(page).not_to_have_url(AUTH_URL_RE, timeout=20000)
    except Exception:
        expect(login_form).not_to_be_visible(timeout=20000)

    slow(page, 1200)

    # Închide eventuale modale/overlay
    page.keyboard.press("Escape")
    slow(page, 300)

# Funcție pentru a deschide meniul de utilizator
def open_user_menu(page: Page):
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
    slow(page, 600)

# Test pentru a reîncărca datele profilului
def test_profile_refresh_ui(page: Page):
    page.set_default_timeout(30000)

    # 1. LOGIN
    login(page)

    # 2. Deschide meniul și apasă „Profil”
    open_user_menu(page)

    profil_btn = page.get_by_text("Profil", exact=True).first
    expect(profil_btn).to_be_visible(timeout=10000)
    slow(page, 350)
    profil_btn.click()
    slow(page, 1200)

    # Verificare minimă: suntem pe pagina Profil
    expect(page).to_have_url(re.compile(r".*/profile.*"), timeout=20000)
    heading = page.get_by_role("heading", name=re.compile(r"^Profil$", re.I))
    if heading.count() > 0:
        expect(heading.first).to_be_visible(timeout=20000)

    slow(page, 1200)

    # 3. Click pe „Reîncarcă” (refresh)
    reincarca = page.get_by_role("button", name=re.compile(r"^Reîncarcă$", re.I))
    if reincarca.count() == 0:
        # fallback fără diacritice
        reincarca = page.locator("button:has-text('Reincarca'), button:has-text('Reîncarcă')")

    expect(reincarca.first).to_be_visible(timeout=15000)
    reincarca.first.scroll_into_view_if_needed()
    slow(page, 400)

    # Așteaptă răspunsul după click
    with page.expect_response(re.compile(r".*"), timeout=5000) as _:
        reincarca.first.click(force=True)

    slow(page, 1800)

    # Verificare minimă: suntem tot pe pagina Profil
    expect(page).to_have_url(re.compile(r".*/profile.*"), timeout=20000)
    expect(page.locator("text=/^Email$/i").first).to_be_visible(timeout=20000)
