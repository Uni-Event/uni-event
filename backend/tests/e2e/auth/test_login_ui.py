# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

# Test pentru a verifica autentificarea cu email și parolă prin UI
def test_login_with_email_and_password(page: Page):
    page.goto("https://unievent-14dq.onrender.com/auth", wait_until="domcontentloaded")

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill("test@gmail.com")
    login_form.locator('input[placeholder="Introduceți parola"]').fill("Test1234!")

    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    expect(page).not_to_have_url("https://unievent-14dq.onrender.com/auth")
