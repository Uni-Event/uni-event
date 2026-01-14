# biblioteci playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"
EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms=600):
    page.wait_for_timeout(ms)

# Funcție de login
def login(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    slow(page, 600)

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=20000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    slow(page, 200)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    slow(page, 200)

    login_form.locator('button:has-text("AUTENTIFICARE")').click()
    expect(page).not_to_have_url("**/auth", timeout=20000)
    slow(page, 1000)

# Funcție pentru a găsi cardul unui eveniment după titlu
def _find_card_by_title(page: Page, title_text: str):
    title = page.locator(f"text={title_text}").first
    expect(title).to_be_visible(timeout=30000)

    card = title.locator(
        f"xpath=ancestor::div[.//text()[normalize-space()='{title_text}']][.//*[contains(normalize-space(),'Vezi Detalii')]][1]"
    )
    expect(card).to_be_visible(timeout=20000)
    return card

# Funcție pentru a găsi butonul "Vezi afișul" în zona imaginii din card
def _find_poster_button_in_image_area(card):
    img = card.locator("img").first
    expect(img).to_be_visible(timeout=20000)

    # Caută butonul "Vezi afișul" în straturile părinte ale imaginii
    for level in range(1, 6):
        container = img.locator(f"xpath=ancestor::*[{level}]")
        candidate = container.locator("text=/Vezi\\s+afișul/i").first
        if candidate.count() > 0 and candidate.is_visible():
            return candidate

    return None

# Test pentru a vedea afișul unui eveniment
def test_open_event_poster(page: Page):
    page.set_default_timeout(30000)
    login(page)

    TARGET_TITLE = "Testare" 

    card = _find_card_by_title(page, TARGET_TITLE)
    slow(page, 600)

    # Găsește butonul "Vezi afișul" în zona imaginii din card
    poster_btn = _find_poster_button_in_image_area(card)
    assert poster_btn is not None, "Nu am găsit 'Vezi afișul' în zona imaginii din card."

    # Derulează la buton și așteaptă puțin
    poster_btn.scroll_into_view_if_needed()
    slow(page, 300)

    # Click pe "Vezi afișul"
    poster_btn.click(force=True)
    slow(page, 1200)

    # Verificare: modalul cu afișul este vizibil
    modal_like = page.locator('[role="dialog"], .modal, .MuiDialog-root, .chakra-modal__content')
    if modal_like.count() > 0:
        expect(modal_like.first).to_be_visible(timeout=20000)
    else:
        expect(page.locator("img:visible").first).to_be_visible(timeout=20000)
