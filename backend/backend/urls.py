from django.contrib import admin
from django.urls import path, include
from .swagger import schema_view
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import MyTokenObtainPairView 

from django.conf import settings             
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutele aplicatiilor 
    path("api/users/", include("users.urls")),
    path("api/events/", include("events.urls")),
    path("api/interactions/", include("interactions.urls")),
    
    # Rutele pentru JWT Authentication
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Documentatie Swagger
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("swagger.json", schema_view.without_ui(cache_timeout=0), name="schema-json"),
]

# 15.12.25 Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)