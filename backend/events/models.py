from django.db import models
from django.conf import settings  


class Faculty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    abbreviation = models.CharField(max_length=10, help_text="Ex: AC, ETTI")

    class Meta:
        verbose_name_plural = "Faculties" 

    def __str__(self):
        return self.name


class Department(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.faculty.abbreviation})"


class Category(models.Model):
    name = models.CharField(max_length=50) # Ex: Cultural, Sportiv

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Location(models.Model):
    name = models.CharField(max_length=100) # Ex: Aula Magna
    address = models.CharField(max_length=255)
    google_maps_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class Event(models.Model):
    # Statusurile posibile 
    STATUS_CHOICES = [
        ('draft', 'Draft (In lucru)'),
        ('pending', 'In Asteptare Validare'),
        ('published', 'Publicat (Vizibil)'),
        ('rejected', 'Respins'),
    ]

    # --- RELATII ---
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events')
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True, help_text="Lasa gol pentru evenimente generale")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)

    # --- DETALII ---
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # --- MEDIA ---
    image = models.ImageField(upload_to='event_images/', null=True, blank=True)
    file = models.FileField(upload_to='event_files/', null=True, blank=True)
    
    # --- SETARI ---
    max_participants = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date'] 

    def __str__(self):
        return self.title