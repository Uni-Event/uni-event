# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect
import time # pentru timestamp
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

    register_form = page.get_by_role(
        "heading", name=re.compile(r"Înregistrează-te", re.I)
    ).locator("xpath=ancestor::form[1]")
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

    login_form = page.get_by_role(
        "heading", name=re.compile(r"Bine ai revenit!", re.I)
    ).locator("xpath=ancestor::form[1]")
    expect(login_form).to_be_visible(timeout=15000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(email)
    slow(page, 450)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    slow(page, 450)

    login_form.get_by_role("button", name=re.compile(r"AUTENTIFICARE", re.I)).click()
    slow(page, 1500)

    expect(page).not_to_have_url(re.compile(r".*/auth.*"), timeout=20000)
    # Verificare: suntem pe Home după login
    expect(page.locator("text=/Evenimente\\s+USV/i")).to_be_visible(timeout=20000)
    slow(page, 900)

# Obține cardul evenimentului după titlu
def get_event_card(page: Page, title_text: str):
    title = page.locator(f"text={title_text}").first
    expect(title).to_be_visible(timeout=20000)
    slow(page, 350)

    card = title.locator(
        f"xpath=ancestor::div[.//text()[normalize-space()='{title_text}']][.//*[contains(.,'Vezi Detalii')]][1]"
    ).first
    expect(card).to_be_visible(timeout=20000)
    return card

# Alege butonul inimă din card
def favorite_button_in_card(card):
    buttons = card.locator("button").filter(has_not=card.locator("text=/Vezi\\s+Detalii/i"))
    count = buttons.count()
    if count == 0:
        raise AssertionError("Nu găsesc niciun <button> în card (în afară de Vezi Detalii).")

    best = None
    best_score = None

    # Caută butonul cu cel mai bun scor (cel mai în stânga jos, dimensiuni rezonabile)
    for i in range(count):
        b = buttons.nth(i)
        try:
            if not b.is_visible():
                continue
            box = b.bounding_box()
            if not box:
                continue

            x = box["x"]
            y_bottom = box["y"] + box["height"]

            width = box["width"]
            height = box["height"]
            size_penalty = 0
            if width > 140 or height > 80:
                size_penalty = 2000

            score = (x * 1.0) - (y_bottom * 1.0) + size_penalty
            if best_score is None or score < best_score:
                best_score = score
                best = b
        except Exception:
            continue

    return best or buttons.first

# Funcție pentru a deschide pagina de Favorite
def open_favorites(page: Page):
    # 1. link din sidebar dacă există
    sidebar_fav = page.locator("a._navItem_reybs_61[href='/favorites']").first
    if sidebar_fav.count() > 0 and sidebar_fav.is_visible():
        sidebar_fav.click(force=True)
        expect(page).to_have_url(re.compile(r".*/favorites.*"), timeout=20000)
        slow(page, 1200)
        return

    # 2. link din meniul utilizatorului
    fav_links = page.locator("a[href='/favorites']")
    if fav_links.count() > 0:
        for i in range(fav_links.count()):
            el = fav_links.nth(i)
            try:
                if el.is_visible():
                    el.click(force=True)
                    expect(page).to_have_url(re.compile(r".*/favorites.*"), timeout=20000)
                    slow(page, 1200)
                    return
            except Exception:
                pass

        # fallback: primul link vizibil
        fav_links.first.click(force=True)
        expect(page).to_have_url(re.compile(r".*/favorites.*"), timeout=20000)
        slow(page, 1200)
        return

    # 3. fallback: navighează direct
    page.goto(f"{BASE_UI}/favorites", wait_until="domcontentloaded")
    expect(page).to_have_url(re.compile(r".*/favorites.*"), timeout=20000)
    slow(page, 1200)

# Funcție pentru a deschide detaliile evenimentului țintă din Favorite
def open_details_for_testare_in_favorites(page: Page):
    title = page.locator(f"text={TARGET_TITLE}").first
    expect(title).to_be_visible(timeout=20000)

    # Caută cardul care conține titlul și butonul "Vezi Detalii"
    card = title.locator(
        "xpath=ancestor::div[.//*[contains(normalize-space(),'Vezi Detalii')]][1]"
    ).first
    expect(card).to_be_visible(timeout=20000)
    card.scroll_into_view_if_needed()
    slow(page, 450)

    # Vezi Detalii
    vezi_detalii = card.locator("text=/^Vezi\\s+Detalii$/i").first
    expect(vezi_detalii).to_be_visible(timeout=20000)
    slow(page, 450)
    vezi_detalii.click(force=True)

    # Modalul de detalii
    expect(page.locator(f"text={TARGET_TITLE}").first).to_be_visible(timeout=20000)
    slow(page, 2000)

# Test principal pentru înregistrare, login și adăugare la favorite
def test_register_login_add_to_favorites(page: Page):
    page.set_default_timeout(30000)

    register_and_login(page)

    # Adaugă la Favorite din Home
    card = get_event_card(page, TARGET_TITLE)
    card.scroll_into_view_if_needed()
    slow(page, 600)

    fav_btn = favorite_button_in_card(card)
    expect(fav_btn).to_be_visible(timeout=15000)
    fav_btn.scroll_into_view_if_needed()
    slow(page, 350)

    fav_btn.click(force=True)
    slow(page, 900)  # așteaptă actualizarea UI

    # Deschide pagina de Favorite
    open_favorites(page)

    # Deschide detaliile pentru evenimentul țintă în Favorite
    open_details_for_testare_in_favorites(page)
