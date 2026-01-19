# biblioteci playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect
import time # pentru timestamp unic
import re # pentru regex
import random # pentru randomizare pauze

BASE_UI = "https://unievent-14dq.onrender.com"
TARGET_TITLE = "Testare"

# Funcție de pauză cu durată aleatoare
def pause(page: Page, min_ms=220, max_ms=520):
    page.wait_for_timeout(random.randint(min_ms, max_ms))

# Funcție pentru înregistrare și login
def register_and_login(page: Page):
    unique_ts = str(int(time.time()))
    email = f"test_{unique_ts}@gmail.com"
    password = "Test1234!"

    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    pause(page, 450, 750)

    page.locator("span", has_text=re.compile(r"Înregistrează-te", re.I)).first.click()
    pause(page, 450, 750)

    register_form = (
        page.get_by_role("heading", name=re.compile(r"Înregistrează-te", re.I))
        .locator("xpath=ancestor::form[1]")
    )
    expect(register_form).to_be_visible(timeout=15000)

    register_form.locator('input[placeholder="Nume"]').fill("Test")
    pause(page)
    register_form.locator('input[placeholder="Prenume"]').fill("User")
    pause(page)
    register_form.locator('input[placeholder="Ex: student@usv.ro"]').fill(email)
    pause(page, 350, 650)
    register_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    pause(page)
    register_form.locator('input[placeholder="Confirmă parola"]').fill(password)
    pause(page, 350, 650)

    register_form.get_by_role("button", name=re.compile(r"CREEAZĂ CONT", re.I)).click()
    pause(page, 900, 1400)

    login_form = (
        page.get_by_role("heading", name=re.compile(r"Bine ai revenit!", re.I))
        .locator("xpath=ancestor::form[1]")
    )
    expect(login_form).to_be_visible(timeout=15000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(email)
    pause(page, 350, 650)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    pause(page, 350, 650)

    login_form.get_by_role("button", name=re.compile(r"AUTENTIFICARE", re.I)).click()

    expect(page).not_to_have_url(re.compile(r".*/auth.*"), timeout=20000)
    pause(page, 900, 1400)

# Funcție pentru a deschide detaliile unui eveniment
def open_event_details(page: Page):
    title = page.locator(f"text={TARGET_TITLE}").first
    expect(title).to_be_visible(timeout=30000)
    pause(page, 400, 800)

    # Caută cardul evenimentului
    card = title.locator(
        f"xpath=ancestor::div[.//text()[normalize-space()='{TARGET_TITLE}']]"
        f"[.//*[contains(.,'Vezi Detalii') or contains(.,'Detalii')]][1]"
    ).first
    expect(card).to_be_visible(timeout=20000)

    # Apasă pe "Vezi Detalii"
    details_btn = card.locator("button:has-text('Vezi Detalii'), a:has-text('Vezi Detalii')").first
    details_btn.scroll_into_view_if_needed()
    pause(page, 250, 500)
    details_btn.click(force=True)

    # Așteaptă modalul de detalii
    expect(page.locator("text=/Înscrie-te|Închide/i").first).to_be_visible(timeout=20000)
    pause(page, 700, 1100)

# Funcție pentru a naviga la pagina "My Tickets"
def go_to_my_tickets(page: Page):
    pause(page, 550, 950)

    page.goto(f"{BASE_UI}/my-tickets", wait_until="domcontentloaded")
    expect(page).to_have_url(re.compile(r".*/my-tickets.*"), timeout=20000)

    pause(page, 900, 1400)

# Funcție pentru a aștepta apariția biletului
def wait_ticket_appears(page: Page, title_text: str):
    # Verificare: suntem pe pagina My Tickets
    expect(page.locator("text=/My Tickets|Biletele\\s+tale\\s+pentru\\s+evenimente/i").first).to_be_visible(timeout=20000)

    # Așteaptă să apară titlul evenimentului
    expect(page.locator(f"text={title_text}").first).to_be_visible(timeout=30000)
    pause(page, 650, 1100)

# Funcție pentru a extinde detaliile biletului
def expand_ticket_for_event(page: Page, title_text: str):
    title = page.locator(f"text={title_text}").first
    expect(title).to_be_visible(timeout=20000)

    row = title.locator("xpath=ancestor::div[1]").first
    row.scroll_into_view_if_needed()
    pause(page, 300, 600)

    # Apasă pe chevron sau pe titlu pentru a extinde
    chevron = row.locator("button").last
    if chevron.count() > 0 and chevron.is_visible():
        chevron.click(force=True)
    else:
        title.click(force=True)

    # Așteaptă să apară butonul Vezi QR
    expect(page.locator("button:has-text('Vezi QR')").first).to_be_visible(timeout=20000)
    pause(page, 650, 1100)

# Funcție pentru a da click pe Vezi QR și a verifica afișarea codului QR
def click_vezi_qr(page: Page):
    vezi_qr = page.locator("button:has-text('Vezi QR')").first
    expect(vezi_qr).to_be_visible(timeout=20000)

    pause(page, 300, 650)
    vezi_qr.click(force=True)

    expect(page.locator("text=/Bilet\\s*-\\s*QR/i").first).to_be_visible(timeout=20000)
    expect(page.locator(f"text={TARGET_TITLE}").first).to_be_visible(timeout=20000)

    pause(page, 1400, 2200)

# Test principal pentru înregistrare, login, înscriere la eveniment și vizualizare cod QR al biletului
def test_register_login_subscribe_then_open_ticket_qr(page: Page):
    page.set_default_timeout(30000)

    register_and_login(page)

    open_event_details(page)

    inscrie_btn = page.locator("text=/^Înscrie-te$/i").first
    expect(inscrie_btn).to_be_visible(timeout=20000)
    pause(page, 300, 650)
    inscrie_btn.click(force=True)

    pause(page, 850, 1300)

    go_to_my_tickets(page)

    wait_ticket_appears(page, TARGET_TITLE)

    expand_ticket_for_event(page, TARGET_TITLE)

    click_vezi_qr(page)
