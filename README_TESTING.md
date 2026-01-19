1) Software necesar
Python 3.10+ (recomandat 3.11)
Node.js (doar pentru frontend, dacă rulezi local UI)
Windows / Linux / macOS

2) Instalare:
2.1. Activează un virtual environment (venv)
cd backend
python -m venv env
env\Scripts\activate

2.2. Instalare pachete necesare - În venv activat, rulează:
pip install -U pip
pip install pytest pytest-django pytest-html requests
pip install playwright pytest-playwright
python -m playwright install

3) Rulare teste (comenzi uzuale) - Din backend/ cu venv activ:

3.1. Rulează toate testele API

pytest tests\api -q

3.2. Rulează toate testele E2E (UI) cu browser vizibil

pytest tests\e2e -q --headed -s

3.3. Rulează un singur test / fișier

pytest tests\e2e\signup\test_validate_email.py -q --headed -s