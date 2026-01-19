from django.urls import path
from .views import (
    TicketCreateView, TicketListView,
    FavoriteListCreateView, FavoriteDeleteView,
    ReviewCreateView,
    NotificationListView,
    TicketDeleteView,
    TicketCheckinView,
    NotificationReadView,
    NotificationReadAllView,
)

from .streamviews import notifications_stream


urlpatterns = [
    # tickets
    path("tickets/", TicketListView.as_view()),
    path("tickets/buy/", TicketCreateView.as_view()),
    path("tickets/<int:pk>/", TicketDeleteView.as_view()),
    path("tickets/checkin/", TicketCheckinView.as_view()), 

    # favorites
    path("favorites/", FavoriteListCreateView.as_view()),
    path("favorites/<int:pk>/", FavoriteDeleteView.as_view()),

    # reviews
    path("reviews/", ReviewCreateView.as_view()),

    # notifications
    path("notifications/", NotificationListView.as_view()),
    path("notifications/<int:pk>/read/", NotificationReadView.as_view()),
    path("notifications/read-all/", NotificationReadAllView.as_view()),

    # notifications (SSE STREAM)
    path("notifications/stream/", notifications_stream),
]
