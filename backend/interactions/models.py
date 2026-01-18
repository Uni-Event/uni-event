from django.db import models
from django.conf import settings
from events.models import Event 


class Ticket(models.Model):
    # Relatii
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    
    # Detalii Bilet
    qr_code_data = models.CharField(max_length=255, unique=True, help_text="Un UUID unic pentru generarea QR")
    is_checked_in = models.BooleanField(default=False, help_text="Bifat de organizator la intrare")
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Un student nu poate avea 2 bilete la acelasi eveniment
        unique_together = ('user', 'event')
        ordering = ['-purchased_at']

    def __str__(self):
        return f"Bilet: {self.user.email} -> {self.event.title}"


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reviews')
    
    # Rating 1-5
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Un singur review per eveniment
        unique_together = ('user', 'event')

    def __str__(self):
        return f"{self.rating} - {self.event.title}"


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')

    def __str__(self):
        return f"{self.user.email} <3 {self.event.title}"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notificare pt {self.user.email}: {self.title}"