"""
serializers.py (events app)

Conține serializer-ele pentru:
- entități de bază: Faculty, Department, Category, Location
- Event (citire + write prin *_id)
- EventCreateSerializer: create/update cu locație nouă + validări (draft vs pending)
"""

from django.utils import timezone
from rest_framework import serializers

from users.serializers import UserSerializer
from .models import Faculty, Department, Category, Location, Event


class FacultySerializer(serializers.ModelSerializer):
    """Serializer simplu pentru Faculty."""

    class Meta:
        model = Faculty
        fields = ["id", "name", "abbreviation"]


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Department include:
    - faculty (nested, read-only)
    - faculty_id (write-only) pentru create/update mai simplu din frontend
    """

    faculty = FacultySerializer(read_only=True)
    faculty_id = serializers.PrimaryKeyRelatedField(
        queryset=Faculty.objects.all(),
        source="faculty",
        write_only=True,
    )

    class Meta:
        model = Department
        fields = ["id", "name", "faculty", "faculty_id"]


class CategorySerializer(serializers.ModelSerializer):
    """Serializer simplu pentru Category."""

    class Meta:
        model = Category
        fields = ["id", "name"]


class LocationSerializer(serializers.ModelSerializer):
    """Serializer simplu pentru Location."""

    class Meta:
        model = Location
        fields = ["id", "name", "address", "google_maps_link"]



# Event serializer 
class EventSerializer(serializers.ModelSerializer):
    """Serializer pentru Event:"""

    organizer = UserSerializer(read_only=True)

    # KPI-uri (read-only)
    tickets_count = serializers.IntegerField(read_only=True)
    seats_left = serializers.SerializerMethodField(read_only=True)

    faculty = FacultySerializer(read_only=True)
    faculty_id = serializers.PrimaryKeyRelatedField(
        queryset=Faculty.objects.all(),
        source="faculty",
        write_only=True,
        allow_null=True,
        required=False,
    )

    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True,
        allow_null=True,
        required=False,
    )

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        allow_null=True,
        required=False,
    )

    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        source="location",
        write_only=True,
        allow_null=True,
        required=False,
    )

    def get_tickets_count(self, obj):
        return getattr(obj, "tickets_count", None) or obj.tickets.count()

    def get_seats_left(self, obj):
        """Locuri rămase = max_participants - sold (minim 0)."""
        sold = self.get_tickets_count(obj)
        return max((obj.max_participants or 0) - sold, 0)

    class Meta:
        model = Event
        fields = [
            "id",
            "organizer",
            "title",
            "description",
            "faculty", "faculty_id",
            "department", "department_id",
            "category", "category_id",
            "location", "location_id",
            "start_date",
            "end_date",
            "max_participants",
            "tickets_count",
            "seats_left",
            "status",
            "image",
            "file",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organizer", "created_at", "updated_at", "status"]


# Event create/update with new location
class EventCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pentru crearea/actualizarea unui eveniment cu locație nouă (din text).
    Folositor când userul nu alege o locație existentă din listă, ci completează una.
    """

    # Date locație 
    location_name = serializers.CharField(write_only=True, trim_whitespace=True)
    location_address = serializers.CharField(
        write_only=True, required=False, allow_blank=True, trim_whitespace=True
    )
    google_maps_link = serializers.URLField(
        write_only=True, required=False, allow_blank=True
    )

    # FK-uri 
    faculty = serializers.PrimaryKeyRelatedField(queryset=Faculty.objects.all(), required=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), required=False, allow_null=True
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Event
        fields = [
            "title",
            "description",
            "faculty",
            "department",
            "category",
            "location_name",
            "location_address",
            "google_maps_link",
            "start_date",
            "end_date",
            "max_participants",
            "status",
            "image",
            "file",
        ]

    # Helpers 
    def _upsert_location(self, instance, loc_name, loc_addr, g_link):
        """
        Creează sau actualizează Location pentru event.
        - dacă event are deja location, o actualizează
        - altfel creează una nouă și o atașează la event
        """
        if instance.location:
            if loc_name is not None:
                instance.location.name = loc_name
            if loc_addr is not None:
                instance.location.address = loc_addr
            if g_link is not None:
                instance.location.google_maps_link = g_link
            instance.location.save()
            return instance.location

        if loc_name:
            return Location.objects.create(
                name=loc_name,
                address=loc_addr or "",
                google_maps_link=g_link or "",
            )

        return None

    def validate(self, attrs):
        """
        Reguli:
        - dacă status e 'draft': putem salva minimul
        - dacă status e 'pending': cerem câmpuri obligatorii + date corecte
        """
        event_status = attrs.get("status") or "draft"

        title = (attrs.get("title") or "").strip()
        description = (attrs.get("description") or "").strip()

        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        max_participants = attrs.get("max_participants")

        location_name = (attrs.get("location_name") or "").strip()
        location_address = (attrs.get("location_address") or "").strip()

        errors = {}

        # reguli generale
        if max_participants is not None and max_participants < 1:
            errors["max_participants"] = "Numărul de participanți trebuie să fie cel puțin 1."

        if event_status == "pending":
            if len(title) < 5:
                errors["title"] = "Titlul trebuie să aibă cel puțin 5 caractere."

            if len(description) < 5:
                errors["description"] = "Descrierea trebuie să aibă cel puțin 5 caractere."

            if not attrs.get("category"):
                errors["category"] = "Categoria este obligatorie pentru trimitere la validare."

            if not location_name:
                errors["location_name"] = "Numele locației este obligatoriu."

            if not location_address:
                errors["location_address"] = "Adresa locației este obligatorie pentru trimitere la validare."

            if start_date is None:
                errors["start_date"] = "Data de început este obligatorie."
            else:
                if start_date < timezone.now():
                    errors["start_date"] = "Data de început nu poate fi în trecut."

            if end_date is None:
                errors["end_date"] = "Data de sfârșit este obligatorie."
            elif start_date is not None and end_date <= start_date:
                errors["end_date"] = "Data de sfârșit trebuie să fie după data de început."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        """
        Creează:
        1) Location din câmpurile text
        2) Event legat de locația nou creată
        """
        loc_name = validated_data.pop("location_name")
        loc_addr = validated_data.pop("location_address", "")
        g_link = validated_data.pop("google_maps_link", "")

        new_location = Location.objects.create(
            name=loc_name,
            address=loc_addr,
            google_maps_link=g_link,
        )

        return Event.objects.create(location=new_location, **validated_data)

    def update(self, instance, validated_data):
        """
        Update:
        - actualizează/creează locația folosind câmpurile din request
        - aplică restul câmpurilor pe event
        """
        loc_name = validated_data.pop("location_name", None)
        loc_addr = validated_data.pop("location_address", None)
        g_link = validated_data.pop("google_maps_link", None)

        location = self._upsert_location(instance, loc_name, loc_addr, g_link)
        if location and not instance.location:
            instance.location = location

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
