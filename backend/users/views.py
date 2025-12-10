# Importuri externe
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

# Importuri locale
from .models import CustomUser, OrganizerRequest
from .serializers import (
    MyTokenObtainPairSerializer,
    UserSerializer,
    RegisterSerializer,
    OrganizerRequestSerializer
)
from .services import google_validate_id_token, google_get_or_create_user

# View for user registration
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

# View for retrieving user profile
class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# View for creating an organizer request   
class OrganizerRequestCreateView(generics.CreateAPIView):
    serializer_class = OrganizerRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if hasattr(request.user, "organizer_request"):
            return Response({"detail": "Ai deja o cerere trimisă."}, status=400)

        data = request.data.copy()
        data["user"] = request.user.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)

        return Response(serializer.data, status=201)
    
# View for admin to list all organizer requests
class OrganizerRequestListAdminView(generics.ListAPIView):
    serializer_class = OrganizerRequestSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return OrganizerRequest.objects.all()

# View for admin to update organizer request status
class OrganizerRequestUpdateAdminView(generics.UpdateAPIView):
    serializer_class = OrganizerRequestSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = OrganizerRequest.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        status_value = request.data.get("status")

        if status_value not in ["approved", "rejected"]:
            return Response({"detail": "Status invalid."}, status=400)

        instance.status = status_value
        instance.save()

        if status_value == "approved":
            user = instance.user
            user.is_organizer = True
            user.save()

        return Response(OrganizerRequestSerializer(instance).data)
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'No token provided'}, status=400)

        # 1. Validam token-ul 
        google_data = google_validate_id_token(token)
        
        if not google_data:
            return Response({'error': 'Token invalid sau expirat'}, status=400)

        # 2. Obtinem sau cream userul 
        user = google_get_or_create_user(google_data)

        # 3. Generam token-urile JWT 
        refresh = RefreshToken.for_user(user)
        
        # Adaugam datele custom in token
        refresh['email'] = user.email
        refresh['is_organizer'] = user.is_organizer
        refresh['is_staff'] = user.is_staff
        refresh['full_name'] = f"{user.first_name} {user.last_name}"

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })