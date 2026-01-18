import re
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"

# Regex pentru URL-ul de autentificare
AUTH_URL_RE = re.compile(r".*/auth/?$")

IGNORE_COOKIES = {"g_state"}  # Google One Tap / Sign-In state

# Posibile nume de cookie-uri folosite pentru autentificare în aplicație
APP_AUTH_COOKIE_CANDIDATES = {"access", "refresh", "jwt", "token", "auth"}

# functie pentru login
def _login(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=10000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill("test@gmail.com")
    login_form.locator('input[placeholder="Introduceți parola"]').fill("Test1234!")
    login_form.get_by_role("button", name="AUTENTIFICARE").click()

    expect(page).not_to_have_url(AUTH_URL_RE, timeout=15000)

# funcție pentru deschiderea meniului user
def _open_user_menu(page: Page):
    page.keyboard.press("Escape")

    name_loc = page.get_by_text("test Test", exact=True)

    target = None
    for i in range(name_loc.count()):
        cand = name_loc.nth(i)
        try:
            if cand.is_visible():
                target = cand
                break
        except Exception:
            pass

    if target is None:
        raise AssertionError('Nu găsesc "test Test" vizibil în UI.')

    target.click()

    if page.get_by_text("Deconectare", exact=True).count() == 0:
        target.locator("xpath=ancestor::*[self::button or self::a or self::div][1]").click()

# funcție pentru logout
def _logout(page: Page):
    _open_user_menu(page)

    logout_btn = page.get_by_text("Deconectare", exact=True).first
    expect(logout_btn).to_be_visible(timeout=10000)
    logout_btn.click()

    expect(page).to_have_url(AUTH_URL_RE, timeout=15000)
    expect(page.locator("form").filter(has_text="Bine ai revenit!")).to_be_visible(timeout=15000)

# preia numele cookie-urilor curente
def _get_cookie_names(page: Page):
    cookies = page.context.cookies()
    return {c["name"] for c in cookies if c.get("name")}

# preia snapshot-ul curent al localStorage și sessionStorage
def _get_storage_snapshot(page: Page):
    return page.evaluate(
        """() => {
            const ls = {};
            const ss = {};
            for (let i=0; i<localStorage.length; i++){
                const k = localStorage.key(i);
                ls[k] = localStorage.getItem(k);
            }
            for (let i=0; i<sessionStorage.length; i++){
                const k = sessionStorage.key(i);
                ss[k] = sessionStorage.getItem(k);
            }
            return { localStorage: ls, sessionStorage: ss };
        }"""
    )

# verifică dacă în storage există chei care par a fi legate de autentificare
def _storage_has_auth_like_data(storage: dict) -> bool:
    keys = list(storage.get("localStorage", {}).keys()) + list(storage.get("sessionStorage", {}).keys())
    key_str = " ".join(keys).lower()
    return any(x in key_str for x in ["token", "access", "refresh", "jwt", "auth"])

# Test pentru verificarea că cookie-urile și/sau storage-ul sunt curățate la logout
def test_cookies_or_storage_cleared_on_logout(page: Page):
    page.set_default_timeout(8000)

    _login(page)

    # Preluare cookie-uri și storage după login
    cookies_after_login = _get_cookie_names(page) - IGNORE_COOKIES
    storage_after_login = _get_storage_snapshot(page)

    _logout(page)

    # Preluare cookie-uri și storage după logout
    cookies_after_logout = _get_cookie_names(page) - IGNORE_COOKIES
    storage_after_logout = _get_storage_snapshot(page)

    # 1. Verificare cookie-uri: dacă există cookie-uri de autentificare, acestea trebuie să fie diferite după logout
    has_app_auth_cookie = any(
        any(cand in name.lower() for cand in APP_AUTH_COOKIE_CANDIDATES)
        for name in cookies_after_login
    )

    if has_app_auth_cookie:
        assert cookies_after_logout != cookies_after_login, (
            f"Cookie-urile de aplicație nu s-au schimbat după logout. "
            f"after_login={sorted(cookies_after_login)} after_logout={sorted(cookies_after_logout)}"
        )
    else:
        # 2. Verificare storage: dacă există date de autentificare în storage după login, acestea trebuie să fie șterse după logout
        was_auth_in_storage = _storage_has_auth_like_data(storage_after_login)
        if was_auth_in_storage:
            assert not _storage_has_auth_like_data(storage_after_logout), (
                f"Logout nu pare să curețe token/auth din storage. "
                f"after_login_keys={sorted(list(storage_after_login['localStorage'].keys()))} "
                f"after_logout_keys={sorted(list(storage_after_logout['localStorage'].keys()))}"
            )

    # 3. Verificare finală: după logout, utilizatorul este redirecționat la pagina de autentificare
    page.goto(f"{BASE_UI}/", wait_until="domcontentloaded")
    expect(page).to_have_url(AUTH_URL_RE, timeout=15000)
