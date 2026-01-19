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

from .realtime import push_to_user

try:
    from events.models import Event
except Exception:
    Event = None


QR_PREFIX = "UNIEVENT:TICKET:V1:"


# Ticket Views
class TicketCreateView(generics.CreateAPIView):
    serializer_class = TicketCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        qr = uuid.uuid4()
        ticket = serializer.save(user=self.request.user, qr_code_data=str(qr))

        try:
            notif = Notification.objects.create(
                user=self.request.user,
                title="Bilet cumpărat",
                message=f"Ai cumpărat un bilet pentru: {ticket.event.title}",
            )
            emit_notification(notif)
        except Exception as e:
            print("Notification failed:", e)



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

        event_title = instance.event.title
        instance.delete()


        try:
            notif = Notification.objects.create(
                user=self.request.user,
                title="Bilet anulat",
                message=f"Ai anulat biletul pentru: {event_title}",
            )
            emit_notification(notif)
        except Exception as e:
            print("Notification failed:", e)


# Favorite Views
class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        fav = serializer.save(user=self.request.user)

        try:
            event_title = fav.event.title if fav.event else "eveniment"
            notif = Notification.objects.create(
                user=self.request.user,
                title="Adăugat la favorite",
                message=f"Ai adăugat la favorite: {event_title}",
            )
            emit_notification(notif)
        except Exception as e:
            print("Notification failed:", e)


class FavoriteDeleteView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        event_title = instance.event.title if instance.event else "eveniment"
        instance.delete()

        try:
            notif = Notification.objects.create(
                user=self.request.user,
                title="Șters din favorite",
                message=f"Ai șters din favorite: {event_title}",
            )
            emit_notification(notif)
        except Exception as e:
            print("Notification failed:", e)

# Review Views
class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)

        try:
            event_title = review.event.title if review.event else "eveniment"
            notif = Notification.objects.create(
                user=self.request.user,
                title="Review trimis",
                message=f"Ai lăsat un review la: {event_title}",
            )
            emit_notification(notif)
        except Exception as e:
            print("Notification failed:", e)


# Notification Views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def _ensure_admin_pending_notification(self, request):
        """
        Creeaza/actualizeaza o notificare persistenta pentru admin/staff
        daca exista evenimente cu status=pending.
        Returneaza True daca a creat o notificare NOUA (ca sa putem trimite SSE optional).
        """
        user = request.user

        # doar pentru admin/staff/superuser
        if not (user.is_staff or user.is_superuser):
            return False

        # daca nu avem Event importat, nu facem nimic
        if Event is None:
            return False

        # ajusteaza filtrul daca statusul tau are alt nume
        pending_count = Event.objects.filter(status="pending").count()
        if pending_count <= 0:
            return False

        title = "Evenimente în așteptare"
        message = f"Ai {pending_count} eveniment(e) care așteaptă aprobare."

        # Ca sa nu creeze spam, folosim get_or_create pe (user, title)
        # Daca ai camp "kind" in Notification
        notif, created = Notification.objects.get_or_create(
            user=user,
            title=title,
            defaults={
                "message": message,
                "is_read": False,
                "created_at": timezone.now(),
            },
        )

        # actualizare mesaj (daca s-a schimbat) si optional re-deschidere daca vrei
        changed = False
        if notif.message != message:
            notif.message = message
            changed = True

        # IMPORTANT:
        # Daca vrei ca dupa ce o citeste sa ramana citita
        # COMENTEAZA urmatoarele 3 linii.
        #if notif.is_read:
        #    notif.is_read = False
        #    changed = True

        if changed:
            notif.save(update_fields=["message", "is_read"])

        # optional: daca e noua, trimite SSE imediat
        if created or changed:
            try:
                emit_notification(notif)
            except Exception as e:
                print("emit admin pending notif failed:", e)

        return created

    def list(self, request, *args, **kwargs):
        # 1) asigura notificarea pentru admin daca exista pending events
        self._ensure_admin_pending_notification(request)

        # 2) apoi returneaza lista ca inainte
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)

        unread_count = queryset.filter(is_read=False).count()

        data = {
            "items": serializer.data,
            "unreadCount": unread_count,
        }

        if page is not None:
            return self.get_paginated_response(data)

        return Response(data)


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
    
class NotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        notif = Notification.objects.filter(id=pk, user=request.user).first()
        if not notif:
            return Response({"detail": "Not found"}, status=404)
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response({"ok": True})


class NotificationReadAllView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"ok": True})
    
    
def emit_notification(notification: Notification):
    """Trimite notificarea prin SSE către userul destinatar."""
    push_to_user(notification.user_id, {
        "kind": "notification:new",
        "notification": {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
        }
    })