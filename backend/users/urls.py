from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    OrganizerRequestCreateView,
    OrganizerRequestListAdminView,
    OrganizerRequestUpdateAdminView,
    GoogleLoginView,
    ChangePasswordView,
    OrganizerRequestMeView,
)


urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("organizer-request/me/", OrganizerRequestMeView.as_view()),

    # organizer request
    path("organizer-request/", OrganizerRequestCreateView.as_view()),
    path("admin/organizer-requests/", OrganizerRequestListAdminView.as_view()),
    path("admin/organizer-requests/<int:pk>/", OrganizerRequestUpdateAdminView.as_view()),

    path("google/", GoogleLoginView.as_view(), name="google_login"),
]
