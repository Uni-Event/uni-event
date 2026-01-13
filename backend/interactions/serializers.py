"""
serializers.py (interactions app)

- TicketSerializer: afișare ticket + flag has_review
- TicketCreateSerializer: creare ticket cu validări (status, start_date, seats, unicitate)
- ReviewSerializer / FavoriteSerializer: event_id write-only, event nested read-only
- NotificationSerializer: notificări pentru user
"""

from django.utils import timezone
from rest_framework import serializers

from events.models import Event
from events.serializers import EventSerializer
from users.serializers import UserSerializer
from .models import Favorite, Notification, Review, Ticket


# Ticket (read)
class TicketSerializer(serializers.ModelSerializer):
    """Ticket pentru afișare"""
    user = UserSerializer(read_only=True)
    event = EventSerializer(read_only=True)
    has_review = serializers.SerializerMethodField(read_only=True)

    def get_has_review(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return Review.objects.filter(user=user, event=obj.event).exists()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "user",
            "event",
            "event_id",          
            "qr_code_data",
            "is_checked_in",
            "purchased_at",
            "has_review",
        ]
        read_only_fields = [
            "id",
            "user",
            "event",
            "qr_code_data",
            "is_checked_in",
            "purchased_at",
            "has_review",
        ]


# Ticket (create)
class TicketCreateSerializer(serializers.ModelSerializer):
    """Serializer pentru creare ticket"""
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        source="event",
        write_only=True,
    )

    class Meta:
        model = Ticket
        fields = ["id", "event_id", "qr_code_data", "is_checked_in", "purchased_at"]
        read_only_fields = ["id", "qr_code_data", "is_checked_in", "purchased_at"]

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            raise serializers.ValidationError({"detail": "Trebuie să fii autentificat pentru a cumpăra bilet."})

        event = attrs["event"]

        # 1) doar evenimente publicate
        if getattr(event, "status", None) != "published":
            raise serializers.ValidationError({"event_id": "Evenimentul nu este disponibil pentru înscriere."})

        # 2) doar înainte de start
        if event.start_date and event.start_date <= timezone.now():
            raise serializers.ValidationError({"event_id": "Evenimentul a început deja (nu te mai poți înscrie)."})

        # 3) un singur bilet per user/event
        if Ticket.objects.filter(user=user, event=event).exists():
            raise serializers.ValidationError({"event_id": "Ai deja bilet pentru acest eveniment."})

        # 4) locuri disponibile
        if event.max_participants is not None:
            sold = Ticket.objects.filter(event=event).count()
            if sold >= event.max_participants:
                raise serializers.ValidationError({"event_id": "Nu mai sunt locuri disponibile."})

        return attrs


# Review
class ReviewSerializer(serializers.ModelSerializer):
    """
    Review:
    - user read-only
    - event_id write-only
    """
    user = UserSerializer(read_only=True)
    event = EventSerializer(read_only=True)

    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        source="event",
        write_only=True,
    )

    class Meta:
        model = Review
        fields = ["id", "user", "event", "event_id", "rating", "comment", "created_at"]
        read_only_fields = ["id", "user", "event", "created_at"]


# Favorite
class FavoriteSerializer(serializers.ModelSerializer):
    """
    Favorite:
    - user read-only
    - event_id write-only
    """
    user = UserSerializer(read_only=True)
    event = EventSerializer(read_only=True)

    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        source="event",
        write_only=True,
    )

    class Meta:
        model = Favorite
        fields = ["id", "user", "event", "event_id", "added_at"]
        read_only_fields = ["id", "user", "event", "added_at"]


# Notification
class NotificationSerializer(serializers.ModelSerializer):
    """Notification"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "user", "title", "message", "is_read", "created_at"]
        read_only_fields = ["id", "user", "created_at"]
