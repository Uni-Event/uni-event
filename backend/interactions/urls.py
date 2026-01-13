from django.urls import path
from .views import (
    TicketCreateView, TicketListView,
    FavoriteListCreateView, FavoriteDeleteView,
    ReviewCreateView,
    NotificationListView,
    TicketDeleteView
)


urlpatterns = [
    # tickets
    path("tickets/", TicketListView.as_view()),
    path("tickets/buy/", TicketCreateView.as_view()),
    path("tickets/<int:pk>/", TicketDeleteView.as_view()),

    # favorites
    path("favorites/", FavoriteListCreateView.as_view()),
    path("favorites/<int:pk>/", FavoriteDeleteView.as_view()),

    # reviews
    path("reviews/", ReviewCreateView.as_view()),

    # notifications
    path("notifications/", NotificationListView.as_view()),
]
