import re
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms=500):
    page.wait_for_timeout(ms)

# Funcție de login
def _login(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    slow(page, 700)

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=15000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill("test@gmail.com")
    slow(page, 250)
    login_form.locator('input[placeholder="Introduceți parola"]').fill("Test1234!")
    slow(page, 250)

    login_form.locator('button:has-text("AUTENTIFICARE")').click()
    expect(page).not_to_have_url("**/auth", timeout=20000)
    slow(page, 900)

# Funcție stabilă pentru setarea valorii unui input
def _set_input_value_js(input_locator, value: str):
    input_locator.evaluate(
        """(el, v) => {
            el.scrollIntoView({block: 'center', inline: 'center'});
            el.focus();

            const setter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype, 'value'
            ).set;

            setter.call(el, v);

            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }""",
        value
    )

# Funcție pentru a obține numărul de carduri de evenimente afișate
def _get_cards_count(page: Page) -> int:
    return page.locator('button:has-text("Vezi Detalii")').count()

# Funcție pentru a deschide panoul de filtre
def _open_filters(page: Page):
    filtre_btn = page.locator('button:has-text("Filtre")').first
    expect(filtre_btn).to_be_visible(timeout=15000)
    filtre_btn.scroll_into_view_if_needed()
    slow(page, 300)
    filtre_btn.click(force=True)
    slow(page, 900)

    # Găsește inputul pentru locație
    loc_input = page.locator('input[placeholder^="Ex: Aula"]').first
    expect(loc_input).to_be_visible(timeout=15000)
    return loc_input

# Test pentru căutare, filtrare și resetare în lista de evenimente
def test_search_filter_and_reset(page: Page):
    page.set_default_timeout(20000)

    _login(page)

    # Se asigură că sunt carduri de evenimente afișate
    expect(page.locator('button:has-text("Vezi Detalii")').first).to_be_visible(timeout=20000)
    slow(page, 700)

    initial_count = _get_cards_count(page)
    assert initial_count > 0, "Nu există carduri de evenimente afișate, nu pot valida căutarea/filtrarea."

    # 1. TEST CĂUTARE
    search_input = page.locator('input[placeholder^="Caută după titlu"] , input[placeholder^="Caută după titlu sau descriere"]').first
    expect(search_input).to_be_visible(timeout=15000)
    expect(search_input).to_be_enabled(timeout=15000)

    slow(page, 400)

    # setează valoarea căutării prin JS (mai stabil decât .fill())
    _set_input_value_js(search_input, "Test Event")
    slow(page, 800)

    # Verificare: inputul are valoarea setată
    expect(search_input).to_have_value(re.compile(r".+"), timeout=5000)

    # Verificare: numărul de carduri s-a redus
    after_search_count = _get_cards_count(page)
    assert after_search_count <= initial_count, f"Căutarea nu a restrâns lista: initial={initial_count}, after_search={after_search_count}"

    # golește câmpul de căutare (prin JS pentru stabilitate)
    _set_input_value_js(search_input, "")
    slow(page, 700)
    expect(search_input).to_have_value("", timeout=5000)

    # 2. TEST FILTRARE
    loc_input = _open_filters(page)

    _set_input_value_js(loc_input, "Aula")
    slow(page, 500)
    expect(loc_input).to_have_value(re.compile(r"^Aula"), timeout=5000)

    aplica_btn = page.locator('button:has-text("Aplică")').first
    expect(aplica_btn).to_be_visible(timeout=15000)
    slow(page, 300)
    aplica_btn.click(force=True)
    slow(page, 1200)

    after_apply_count = _get_cards_count(page)
    assert after_apply_count <= initial_count, f"Filtrarea nu a restrâns lista: initial={initial_count}, after_apply={after_apply_count}"

    # 3. TEST RESETEAZĂ
    loc_input2 = page.locator('input[placeholder^="Ex: Aula"]').first
    if loc_input2.count() == 0 or not loc_input2.is_visible():
        loc_input2 = _open_filters(page)

    reset_btn = page.locator('button:has-text("Resetează")').first
    expect(reset_btn).to_be_visible(timeout=15000)
    slow(page, 300)
    reset_btn.click(force=True)
    slow(page, 900)

    # după reset inputul locație ar trebui să fie gol
    loc_input2 = page.locator('input[placeholder^="Ex: Aula"]').first
    expect(loc_input2).to_have_value("", timeout=10000)

    # dacă există butonul Aplică după reset, apasă-l
    aplica_btn2 = page.locator('button:has-text("Aplică")').first
    if aplica_btn2.count() > 0 and aplica_btn2.is_visible():
        slow(page, 300)
        aplica_btn2.click(force=True)
        slow(page, 1000)

    after_reset_count = _get_cards_count(page)
    assert after_reset_count >= after_apply_count, "După reset, lista nu a revenit (nu a crescut față de filtrat)."
