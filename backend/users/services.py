from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.contrib.auth import get_user_model
from django.conf import settings
import uuid

User = get_user_model()

GOOGLE_CLIENT_ID = "344307986436-j0o4fqcrj14smhqvrgmt3jkngpgnm1nu.apps.googleusercontent.com"

def google_validate_id_token(token: str):
    """
    Verifica token-ul primit de la Google.
    Returneaza informatiile userului (email, first_name, last_name) sau arunca eroare.
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        # Google returneaza un dictionar cu datele userului
        return {
            'email': idinfo['email'],
            'first_name': idinfo.get('given_name', ''),
            'last_name': idinfo.get('family_name', '')
        }
    except ValueError as e:
        print(f"!!! EROARE VALIDARE GOOGLE: {e}")
        return None

def google_get_or_create_user(user_data):
    """
    Cauta userul in baza de date dupa email.
    Daca nu exista, il creeaza.
    """
    try:
        user = User.objects.get(email=user_data['email'])
        return user
    except User.DoesNotExist:
        user = User.objects.create_user(
            email=user_data['email'],
            username=user_data['email'],
            password=str(uuid.uuid4()), # Parola random
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            is_student=True # Default student
        )
        return user