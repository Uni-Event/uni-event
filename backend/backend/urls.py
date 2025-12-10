from django.contrib import admin
from django.urls import path, include
from .swagger import schema_view
from rest_framework_simplejwt.views import TokenRefreshView

# --- IMPORT CRITIC: Folosim View-ul tau Custom, nu pe cel standard ---
from users.views import MyTokenObtainPairView 

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutele aplicatiilor tale
    path("api/users/", include("users.urls")),
    path("api/events/", include("events.urls")),
    path("api/interactions/", include("interactions.urls")),
    
    # Rutele pentru JWT Authentication
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Documentație Swagger
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("swagger.json", schema_view.without_ui(cache_timeout=0), name="schema-json"),
]