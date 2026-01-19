# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect
# biblioteci pentru manipulare dată/ora
from datetime import datetime, timedelta

BASE_UI = "https://unievent-14dq.onrender.com"

EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"


# Login ca organizator
def _login_as_organizer(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=10000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    expect(page).not_to_have_url("**/auth", timeout=15000)
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
    count = options.count()
    for i in range(count):
        val = options.nth(i).get_attribute("value")
        txt = (options.nth(i).inner_text() or "").strip().lower()
        if val and val.strip() and "alege" not in txt and "select" not in txt:
            select_locator.select_option(val)
            return
    raise AssertionError("Nu am găsit o opțiune validă în dropdown (doar placeholder).")


# Deschide modalul de creare eveniment
def _open_create_event_modal(page: Page):
    expect(page.get_by_role("heading", name="Panou Organizator")).to_be_visible(timeout=15000)
    _click_left_sidebar_top_button(page)

    modal_heading = page.get_by_role("heading", name="Creează Eveniment")
    expect(modal_heading).to_be_visible(timeout=15000)
    return modal_heading

# Tastează ca un utilizator real (scroll, click, delay)
def _type_like_user(locator, value: str, delay: int = 60):
    locator.scroll_into_view_if_needed()
    expect(locator).to_be_visible(timeout=15000)
    locator.click()
    locator.press("Control+A")
    locator.type(value, delay=delay)
    locator.blur()
    locator.page.wait_for_timeout(250)

# Completează datele în format corect
def _fill_dates_in_correct_format(page: Page):
    start_dt = (datetime.now() + timedelta(days=2)).replace(second=0, microsecond=0)
    end_dt = start_dt + timedelta(hours=2)

    # 1. încercare: câmpuri cu placeholder de tip dată locală
    ui_dt = page.locator('input[placeholder^="zz.ll.aaaa"]')
    if ui_dt.count() >= 2:
        start_str = start_dt.strftime("%d.%m.%Y %H:%M")
        end_str = end_dt.strftime("%d.%m.%Y %H:%M")

        _type_like_user(ui_dt.nth(0), start_str)
        _type_like_user(ui_dt.nth(1), end_str)
        return

    # 2. încercare: câmpuri de tip datetime-local
    dt_local = page.locator('input[type="datetime-local"]')
    if dt_local.count() >= 2:
        dt_local.nth(0).click()
        dt_local.nth(0).fill(start_dt.strftime("%Y-%m-%dT%H:%M"))
        dt_local.nth(0).blur()
        page.wait_for_timeout(250)

        dt_local.nth(1).click()
        dt_local.nth(1).fill(end_dt.strftime("%Y-%m-%dT%H:%M"))
        dt_local.nth(1).blur()
        page.wait_for_timeout(250)

# Selectează categoria WORKSHOP
def _pick_category_workshop(page: Page):
    # încercare 1: role=button
    chip = page.get_by_role("button", name="WORKSHOP")
    if chip.count() > 0 and chip.first.is_visible():
        chip.first.click()
        page.wait_for_timeout(300)
        return

    # încercare 2: text exact
    txt = page.get_by_text("WORKSHOP", exact=True)
    if txt.count() > 0 and txt.first.is_visible():
        txt.first.click()
        page.wait_for_timeout(300)
        return

    raise AssertionError("Nu am găsit categoria WORKSHOP. Dacă s-a schimbat UI-ul, actualizează locatorul.")

# Setează locația obligatorie (nume + click pe hartă)
def _set_location_required(page: Page):
    loc_name = page.locator('input[placeholder="Ex: Aula Corp A"]').first
    if loc_name.count() > 0 and loc_name.is_visible():
        _type_like_user(loc_name, "Aula Test")

    # încearcă să dai click pe hartă
    leaflet = page.locator(".leaflet-container").first
    if leaflet.count() == 0:
        raise AssertionError("Nu am găsit harta (.leaflet-container). Dacă e obligatorie, publish-ul va fi blocat.")

    # fallback: completează adresa manual
    leaflet.scroll_into_view_if_needed()
    expect(leaflet).to_be_visible(timeout=15000)
    leaflet.click(position={"x": 220, "y": 160})
    page.wait_for_timeout(400)


# Apasă Publică și verifică că rămânem în modal (adică nu a mers)
def _publish_and_expect_still_in_modal(page: Page, modal_heading):
    publish_btn = page.get_by_role("button", name="Publică")
    expect(publish_btn).to_be_visible(timeout=10000)
    publish_btn.scroll_into_view_if_needed()
    publish_btn.click()

    page.wait_for_timeout(600)
    expect(modal_heading).to_be_visible(timeout=8000)


# Apasă Publică și verifică că a mers (minimal)
def _publish_and_expect_success(page: Page, modal_heading):
    publish_btn = page.get_by_role("button", name="Publică")
    expect(publish_btn).to_be_visible(timeout=10000)
    publish_btn.scroll_into_view_if_needed()
    publish_btn.click()

    # așteaptă puțin pentru submit
    try:
        expect(modal_heading).not_to_be_visible(timeout=15000)
        return
    except Exception:
        pass

    # dacă încă e vizibil, caută un mesaj de confirmare
    confirm = page.locator("text=/administrator|validat|validare|în așteptare|trimis/i").first
    expect(confirm).to_be_visible(timeout=15000)


# Test pentru validările la publicarea unui eveniment
def test_event_publish_validations_ui(page: Page):
    page.set_default_timeout(10000)
    _login_as_organizer(page)

    modal_heading = _open_create_event_modal(page)

    # Completează câmpurile obligatorii pas cu pas
    title = page.locator('input[placeholder="ex. Hackathon Suceava"]').first
    seats = page.get_by_text("Locuri Disp.", exact=False).locator("xpath=ancestor::*[1]//input").first
    desc = page.locator('textarea[placeholder="Despre ce este evenimentul..."]').first
    facultate_select = page.get_by_text("Facultate", exact=False).locator("xpath=ancestor::*[1]//select").first

    # 1. Niciun câmp completat -> trebuie să NU meargă
    _publish_and_expect_still_in_modal(page, modal_heading)

    # 2. Doar titlu completat -> trebuie să NU meargă
    expect(title).to_be_visible()
    _type_like_user(title, "Test doar titlu")
    _publish_and_expect_still_in_modal(page, modal_heading)

    # 3. Titlu + locuri completate -> trebuie să NU meargă
    if seats.count() > 0 and seats.is_visible():
        _type_like_user(seats, "10")
    _publish_and_expect_still_in_modal(page, modal_heading)
   
    # 4. Titlu + locuri + descriere completate -> trebuie să NU meargă
    _type_like_user(desc, "Descriere ok, dar lipsesc datele.")
    if seats.count() > 0 and seats.is_visible():
        seats.click()
        seats.press("Control+A")
        seats.type("", delay=60)
        seats.blur()
        page.wait_for_timeout(250)
    _publish_and_expect_still_in_modal(page, modal_heading)

    # 5. Titlu + locuri + descriere + categorie -> trebuie să NU meargă
    _pick_category_workshop(page)
    _publish_and_expect_still_in_modal(page, modal_heading)

    # 6. Titlu + locuri + descriere + categorie + date -> trebuie să NU meargă
    _fill_dates_in_correct_format(page)
    _publish_and_expect_still_in_modal(page, modal_heading)

    # 7. Titlu + locuri + descriere + categorie + date + facultate -> trebuie să NU meargă
    if facultate_select.count() > 0 and facultate_select.is_visible():
        facultate_select.scroll_into_view_if_needed()
        facultate_select.click()
        page.wait_for_timeout(250)
        _select_first_real_option(facultate_select)
        page.wait_for_timeout(300)
    _publish_and_expect_still_in_modal(page, modal_heading)

    # 8. Toate câmpurile de mai sus + locație (nume + hartă) -> trebuie să meargă
    _set_location_required(page)
    _publish_and_expect_success(page, modal_heading)
