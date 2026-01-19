# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect
import time # pentru timestamp

BASE_UI = "https://unievent-14dq.onrender.com"

# Test pentru înregistrare și login prin UI
def test_register_and_login_ui(page: Page):
    page.set_default_timeout(15000)

    unique_ts = str(int(time.time())) # timestamp pentru unicitate
    email = f"test_{unique_ts}@gmail.com"
    password = "Test1234!"

    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    page.wait_for_timeout(1000)

    # ---- NAVIGARE LA REGISTER ----
    page.locator("span", has_text="Înregistrează-te").first.click()
    page.wait_for_timeout(1000)

    # ---- REGISTER ----
    register_h1 = page.get_by_role("heading", name="Înregistrează-te")
    expect(register_h1).to_be_visible(timeout=10000)

    register_form = register_h1.locator("xpath=ancestor::form[1]")
    expect(register_form).to_be_visible(timeout=10000)

    register_form.locator('input[placeholder="Nume"]').fill("Test")
    page.wait_for_timeout(500)

    register_form.locator('input[placeholder="Prenume"]').fill("User")
    page.wait_for_timeout(500)

    register_form.locator('input[placeholder="Ex: student@usv.ro"]').fill(email)
    page.wait_for_timeout(700)

    register_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    page.wait_for_timeout(700)

    register_form.locator('input[placeholder="Confirmă parola"]').fill(password)
    page.wait_for_timeout(700)

    register_form.get_by_role("button", name="CREEAZĂ CONT").click()
    page.wait_for_timeout(2000)

    # ---- LOGIN ----
    login_h1 = page.get_by_role("heading", name="Bine ai revenit!")
    expect(login_h1).to_be_visible(timeout=15000)

    login_form = login_h1.locator("xpath=ancestor::form[1]")
    expect(login_form).to_be_visible(timeout=10000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(email)
    page.wait_for_timeout(700)

    login_form.locator('input[placeholder="Introduceți parola"]').fill(password)
    page.wait_for_timeout(700)

    login_form.get_by_role("button", name="AUTENTIFICARE").click()
    page.wait_for_timeout(2000)

    expect(page).not_to_have_url("**/auth", timeout=15000)
    expect(page.get_by_role("heading", name="Evenimente USV")).to_be_visible(timeout=15000)
