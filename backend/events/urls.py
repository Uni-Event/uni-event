from django.urls import path
from .views import EventListCreateView, EventDetailView

urlpatterns = [
    path("", EventListCreateView.as_view()),
    path("<int:pk>/", EventDetailView.as_view()),

    # TODO (Diana): Add Faculty, Department and Category endpoints
    # Work on backend branch and open a pull request to main when done.
]
