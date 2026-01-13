"""
views.py (users app)

Conține endpoint-uri pentru:
- înregistrare utilizator
- profil utilizator (me)
- cerere de organizer (create + me)
- admin: list + update status cereri organizer
- login JWT (custom claims)
- login Google (ID token -> user -> JWT)
- schimbare parolă
"""

# --- Importuri externe ---
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

# --- Importuri locale ---
from .models import OrganizerRequest
from .serializers import (
    ChangePasswordSerializer,
    MyTokenObtainPairSerializer,
    OrganizerRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .services import google_get_or_create_user, google_validate_id_token


# Auth / Users
class RegisterView(generics.CreateAPIView):
    """
    POST /users/register/
    Creează un cont nou.
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveAPIView):
    """
    GET /users/profile/
    Returnează datele utilizatorului autentificat (me).
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # întoarcem direct user-ul autentificat
        return self.request.user


class MyTokenObtainPairView(TokenObtainPairView):
    """
    POST /users/token/
    Login JWT (email/parolă) cu claims extra în token.
    """
    serializer_class = MyTokenObtainPairSerializer


# Organizer Requests
class OrganizerRequestCreateView(generics.CreateAPIView):
    """
    POST /users/organizer-requests/
    Creează o cerere de organizer pentru user-ul autentificat.
    """
    serializer_class = OrganizerRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Setăm user-ul din request, nu acceptăm user din body.
        În plus, blocăm trimiterea unei cereri dacă există deja una.
        """
        if OrganizerRequest.objects.filter(user=self.request.user).exists():
            raise ValidationError({"detail": "Ai deja o cerere trimisă."})

        serializer.save(user=self.request.user)


class OrganizerRequestMeView(generics.RetrieveAPIView):
    """
    GET /users/organizer-requests/me/
    Returnează ultima cerere de organizer a utilizatorului.
    """
    serializer_class = OrganizerRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = (
            OrganizerRequest.objects
            .filter(user=self.request.user)
            .order_by("-created_at")
            .first()
        )

        if not obj:
            raise NotFound("Nu ai nicio cerere de organizator.")

        return obj


# Admin endpoints
class OrganizerRequestListAdminView(generics.ListAPIView):
    """
    GET /admin/organizer-requests/
    Admin: listă cu toate cererile.
    """
    serializer_class = OrganizerRequestSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = OrganizerRequest.objects.all()


class OrganizerRequestUpdateAdminView(generics.UpdateAPIView):
    """
    PATCH /admin/organizer-requests/<id>/
    Admin: aprobă / respinge o cerere (status).
    """
    serializer_class = OrganizerRequestSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = OrganizerRequest.objects.all()

    ALLOWED_STATUSES = {"approved", "rejected"}

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        status_value = request.data.get("status")

        # Validăm status-ul primit
        if status_value not in self.ALLOWED_STATUSES:
            return Response(
                {"detail": f"Status invalid. Folosește: {', '.join(self.ALLOWED_STATUSES)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Actualizăm status-ul cererii
        instance.status = status_value
        instance.save(update_fields=["status"])

        # Dacă aprobăm, marcăm user-ul ca organizer
        if status_value == "approved" and not instance.user.is_organizer:
            instance.user.is_organizer = True
            instance.user.save(update_fields=["is_organizer"])

        return Response(OrganizerRequestSerializer(instance).data, status=status.HTTP_200_OK)

    update = partial_update


# Google Login
class GoogleLoginView(APIView):
    """
    POST /users/google-login/
    Body: { "token": "<google_id_token>" }
    - validează ID token-ul
    - găsește/creează user
    - returnează JWT refresh/access
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

        # 1) Validăm token-ul Google
        google_data = google_validate_id_token(token)
        if not google_data:
            return Response(
                {"error": "Token invalid sau expirat"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2) Obținem sau creăm user-ul
        user = google_get_or_create_user(google_data)

        # 3) Generăm token-urile JWT
        refresh = RefreshToken.for_user(user)

        refresh["email"] = user.email
        refresh["is_organizer"] = user.is_organizer
        refresh["is_staff"] = user.is_staff
        refresh["full_name"] = f"{user.first_name} {user.last_name}".strip()

        return Response(
            {"refresh": str(refresh), "access": str(refresh.access_token)},
            status=status.HTTP_200_OK,
        )


# Password management
class ChangePasswordView(APIView):
    """
    POST /users/change-password/
    Body: { old_password, new_password, new_password2 }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        # Verificăm parola veche
        if not user.check_password(old_password):
            return Response(
                {"detail": "Parola veche este greșită."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"detail": "Parola a fost schimbată cu succes."},
            status=status.HTTP_200_OK,
        )
