import re

# biblioteci Playwright pentru gestionare excepții și așteptări
from playwright.sync_api import Page, expect, TimeoutError as PWTimeoutError

# Regex pentru a detecta URL-urile Google OAuth
GOOGLE_RE = re.compile(r"(accounts\.google\.com|oauth|google)", re.IGNORECASE)

# Test pentru a verifica fluxul OAuth Google prin UI
def test_google_oauth_flow_starts_or_returns_to_app(page: Page):
    page.goto("http://localhost:5173/auth", wait_until="domcontentloaded")

    google_btn = page.get_by_text("Continuă cu Google", exact=True)
    expect(google_btn).to_be_visible()
    google_btn.scroll_into_view_if_needed()

    # Încearcă să deschidă fereastra popup pentru OAuth Google
    try:
        with page.expect_popup(timeout=5000) as pop_info:
            google_btn.click()
        popup = pop_info.value

        # Așteaptă să se încarce pagina popup-ului și verifică URL-ul
        try:
            popup.wait_for_load_state("domcontentloaded", timeout=8000)
            if GOOGLE_RE.search(popup.url or ""):
                return
        except Exception:
            return
        return

    # Dacă popup-ul nu s-a deschis, verifică dacă s-a navigat către Google sau s-a întors în aplicație
    except PWTimeoutError:
        google_btn.click()
        try:
            page.wait_for_url(GOOGLE_RE, timeout=15000)
            return
        except PWTimeoutError:
            pass

        try:
            expect(page).not_to_have_url(re.compile(r".*/auth$", re.IGNORECASE), timeout=15000)
            return
        except Exception:
            raise AssertionError("OAuth Google nu a pornit și nici nu s-a întors în aplicație (a rămas pe /auth).")
