from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework import generics, permissions
from .models import Ticket, Favorite, Review, Notification
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    FavoriteSerializer,
    ReviewSerializer,
    NotificationSerializer
)
from events.models import Event
import uuid


# Ticket Views
class TicketCreateView(generics.CreateAPIView):
    serializer_class = TicketCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        qr = uuid.uuid4()
        serializer.save(user=self.request.user, qr_code_data=str(qr))


class TicketListView(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)


class TicketDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.event.start_date and instance.event.start_date <= timezone.now():
            raise ValidationError({"detail": "Nu poți anula biletul după ce evenimentul a început."})
        instance.delete()


# Favorite Views
class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDeleteView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


# Review Views
class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Notification Views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)