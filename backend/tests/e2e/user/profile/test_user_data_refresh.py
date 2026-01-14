import re
import time # pentru timestamp
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"
AUTH_URL_RE = re.compile(r".*/auth/?$") # Regex pentru URL-ul de autentificare

PASSWORD = "Test1234!"

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms: int = 600):
    page.wait_for_timeout(ms)

# Funcție de înregistrare și login
def register_and_login(page: Page):
    unique_ts = str(int(time.time()))
    email = f"test_{unique_ts}@gmail.com"
    password = PASSWORD

    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    slow(page, 800)

    # Mergi la "Înregistrează-te"
    page.locator("span", has_text=re.compile(r"Înregistrează-te", re.I)).first.click()
    slow(page, 900)

    # Formular register
    register_form = (
        page.get_by_role("heading", name=re.compile(r"Înregistrează-te", re.I))
        .locator("xpath=ancestor::form[1]")
    )
    expect(register_form).to_be_visible(timeout=15000)

    register_form.locator('input[placeholder="Nume"]').fill("Test")
    slow(page, 350)
    register_form.locator('input[placeholder="Prenume"]').fill("User")
    slow(page, 350)
    register_form.locator('input[placeholder="Ex: student@usv.ro"]').fill(email)
    slow(page, 450)
    register_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    slow(page, 450)
    register_form.locator('input[placeholder="Confirmă parola"]').fill(password)
    slow(page, 450)

    register_form.get_by_role("button", name=re.compile(r"CREEAZĂ CONT", re.I)).click()
    slow(page, 1600)

    # Formular login
    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=15000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(email)
    slow(page, 300)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    slow(page, 300)

    login_form.get_by_role("button", name=re.compile(r"AUTENTIFICARE", re.I)).click()

    # Așteaptă să iasă de pe /auth
    try:
        expect(page).not_to_have_url(AUTH_URL_RE, timeout=20000)
    except Exception:
        expect(login_form).not_to_be_visible(timeout=20000)

    slow(page, 1200)
    page.keyboard.press("Escape")
    slow(page, 300)

    return email, password

# Funcție pentru a deschide meniul de utilizator
def open_user_menu(page: Page):
    # 1. Deschide meniul de utilizator
    avatar_btn = page.locator("button").filter(has=page.locator("text=/^[A-Z]{1,3}$/")).first
    if avatar_btn.count() > 0 and avatar_btn.is_visible():
        avatar_btn.click()
        slow(page, 600)
        return

    # 2. Încearcă textul „Salut, Nume”
    salut = page.locator("text=/Salut,/i").first
    if salut.count() > 0 and salut.is_visible():
        salut.click()
        slow(page, 600)
        return

    # 3. Încearcă numele complet al utilizatorului
    name_loc = page.get_by_text("Test User", exact=True)
    if name_loc.count() == 0:
        name_loc = page.get_by_text("Test test", exact=True)

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
        raise AssertionError("Nu pot deschide meniul user (nu găsesc avatar/nume vizibil).")

    target.click()
    slow(page, 600)

# Test pentru a reîncărca datele profilului după înregistrare și login
def test_register_login_profile_refresh_ui(page: Page):
    page.set_default_timeout(30000)

    # 1. Register + login
    register_and_login(page)

    # 2. Deschide meniul și apasă „Profil”
    open_user_menu(page)

    profil_btn = page.get_by_text("Profil", exact=True).first
    expect(profil_btn).to_be_visible(timeout=10000)
    slow(page, 350)
    profil_btn.click()
    slow(page, 1200)

    # Confirmare profil
    expect(page).to_have_url(re.compile(r".*/profile.*"), timeout=20000)
    heading = page.get_by_role("heading", name=re.compile(r"^Profil$", re.I))
    if heading.count() > 0:
        expect(heading.first).to_be_visible(timeout=20000)

    slow(page, 900)

    # 3. Click pe „Reîncarcă”
    reincarca = page.get_by_role("button", name=re.compile(r"^Reîncarcă$", re.I))
    if reincarca.count() == 0:
        reincarca = page.locator("button:has-text('Reincarca'), button:has-text('Reîncarcă')")

    expect(reincarca.first).to_be_visible(timeout=15000)
    reincarca.first.scroll_into_view_if_needed()
    slow(page, 450)

    # Așteaptă răspunsul după click
    reincarca.first.click(force=True)
    slow(page, 1400)

    # Verificare minimă: suntem tot pe pagina Profil
    expect(page).to_have_url(re.compile(r".*/profile.*"), timeout=20000)
    expect(page.locator("text=/^Email$/i").first).to_be_visible(timeout=20000)
