from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings


# 1. Managerul personalizat pentru User
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Creeaza si salveaza un User cu email-ul si parola date.
        """
        if not email:
            raise ValueError('Adresa de email este obligatorie')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creeaza si salveaza un SuperUser (Admin).
        """
        extra_fields.setdefault('is_staff', True)     
        extra_fields.setdefault('is_superuser', True) 
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


# 2. Modelul (Structura Userului)
class CustomUser(AbstractUser):
    # --- CAMPURI DEJA EXISTENTE (MOSTENITE DIN AbstractUser) ---
    # id (Creat automat)
    # password
    # first_name
    # last_name
    # date_joined
    # last_login
    # is_staff (Asta e Admin-ul)
    # is_superuser
    # is_active
    
    # --- MODIFICARI FATA DE STANDARD ---
    username = None  
    email = models.EmailField('email address', unique=True) # Email-ul unic si obligatoriu

    # --- CAMPURILE TALE EXTRA ---
    is_student = models.BooleanField(default=True)
    is_organizer = models.BooleanField(default=False)

    # Setari de configurare Django
    USERNAME_FIELD = 'email' # Logare cu email
    REQUIRED_FIELDS = []     

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class OrganizerRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'In Asteptare'),
        ('approved', 'Aprobat'),
        ('rejected', 'Respins'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organizer_request'
    )

    organization_name = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cerere organizator: {self.user.email} ({self.status})"
