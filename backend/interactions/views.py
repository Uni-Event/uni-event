from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework import generics, permissions
from users.permissions import IsOrganizer
from .models import Ticket, Favorite, Review, Notification
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    FavoriteSerializer,
    ReviewSerializer,
    NotificationSerializer,
    TicketCheckinSerializer,
)
from events.models import Event
import uuid


QR_PREFIX = "UNIEVENT:TICKET:V1:"


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


# Ticket Check-in View
class TicketCheckinView(APIView):
    """
    POST /api/interactions/tickets/checkin/
    Body: { event_id, qr_code_data }
    - doar organizer
    - doar pentru evenimentele lui
    - marchează ticket.is_checked_in = True
    """
    permission_classes = [permissions.IsAuthenticated, IsOrganizer]

    def post(self, request):
        s = TicketCheckinSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        event_id = s.validated_data["event_id"]
        raw = s.validated_data["qr_code_data"].strip()

        # 1) Event must exist
        try:
            ev = Event.objects.select_related("organizer").get(pk=event_id)
        except Event.DoesNotExist:
            raise NotFound("Eveniment inexistent.")

        # 2) Must belong to organizer
        if ev.organizer_id != request.user.id:
            raise PermissionDenied("Nu ai acces la acest eveniment.")

        # 3) Must be published
        if getattr(ev, "status", None) != "published":
            raise ValidationError({"detail": "Evenimentul nu este publicat."})

        # 4) Must be active or about to start
        now = timezone.now()
        if ev.end_date and ev.end_date < now:
            raise ValidationError({"detail": "Evenimentul s-a terminat."})

        if ev.start_date and now < (ev.start_date - timedelta(minutes=60)):
            raise ValidationError({"detail": "E prea devreme pentru check-in."})

        # 5) Parse QR text (accept atât full string cât și doar UUID-ul)
        code = raw
        if code.startswith(QR_PREFIX):
            code = code[len(QR_PREFIX):].strip()

        if not code:
            raise ValidationError({"qr_code_data": "Cod QR invalid."})

        # 6) Find ticket and mark checked-in atomically
        with transaction.atomic():
            try:
                ticket = (
                    Ticket.objects
                    .select_for_update()
                    .select_related("user")
                    .get(event=ev, qr_code_data=code)
                )
            except Ticket.DoesNotExist:
                raise NotFound("Bilet inexistent / QR invalid pentru acest eveniment.")

            if ticket.is_checked_in:
                return Response(
                    {
                        "ok": True,
                        "already_checked_in": True,
                        "message": "Bilet deja validat.",
                        "ticket_id": ticket.id,
                        "user_email": ticket.user.email,
                    },
                    status=status.HTTP_200_OK,
                )

            ticket.is_checked_in = True
            ticket.save(update_fields=["is_checked_in"])

            Notification.objects.create(
                user=ticket.user,
                title="Bilet validat",
                message=f"Biletul tău pentru evenimentul „{ev.title}” a fost validat la intrare.",
            )

        return Response(
            {
                "ok": True,
                "already_checked_in": False,
                "message": "Check-in reușit. Bilet validat.",
                "ticket_id": ticket.id,
                "user_email": ticket.user.email,
            },
            status=status.HTTP_200_OK,
        )