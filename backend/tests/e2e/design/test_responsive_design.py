# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"
EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"

# Login ca organizator
def _login_as_organizer(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")

    login_h1 = page.get_by_role("heading", name="Bine ai revenit!")
    expect(login_h1).to_be_visible(timeout=15000)

    login_form = login_h1.locator("xpath=ancestor::form[1]")
    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    expect(page).not_to_have_url("**/auth", timeout=20000)
    expect(page.get_by_role("heading", name="Panou Organizator")).to_be_visible(timeout=20000)

    page.keyboard.press("Escape") # închide eventuale modale


# Verifică că nu există scrollbar orizontal
def _assert_no_horizontal_scroll(page: Page):
    has_h_scroll = page.evaluate(
        "() => document.documentElement.scrollWidth > document.documentElement.clientWidth"
    )
    assert has_h_scroll is False, "Layout-ul are overflow orizontal (scrollbar pe orizontal)."

# Testează designul responsive după autentificare
def test_responsive_after_login(page: Page):
    page.set_default_timeout(15000)

    # Login o dată (desktop default)
    page.set_viewport_size({"width": 1366, "height": 768})
    _login_as_organizer(page)

    viewports = [
        ("desktop", 1366, 768),
        ("tablet", 768, 1024),
        ("mobile", 390, 844),
    ]

    for name, w, h in viewports:
        page.set_viewport_size({"width": w, "height": h})
        page.wait_for_timeout(300)  # puțin timp să se rearanjeze

        # verifică că e logat și pe dimensiunea asta
        expect(page).not_to_have_url("**/auth", timeout=10000)
        expect(page.get_by_role("heading", name="Panou Organizator")).to_be_visible(timeout=10000)

        _assert_no_horizontal_scroll(page) # verifică să nu existe scrollbar orizontal

        # verifică că meniul de navigare e vizibil
        nav = page.get_by_role("navigation")
        if nav.count() > 0:
            expect(nav.first).to_be_visible(timeout=5000)
