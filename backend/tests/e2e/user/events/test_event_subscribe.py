# biblioteci playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect
import time # pentru timestamp unic
import re

BASE_UI = "http://localhost:5173"
TARGET_TITLE = "Testare" 

# Funcție de așteptare lentă
def slow(page: Page, ms=650):
    page.wait_for_timeout(ms)

# Funcție pentru înregistrare și login
def register_and_login(page: Page):
    unique_ts = str(int(time.time()))
    email = f"test_{unique_ts}@gmail.com"
    password = "Test1234!"

    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    slow(page, 900)

    page.locator("span", has_text=re.compile(r"Înregistrează-te", re.I)).first.click()
    slow(page, 900)

    register_form = page.get_by_role("heading", name=re.compile(r"Înregistrează-te", re.I)) \
        .locator("xpath=ancestor::form[1]")
    expect(register_form).to_be_visible(timeout=15000)

    register_form.locator('input[placeholder="Nume"]').fill("Test")
    slow(page, 350)
    register_form.locator('input[placeholder="Prenume"]').fill("User")
    slow(page, 350)
    register_form.locator('input[placeholder="Ex: student@usv.ro"]').fill(email)
    slow(page, 500)
    register_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    slow(page, 500)
    register_form.locator('input[placeholder="Confirmă parola"]').fill(password)
    slow(page, 500)

    register_form.get_by_role("button", name=re.compile(r"CREEAZĂ CONT", re.I)).click()
    slow(page, 1600)

    login_form = page.get_by_role("heading", name=re.compile(r"Bine ai revenit!", re.I)) \
        .locator("xpath=ancestor::form[1]")
    expect(login_form).to_be_visible(timeout=15000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(email)
    slow(page, 450)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    slow(page, 450)

    login_form.get_by_role("button", name=re.compile(r"AUTENTIFICARE", re.I)).click()
    slow(page, 2000)

    expect(page).not_to_have_url(re.compile(r".*/auth.*"), timeout=20000)

# Funcție pentru a deschide detaliile unui eveniment
def open_event_details(page: Page):
    title = page.locator(f"text={TARGET_TITLE}").first
    expect(title).to_be_visible(timeout=30000)
    slow(page, 600)

    # Găsește cardul evenimentului țintă
    card = title.locator(
        f"xpath=ancestor::div[.//text()[normalize-space()='{TARGET_TITLE}']]"
        f"[.//*[contains(.,'Vezi Detalii') or contains(.,'Detalii')]][1]"
    )
    expect(card).to_be_visible(timeout=20000)

    # Apasă butonul „Vezi Detalii” sau „Detalii”
    details_btn = card.locator(
        "button:has-text('Vezi Detalii'), a:has-text('Vezi Detalii'), "
        "button:has-text('Detalii'), a:has-text('Detalii')"
    ).first

    details_btn.scroll_into_view_if_needed()
    slow(page, 300)
    details_btn.click(force=True)
    slow(page, 1200)

# Test pentru înregistrare, login, înscriere la eveniment și verificare
def test_register_login_subscribe_and_verify_inscris(page: Page):
    page.set_default_timeout(30000)

    # 1. Register + login
    register_and_login(page)

    # 2. Deschide detalii
    open_event_details(page)

    # 3. Apasă „Înscrie-te”
    inscrie_btn = page.locator("text=/^Înscrie-te$/i").first
    expect(inscrie_btn).to_be_visible(timeout=20000)
    slow(page, 350)
    inscrie_btn.click(force=True)
    slow(page, 1400)
