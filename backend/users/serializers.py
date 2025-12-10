from rest_framework import serializers
from .models import CustomUser, OrganizerRequest
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Serializer for CustomUser model
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "first_name", "last_name",
            "is_student", "is_organizer",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "is_organizer"]

# Serializer for user registration
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "first_name", "last_name", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError("Parolele nu se potrivesc.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        return CustomUser.objects.create_user(**validated_data)
    
# Serializer for OrganizerRequest model
class OrganizerRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = OrganizerRequest
        fields = ["id", "user", "organization_name", "details", "status", "created_at"]
        read_only_fields = ["id", "user", "status", "created_at"]

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Aici adaugam informatiile extra in token
        token['email'] = user.email
        token['is_organizer'] = user.is_organizer
        token['is_staff'] = user.is_staff
        token['full_name'] = f"{user.first_name} {user.last_name}"

        return token