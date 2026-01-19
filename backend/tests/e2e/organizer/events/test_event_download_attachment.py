from pathlib import Path # for file operations
from urllib.parse import urljoin # to construct URLs
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect
import re

BASE_UI = "https://unievent-14dq.onrender.com"
BASE_MEDIA = "http://localhost:8000"

EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"

TARGET_TITLE = "Testare"
TARGET_FILE = "IP_Laborator_13_V9Avzqe.pdf"
# URL direct către fișierul atașat
DIRECT_FILE_URL = urljoin(BASE_MEDIA, f"/media/event_files/{TARGET_FILE}")

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms=450):
    page.wait_for_timeout(ms)

# Funcție de login
def login(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    slow(page, 700)

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=20000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    slow(page, 200)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    slow(page, 200)

    login_form.locator('button:has-text("AUTENTIFICARE")').click()
    expect(page).not_to_have_url("**/auth", timeout=20000)
    slow(page, 1200)

# Funcție pentru a deschide modalul de detalii al evenimentului
def open_event_details_modal(page: Page, title_text: str):
    title = page.locator(f"text={title_text}").first
    expect(title).to_be_visible(timeout=30000)
    slow(page, 300)

    card = title.locator(
        f"xpath=ancestor::div[.//text()[normalize-space()='{title_text}']][.//*[contains(normalize-space(),'Vezi Detalii')]][1]"
    )
    expect(card).to_be_visible(timeout=20000)

    vezi_detalii = card.locator("text=/^Vezi\\s+Detalii$/i").first
    expect(vezi_detalii).to_be_visible(timeout=20000)
    vezi_detalii.scroll_into_view_if_needed()
    slow(page, 200)
    vezi_detalii.click(force=True)
    slow(page, 900)

    # modal: conține Închide + Deschide + Descarcă
    expect(page.locator("text=/^Închide$/i").first).to_be_visible(timeout=20000)
    modal = page.locator(
        "xpath=(//div[.//text()[normalize-space()='Închide'] and "
        ".//text()[contains(normalize-space(),'Deschide')] and "
        ".//text()[contains(normalize-space(),'Descarcă')]])[last()]"
    )
    expect(modal).to_be_visible(timeout=20000)
    return modal

# Funcție pentru a descărca un fișier printr-o cerere HTTP directă
def download_via_request(page: Page, url: str, save_path: Path):
    resp = page.request.get(url, timeout=20000)
    assert resp.ok, f"Download request failed: {resp.status} {resp.status_text}"
    save_path.write_bytes(resp.body())
    assert save_path.exists(), f"Fișierul nu a fost salvat: {save_path}"
    assert save_path.stat().st_size > 0, f"Fișier salvat dar gol (0 bytes): {save_path}"

# Test pentru descărcarea atașamentului unui eveniment
def test_download_attachment_only(page: Page):
    page.set_default_timeout(30000)

    login(page)
    modal = open_event_details_modal(page, TARGET_TITLE)

    # confirmă că fișierul e prezent în UI
    expect(modal.locator(f"text={TARGET_FILE}").first).to_be_visible(timeout=20000)

    # apasă "Descarcă"
    descarca = modal.locator("text=/^Descarcă$/i").first
    expect(descarca).to_be_visible(timeout=20000)
    descarca.scroll_into_view_if_needed()
    slow(page, 250)
    descarca.click(force=True)
    slow(page, 600)

    # download real, salvat local
    downloads_dir = Path("test_downloads")
    downloads_dir.mkdir(exist_ok=True)

    save_path = downloads_dir / TARGET_FILE
    expect(page).to_have_url(re.compile(r"/media/event_files/.*\.pdf"), timeout=20000)
    file_url = page.url
    download_via_request(page, file_url, save_path)


    slow(page, 4200)
