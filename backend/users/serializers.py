"""
serializers.py (users app)

Conține serializer-ele pentru:
- afișarea utilizatorului (UserSerializer)
- înregistrare (RegisterSerializer)
- cerere de organizer (OrganizerRequestSerializer)
- login JWT cu extra claims (MyTokenObtainPairSerializer)
- schimbare parolă (ChangePasswordSerializer)
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser, OrganizerRequest


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer de citire pentru utilizator.
    Folosit în răspunsuri (profil, organizer request etc.).
    """

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_student",
            "is_organizer",
            "date_joined",
        ]

        read_only_fields = ["id", "date_joined", "is_organizer"]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer pentru înregistrare.
    - primește două parole și verifică potrivirea
    - folosește create_user() ca să salveze parola hash-uită
    """

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={"input_type": "password"},
        trim_whitespace=False,
    )
    password2 = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        trim_whitespace=False,
    )

    class Meta:
        model = CustomUser
        fields = ["email", "first_name", "last_name", "password", "password2"]

    def validate(self, attrs):
        """
        Validări “cross-field” (între câmpuri).
        Atașăm eroarea pe password2 ca să fie clar în UI/Swagger.
        """
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password2": "Parolele nu se potrivesc."})
        return attrs

    def create(self, validated_data):
        """
        Scoatem password2 (nu există în model) și creăm user-ul corect.
        """
        validated_data.pop("password2", None)
        return CustomUser.objects.create_user(**validated_data)


class OrganizerRequestSerializer(serializers.ModelSerializer):
    """
    Serializer pentru cererile de organizer.
    user este read-only (vine din request.user în view).
    """

    user = UserSerializer(read_only=True)

    class Meta:
        model = OrganizerRequest
        fields = ["id", "user", "organization_name", "details", "status", "created_at"]
        read_only_fields = ["id", "user", "status", "created_at"]


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT login serializer:
    adaugă “claims” extra în token ca să nu mai faci un request separat
    pentru info basic în frontend.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Claims extra în JWT
        token["email"] = user.email
        token["is_organizer"] = user.is_organizer
        token["is_staff"] = user.is_staff
        token["full_name"] = f"{user.first_name} {user.last_name}".strip()

        return token


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer pentru schimbarea parolei.
    Validarea că old_password e corect se face de obicei în view/service,
    deoarece ai nevoie de user-ul autentificat.
    """

    old_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        trim_whitespace=False,
    )
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={"input_type": "password"},
        trim_whitespace=False,
    )
    new_password2 = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        trim_whitespace=False,
    )

    def validate(self, attrs):
        """
        Verifică potrivirea parolelor noi.
        """
        if attrs.get("new_password") != attrs.get("new_password2"):
            raise serializers.ValidationError({"new_password2": "Parolele nu se potrivesc."})
        return attrs
