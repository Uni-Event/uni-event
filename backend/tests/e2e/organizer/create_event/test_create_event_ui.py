# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect 
# biblioteci pentru manipulare dată și timp
from datetime import datetime, timedelta
# bibliotecă Playwright pentru gestionare erori
from playwright.sync_api import Error as PlaywrightError

BASE_UI = "http://localhost:5173"
EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"

# Completează câmpurile de dată/oră cu un format acceptat de UI
def _fill_dates_ui_format(page: Page):
    start_dt = (datetime.now() + timedelta(days=2)).replace(second=0, microsecond=0)
    end_dt = start_dt + timedelta(hours=2)

    # formatul UI: dd.mm.yyyy HH:MM
    start_str = start_dt.strftime("%d.%m.%Y %H:%M")
    end_str = end_dt.strftime("%d.%m.%Y %H:%M")

    dt_inputs = page.locator('input[placeholder^="zz.ll.aaaa"]')
    if dt_inputs.count() >= 2:
        dt_inputs.nth(0).click()
        dt_inputs.nth(0).press("Control+A")
        dt_inputs.nth(0).type(start_str, delay=20)
        dt_inputs.nth(0).blur()

        dt_inputs.nth(1).click()
        dt_inputs.nth(1).press("Control+A")
        dt_inputs.nth(1).type(end_str, delay=20)
        dt_inputs.nth(1).blur()

        # Verifică că nu sunt invalide
        expect(dt_inputs.nth(0)).not_to_have_css("border-color", "rgb(255, 0, 0)", timeout=1000)
    else:
        # Fallback: încearcă formatul datetime-local
        dt_local = page.locator('input[type="datetime-local"]')
        if dt_local.count() >= 2:
            dt_local.nth(0).fill(start_dt.strftime("%Y-%m-%dT%H:%M"))
            dt_local.nth(1).fill(end_dt.strftime("%Y-%m-%dT%H:%M"))

# Login ca organizator
def _login_as_organizer(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=15000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    expect(page).not_to_have_url("**/auth", timeout=20000)
    page.keyboard.press("Escape")

# Apasă butonul '+' din sidebar (stânga sus)
def _click_left_sidebar_top_button(page: Page):
    buttons = page.query_selector_all("button")
    candidates = []
    for b in buttons:
        try:
            if not b.is_visible():
                continue
            box = b.bounding_box()
            if not box:
                continue
            if box["x"] <= 160:
                candidates.append((box["x"], box["y"], b))
        except Exception:
            continue

    if not candidates:
        raise AssertionError("Nu am găsit butonul '+' din sidebar (niciun buton vizibil în stânga).")

    candidates.sort(key=lambda t: (t[0], t[1]))
    candidates[0][2].click()

# Selectează prima opțiune validă (nu placeholder) dintr-un <select>
def _select_first_real_option(select_locator):
    options = select_locator.locator("option")
    for i in range(options.count()):
        opt = options.nth(i)
        val = opt.get_attribute("value")
        txt = (opt.inner_text() or "").strip().lower()
        if val and val.strip() and "alege" not in txt and "select" not in txt:
            select_locator.select_option(val)
            return
    raise AssertionError("Nu am găsit o opțiune validă în dropdown (doar placeholder).")

# Tastează ca un utilizator real (scroll, click, delay)
def _type_like_user(locator, value: str):
    locator.scroll_into_view_if_needed()
    expect(locator).to_be_visible(timeout=15000)
    locator.click()
    locator.press("Control+A")
    locator.type(value, delay=20)
    locator.blur()

# Alege categoria WORKSHOP
def _pick_category_workshop(page: Page):
    cat_section = page.get_by_text("Categorie", exact=False).locator("xpath=ancestor::*[1]")
    workshop = cat_section.locator("text=WORKSHOP").first
    expect(workshop).to_be_visible(timeout=15000)
    workshop.click()

# Setează locația prin hartă sau adresă
def _set_location_via_map(page: Page):
    loc_name = page.locator('input[placeholder="Ex: Aula Corp A"]').first
    if loc_name.count() > 0 and loc_name.is_visible():
        _type_like_user(loc_name, "Aula Test")

    # încearcă să dai click pe hartă
    leaflet = page.locator(".leaflet-container").first
    if leaflet.count() > 0:
        leaflet.scroll_into_view_if_needed()
        expect(leaflet).to_be_visible(timeout=15000)
        leaflet.click(position={"x": 220, "y": 160})
        page.wait_for_timeout(200)
        return

    # fallback: completează adresa manual
    address = page.locator('input[placeholder*="Scrie adresa manual"]').first
    if address.count() > 0 and address.is_visible():
        _type_like_user(address, "Suceava, Str. Universității 13")

# Apasă Publică și verifică că s-a declanșat submit
def _click_publish_and_expect_submit(page: Page, modal_heading):
    publish_btn = page.get_by_role("button", name="Publică")
    expect(publish_btn).to_be_visible(timeout=15000)

    publish_btn.scroll_into_view_if_needed()
    page.wait_for_timeout(150)

    # Apasă forțat (în caz că e acoperit)
    publish_btn.click(force=True)
    page.wait_for_timeout(600)

    # Verificare: nu există câmpuri invalide
    invalid = page.locator(":invalid")
    if invalid.count() > 0:
        raise AssertionError("Nu a apăsat efectiv submit: browserul blochează (există :invalid).")

    # Verificare: modalul dispare sau apare mesaj de confirmare
    try:
        expect(modal_heading).not_to_be_visible(timeout=2000)
        return
    except Exception:
        pass

    # dacă încă e vizibil, caută un mesaj de confirmare
    confirm = page.locator("text=/administrator|validat|validare|în așteptare|trimis/i").first
    expect(confirm).to_be_visible(timeout=3000)

# Test pentru crearea unui eveniment prin UI
def test_create_event_ui(page: Page):
    page.set_default_timeout(15000)
    _login_as_organizer(page)

    expect(page.get_by_role("heading", name="Panou Organizator")).to_be_visible(timeout=20000)

    _click_left_sidebar_top_button(page)

    modal_heading = page.get_by_role("heading", name="Creează Eveniment")
    expect(modal_heading).to_be_visible(timeout=20000)

    # Titlu
    title = page.locator('input[placeholder="ex. Hackathon Suceava"]').first
    expect(title).to_be_visible(timeout=15000)
    event_title = f"Test Event {datetime.now().strftime('%H%M%S')}"
    title.fill(event_title)

    # Locuri
    seats = page.get_by_text("Locuri Disp.", exact=False).locator("xpath=ancestor::*[1]//input").first
    if seats.count() > 0:
        _type_like_user(seats, "10")

    # Descriere
    desc = page.locator('textarea[placeholder="Despre ce este evenimentul..."]').first
    expect(desc).to_be_visible(timeout=15000)
    desc.fill("Eveniment creat automat din Playwright (test UI).")

    # Categorie
    _pick_category_workshop(page)

    # Date/ore
    _fill_dates_ui_format(page)

    # Facultate
    facultate_select = page.get_by_text("Facultate", exact=False).locator("xpath=ancestor::*[1]//select").first
    if facultate_select.count() > 0 and facultate_select.is_visible():
        _select_first_real_option(facultate_select)

    # Locație + click hartă
    _set_location_via_map(page)

    # Publicare
    _click_publish_and_expect_submit(page, modal_heading)
