import re
import time # pentru timestamp
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "https://unievent-14dq.onrender.com"
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
    slow(page, 850)

    # Navigare la Register
    page.locator("span", has_text=re.compile(r"Înregistrează-te", re.I)).first.click()
    slow(page, 900)

    # Register form
    register_form = (
        page.get_by_role("heading", name=re.compile(r"Înregistrează-te", re.I))
        .locator("xpath=ancestor::form[1]")
    )
    expect(register_form).to_be_visible(timeout=15000)

    register_form.locator('input[placeholder="Nume"]').fill("Test")
    slow(page, 300)
    register_form.locator('input[placeholder="Prenume"]').fill("User")
    slow(page, 300)
    register_form.locator('input[placeholder="Ex: student@usv.ro"]').fill(email)
    slow(page, 450)
    register_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    slow(page, 450)
    register_form.locator('input[placeholder="Confirmă parola"]').fill(password)
    slow(page, 450)

    register_form.get_by_role("button", name=re.compile(r"CREEAZĂ CONT", re.I)).click()
    slow(page, 1600)

    # Login form
    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=15000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(email)
    slow(page, 300)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    slow(page, 300)
    login_form.get_by_role("button", name=re.compile(r"AUTENTIFICARE", re.I)).click()
    slow(page, 1500)

    # Confirmare că am ieșit de pe /auth
    expect(page).not_to_have_url(re.compile(r".*/auth.*"), timeout=20000)

    # Asigură-te că ești pe pagina de evenimente
    expect(page.locator("text=/Evenimente\\s+USV/i").first).to_be_visible(timeout=20000)
    slow(page, 700)

    # Închide eventuale overlay-uri
    page.keyboard.press("Escape")
    slow(page, 250)

    return email, password

# Funcție pentru a deschide meniul de utilizator
def open_user_menu(page: Page):
    # 1. Deschide meniul de utilizator
    avatar_btn = page.locator("button").filter(
        has=page.locator("text=/^[A-Z]{1,3}$/")
    ).first
    if avatar_btn.count() > 0 and avatar_btn.is_visible():
        avatar_btn.click()
        slow(page, 550)
        return

    # 2. Încearcă textul „Salut, Nume”
    salut = page.locator("text=/Salut,/i").first
    if salut.count() > 0 and salut.is_visible():
        salut.click()
        slow(page, 550)
        return

    raise AssertionError("Nu pot deschide meniul user (nu găsesc avatar sau 'Salut,').")

# Navighează la pagina Profil
def go_to_profile(page: Page):
    open_user_menu(page)

    profil_btn = page.get_by_text("Profil", exact=True).first
    expect(profil_btn).to_be_visible(timeout=10000)
    slow(page, 350)
    profil_btn.click()
    slow(page, 1200)

    expect(page).to_have_url(re.compile(r".*/profile.*"), timeout=20000)

    heading = page.get_by_role("heading", name=re.compile(r"^Profil$", re.I))
    if heading.count() > 0:
        expect(heading.first).to_be_visible(timeout=20000)

    slow(page, 700)

# Completează și trimite cererea de organizator
def fill_and_submit_organizer_request(page: Page):
    section_title = page.locator("text=/DEVINO\\s+ORGANIZATOR/i").first
    expect(section_title).to_be_visible(timeout=20000)

    # Derulează la secțiunea de organizator
    section_title.scroll_into_view_if_needed()
    slow(page, 700)

    # Input "Nume organizație"
    org_name = page.locator(
        'input[placeholder^="Ex: Liga Studenților"], input[placeholder*="Liga Studenților"]'
    ).first
    if org_name.count() == 0:
        org_name = page.locator(
            "xpath=//*[normalize-space()='Nume organizație']/following::input[1]"
        ).first

    expect(org_name).to_be_visible(timeout=20000)
    org_name.click()
    slow(page, 250)
    org_name.fill("Liga Studenților USV")
    slow(page, 450)

    # Input "Detalii"
    details = page.locator(
        "textarea[placeholder^='Spune pe scurt'], textarea[placeholder*='Spune pe scurt']"
    ).first
    if details.count() == 0:
        details = page.locator(
            "xpath=//*[normalize-space()='Detalii']/following::textarea[1]"
        ).first

    expect(details).to_be_visible(timeout=20000)
    details.click()
    slow(page, 250)
    details.fill(
        "Sunt student și vreau să public și să gestionez evenimente pentru colegi "
        "(workshopuri, prezentări, întâlniri)."
    )
    slow(page, 650)

    # Click "Trimite cererea"
    submit_btn = page.get_by_role("button", name=re.compile(r"^Trimite cererea$", re.I))
    if submit_btn.count() == 0:
        submit_btn = page.locator("button:has-text('Trimite cererea')").first

    expect(submit_btn).to_be_visible(timeout=20000)
    submit_btn.scroll_into_view_if_needed()
    slow(page, 450)

    submit_btn.click(force=True)
    slow(page, 1500)

    # Verificare: mesaj de confirmare și revenire pe pagina Profil
    expect(page).to_have_url(re.compile(r".*/profile.*"), timeout=20000)
    expect(page.locator("text=/DEVINO\\s+ORGANIZATOR/i").first).to_be_visible(timeout=20000)

# Test pentru a trimite o cerere de organizator după înregistrare și login
def test_profile_send_organizer_request_ui(page: Page):
    page.set_default_timeout(30000)

    register_and_login(page)
    go_to_profile(page)
    fill_and_submit_organizer_request(page)
