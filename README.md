# Instalare UniEvent

Acest document descrie pașii necesari pentru instalarea și rularea aplicației **UniEvent** (în Windows).
Aplicația este formată din două părți:

* **Backend** – Django (Python)
* **Frontend** – React (Node.js)

---

## 1. Cerințe minime (obligatorii)

Înainte de a descărca proiectul, asigurați-vă că aveți instalate următoarele:

---

### 1.1 Python (pentru Backend)

* Versiune recomandată: **Python 3.10+**
* Verificare instalare:

```bash
python --version
```

Dacă Python nu este instalat:

* Descărcați de aici: [https://www.python.org/downloads/](https://www.python.org/downloads/)
* **IMPORTANT:** Bifați opțiunea **“Add Python to PATH”** la instalare

---

### 1.2 Node.js (pentru Frontend)

* Versiune recomandată: **Node.js LTS**
* Verificare instalare:

```bash
node --version
npm --version
```

Dacă nu este instalat:

* Descărcați de aici: [https://nodejs.org/en/](https://nodejs.org/en/)
* Instalați cu setările standard (Next → Next → Finish)

---

## 2. Instalare și configurare Backend (Django)

### 2.1 Accesarea folderului backend

```bash
cd uni-event/backend
```

Ar trebui să vedeți fișierul **`requirements_new.txt`**.

---

### 2.2 Crearea unui mediu virtual

```bash
python -m venv env
```

---

### 2.3 Activarea mediului virtual

**Windows:**

```bash
env\Scripts\activate
```

Dacă apare eroarea:

> “Scripts are disabled on this system”

Rulați PowerShell ca Administrator și executați:

```bash
Set-ExecutionPolicy RemoteSigned
```

Apoi încercați din nou.

---

### 2.4 Instalarea dependențelor backend

```bash
pip install -r requirements_new.txt
```

---

### 2.5 Inițializarea bazei de date

Aplicația folosește **SQLite** (local).

```bash
python manage.py migrate
```

---

### 2.6 Crearea unui cont de administrator (recomandat)

```bash
python manage.py createsuperuser
```

---

### 2.7 Pornirea backendului

```bash
python manage.py runserver
```

Backendul va rula la:

```
http://127.0.0.1:8000/
```

---

## 3. Instalare și configurare Frontend (React)

### 3.1 Deschiderea unui terminal nou

Navigați în folderul frontend:

```bash
cd uni-event/frontend
```

---

### 3.2 Instalarea pachetelor frontend

```bash
npm install
```

---

### 3.3 Pornirea frontendului

```bash
npm run dev
```

Frontendul va rula la:

```
http://localhost:5173/
```

(portul poate fi diferit, verificați terminalul)

---

## 4. Verificarea funcționării aplicației

### 4.1 Verificare Backend

* Accesați în browser:

```
http://127.0.0.1:8000/
```

* Panou de administrare Django:

```
http://127.0.0.1:8000/admin
```

* Documentație API (Swagger):

```
http://127.0.0.1:8000/swagger
```

---

### 4.2 Verificare Frontend

* Accesați:

```
http://localhost:5173/
```

Ar trebui să apară pagina de autentificare.

---

## 5. Pornirea zilnică a proiectului

### Backend

```bash
cd backend
env\Scripts\activate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm run dev
```

---

## 6. Probleme comune

### ❌ Pip nu este recunoscut

* Python nu este adăugat în PATH
* Reinstalați Python și bifați **Add Python to PATH**

---

### ❌ Frontendul apare alb

* Deschideți Developer Tools (F12)
* Application → Local Storage → ștergeți datele
* Reîncărcați pagina

---

### ❌ Backendul nu pornește

* Verificați dacă mediul virtual este activ
* Verificați dacă `pip install -r requirements_new.txt` s-a executat corect

---

## 7. Observații finale

* Backend și frontend trebuie să ruleze **simultan**
* Aplicația rulează **local**, nu este publicată online
* Baza de date este locală (SQLite)
